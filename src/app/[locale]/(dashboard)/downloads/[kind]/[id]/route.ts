import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { badgeSvg, type BadgeKind } from "@/lib/account/files/badges";
import { certificatePng, invoicePng } from "@/lib/account/files/documents";
import { deliverableById } from "@/lib/account/files/deliverables";
import { pdfFromPng } from "@/lib/account/files/pdf";
import { zip } from "@/lib/account/files/zip";
import { getSession } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

/**
 * Every download in the participant module, behind one authorized route.
 *
 * **The session is resolved here, not trusted from the URL.** A download route
 * that took a participant id as a parameter would hand anybody else's
 * certificate to anybody who could guess a result id; this asks who is calling
 * and resolves the deliverable against them, so a foreign id is a 404.
 *
 * **The files are real.** A certificate is a valid PDF, a badge is a valid SVG,
 * an invoice is a valid PDF and a package is a valid ZIP - generated on demand
 * from the record rather than served from a folder of samples, so the name, the
 * project, the group, the tier, the medal and the year on each one are this
 * participant's own.
 *
 * Filenames are stable and meaningful: the same result always produces the same
 * name, so a folder of them sorts and a re-download overwrites rather than
 * accumulating "(1)".
 */

const LEVEL_LABEL: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "gridliners"
  );
}

/**
 * `Content-Disposition` for a filename that may not be ASCII.
 *
 * **A header value is a ByteString**, so any character above 255 throws when it
 * is assigned - and `slugify` above keeps Arabic letters, because `\p{L}`
 * matches them. Every Arabic-titled entry therefore returned a **500** from
 * this route: certificates, badges, winner packages and finalist badges alike.
 * Invoices escaped only because their name is built from a payment reference,
 * which is ASCII.
 *
 * RFC 6266 is the answer and it is why `filename*` exists: an ASCII fallback
 * for anything that cannot read the extended form, and the real UTF-8 name
 * percent-encoded beside it. Browsers prefer `filename*`, so an Arabic name
 * still arrives intact.
 */
function contentDisposition(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot > 0 ? filename.slice(dot) : "";
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  // Quotes and backslashes would end the quoted string early; non-ASCII is what
  // throws. What survives can be empty - an entirely Arabic name - so it falls
  // back to the programme's own name rather than to a bare extension.
  const ascii =
    base.replace(/[^\x20-\x7E]/g, "").replace(/["\\]+/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") ||
    "gridliners";
  return `attachment; filename="${ascii}${ext}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function fileResponse(body: Buffer | string, type: string, filename: string) {
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": contentDisposition(filename),
      // Generated per request from live data; a cached certificate would
      // survive a correction to the record it is drawn from.
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; kind: string; id: string }> },
) {
  const { locale: rawLocale, kind, id } = await params;
  const locale = rawLocale as Locale;

  const session = await getSession();
  if (!session || session.role !== "participant" || !session.participantId) notFound();
  const participantId = session.participantId;

  // ---- invoice -------------------------------------------------------------
  if (kind === "invoice") {
    const payments = await api.payments.forParticipant(participantId);
    const payment = payments.find((p) => p.id === id);
    if (!payment) notFound();

    const [entry, participant, tKind, tMethod, tStatus] = await Promise.all([
      api.entries.getById(payment.entryId),
      api.participants.getById(participantId),
      getTranslations({ locale, namespace: "paymentKind" }),
      getTranslations({ locale, namespace: "paymentMethod" }),
      getTranslations({ locale, namespace: "paymentStatus" }),
    ]);

    const snapshot = payment.snapshot;
    // The stored snapshot, never a fresh calculation. Re-pricing an old payment
    // with today's config is how a receipt stops matching what was charged.
    const lines = snapshot
      ? [
          { label: `Base entry (${snapshot.tier}, ${snapshot.window})`, amountUsd: snapshot.basePriceUsd },
          ...snapshot.additionalSubCategories.map((line) => ({
            label: `Add-on · ${line.label.en}`,
            amountUsd: line.amountUsd,
          })),
          ...(snapshot.loyalty
            ? [{ label: `Loyalty −${snapshot.loyalty.percentOff}%`, amountUsd: -snapshot.loyalty.amountUsd }]
            : []),
          ...(snapshot.promo
            ? [{ label: `Promo ${snapshot.promo.code}`, amountUsd: -snapshot.promo.amountUsd }]
            : []),
          ...(snapshot.credit
            ? [{ label: `Credit ${snapshot.credit.code}`, amountUsd: -snapshot.credit.amountUsd }]
            : []),
        ]
      : [{ label: tKind(payment.kind), amountUsd: payment.amountUsd }];

    const png = await invoicePng({
      invoiceNumber: payment.invoiceNumber,
      paymentId: payment.id,
      issuedAt: new Date(payment.createdAt).toISOString().slice(0, 10),
      participantName: participant?.name ?? "",
      participantEmail: participant?.email ?? "",
      entryTitle: entry?.title ?? payment.entryId,
      entryId: payment.entryId,
      kindLabel: tKind(payment.kind),
      methodLabel: tMethod(payment.method),
      statusLabel: tStatus(payment.status),
      lines,
      totalUsd: payment.amountUsd,
    });

    return fileResponse(
      pdfFromPng(png, `Invoice ${payment.invoiceNumber}`),
      "application/pdf",
      `gridliners-invoice-${payment.invoiceNumber}.pdf`,
    );
  }

  // ---- the finalist badge: an entry, not a result --------------------------
  if (kind === "finalist-badge") {
    const entry = await api.entries.getById(id);
    if (!entry || entry.participantId !== participantId || entry.state !== "shortlisted") notFound();
    const cycle = await api.cycles.getById(entry.cycleId);
    const svg = badgeSvg({
      kind: "finalist",
      label: "Finalist",
      group: entry.title,
      year: cycle?.year ?? 0,
    });
    return fileResponse(
      svg,
      "image/svg+xml",
      `gridliners-${cycle?.year}-finalist-${slugify(entry.title)}.svg`,
    );
  }

  // ---- everything else hangs off a group result ---------------------------
  const deliverable = await deliverableById(participantId, id, locale);
  if (!deliverable) notFound();
  const stem = `gridliners-${deliverable.cycleYear}-${deliverable.level}-${slugify(deliverable.entryTitle)}`;

  if (kind === "badge") {
    const svg = badgeSvg({
      kind: deliverable.level as BadgeKind,
      label: LEVEL_LABEL[deliverable.level] ?? deliverable.level,
      group: deliverable.group,
      year: deliverable.cycleYear,
    });
    return fileResponse(svg, "image/svg+xml", `${stem}-badge.svg`);
  }

  if (kind === "certificate") {
    const tTier = await getTranslations({ locale, namespace: "tier" });
    const png = await certificatePng({
      participantName: deliverable.participantName,
      projectTitle: deliverable.entryTitle,
      group: deliverable.group,
      tier: tTier(deliverable.tier as "students"),
      level: deliverable.level,
      levelLabel: LEVEL_LABEL[deliverable.level] ?? deliverable.level,
      year: deliverable.cycleYear,
      entryId: deliverable.entryId,
      resultId: deliverable.resultId,
    });
    return fileResponse(
      pdfFromPng(png, `${deliverable.entryTitle} — ${LEVEL_LABEL[deliverable.level]}`),
      "application/pdf",
      `${stem}-certificate.pdf`,
    );
  }

  if (kind === "package") {
    const tTier = await getTranslations({ locale, namespace: "tier" });
    const level = LEVEL_LABEL[deliverable.level] ?? deliverable.level;
    const png = await certificatePng({
      participantName: deliverable.participantName,
      projectTitle: deliverable.entryTitle,
      group: deliverable.group,
      tier: tTier(deliverable.tier as "students"),
      level: deliverable.level,
      levelLabel: level,
      year: deliverable.cycleYear,
      entryId: deliverable.entryId,
      resultId: deliverable.resultId,
    });

    // A manifest, so the archive explains itself six months from now.
    const readme = [
      `GRIDLINERS AWARDS ${deliverable.cycleYear} — WINNERS PACKAGE`,
      "",
      `Project     ${deliverable.entryTitle}`,
      `Participant ${deliverable.participantName}`,
      `Award       ${level}`,
      `Category    ${deliverable.group}`,
      `Tier        ${tTier(deliverable.tier as "students")}`,
      `Entry       ${deliverable.entryId}`,
      `Result      ${deliverable.resultId}`,
      "",
      "CONTENTS",
      `  certificate.pdf   The provisional certificate for this award.`,
      `  badge.svg         The ${level.toLowerCase()} badge, for your own site.`,
      `  embed.html        The snippet that shows the badge and links back.`,
      `  readme.txt        This file.`,
      "",
      "PROVISIONAL",
      "  Everything in this package was generated for review. The final printed",
      "  certificate and the hosted award page are issued by the awards office.",
      "",
    ].join("\n");

    const embed = [
      // The award page, not the project: screen map 3.1 makes it the
      // badge-embed target, and it exists as of Phase 3.1.
      `<a href="https://gridliners.example/awards/${deliverable.resultId}" rel="noopener">`,
      `  <img src="badge.svg" width="402" height="150"`,
      `       alt="Gridliners Awards ${deliverable.cycleYear} — ${level}" />`,
      `</a>`,
      "",
    ].join("\n");

    const archive = zip([
      { name: "readme.txt", data: Buffer.from(readme, "utf8") },
      {
        name: "certificate.pdf",
        data: pdfFromPng(png, `${deliverable.entryTitle} — ${level}`),
      },
      {
        name: "badge.svg",
        data: Buffer.from(
          badgeSvg({
            kind: deliverable.level as BadgeKind,
            label: level,
            group: deliverable.group,
            year: deliverable.cycleYear,
          }),
          "utf8",
        ),
      },
      { name: "embed.html", data: Buffer.from(embed, "utf8") },
    ]);

    return fileResponse(archive, "application/zip", `${stem}-winners-package.zip`);
  }

  notFound();
}
