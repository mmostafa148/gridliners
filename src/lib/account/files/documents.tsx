import "server-only";

import { ImageResponse } from "next/og";

/**
 * The certificate and the invoice, composed as pictures and wrapped as PDFs.
 *
 * **Rendered through `ImageResponse` because it shapes Arabic correctly**, which
 * is the whole reason these are not drawn as PDF text — see `pdf.ts`. The
 * approach and its font substitution are the ones 1.8's share card already
 * proved: Noto Sans Arabic cannot be shaped by satori, and IBM Plex Sans Arabic
 * is the nearest humanist sans that can.
 *
 * **The known certificate errata are not reproduced.** The brand deck's
 * certificate artwork carries a stale name, a wrong year and a missing tier
 * line, so this
 * is drawn from the record instead, and the tier is on it.
 */

const LATIN = "Inter";
const ARABIC = "IBM Plex Sans Arabic";

let fontCache: Promise<{ name: string; data: ArrayBuffer }[]> | null = null;

async function faceFor(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@400;700&display=swap`,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((https:[^)]+\.(?:ttf|otf))\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

/** One fetch per process, a fresh copy per render: ImageResponse detaches it. */
async function fonts() {
  fontCache ??= (async () => {
    const [latin, arabic] = await Promise.all([
      faceFor(LATIN),
      faceFor(ARABIC.replace(/ /g, "+")),
    ]);
    return [
      ...(latin ? [{ name: LATIN, data: latin }] : []),
      ...(arabic ? [{ name: ARABIC, data: arabic }] : []),
    ];
  })();
  return (await fontCache).map((font) => ({ ...font, data: font.data.slice(0) }));
}

/** True when a string carries Arabic script, so the right face is chosen. */
function isArabic(value: string): boolean {
  return /[؀-ۿ]/.test(value);
}

const METAL: Record<string, string> = {
  gold: "#d4a64a",
  silver: "#9ea2ab",
  bronze: "#a06842",
  finalist: "#2123bc",
  honorary: "#111111",
};

export interface CertificateInput {
  participantName: string;
  projectTitle: string;
  group: string;
  tier: string;
  level: string;
  levelLabel: string;
  year: number;
  entryId: string;
  resultId: string;
}

export async function certificatePng(input: CertificateInput): Promise<Buffer> {
  const loaded = await fonts();
  const metal = METAL[input.level] ?? "#2123bc";
  const rtl = isArabic(input.participantName) || isArabic(input.projectTitle);
  const family = rtl ? ARABIC : LATIN;

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdf9ef",
          padding: 90,
          fontFamily: family,
          direction: rtl ? "rtl" : "ltr",
        }}
      >
        {/* The identity's field, in the metal of the award. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            ...(rtl ? { left: 0 } : { right: 0 }), // rtl-ok: satori has no logical insets
            display: "flex",
            flexWrap: "wrap",
            width: 396,
          }}
        >
          {[0.2, 0.08, 0.14, 0.06, 0.18, 0.1, 0.16, 0.05, 0.12].map((alpha, i) => (
            <div key={i} style={{ width: 132, height: 132, background: metal, opacity: alpha }} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#5b6478" }}>
            GRIDLINERS AWARDS {input.year}
          </div>
          <div style={{ display: "flex", height: 3, width: 220, background: metal }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, position: "relative" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 5, color: metal }}>
            {input.levelLabel.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 62, lineHeight: 1.15, color: "#0a1a3c", maxWidth: 1000 }}>
            {input.projectTitle}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#26324d", maxWidth: 1000 }}>
            {input.participantName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", height: 1, width: "100%", background: "#0a1a3c", opacity: 0.2 }} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", fontSize: 17, letterSpacing: 3, color: "#5b6478" }}>
                CATEGORY
              </div>
              <div style={{ display: "flex", fontSize: 24, color: "#0a1a3c" }}>{input.group}</div>
            </div>
            {/* The tier line the brand deck's artwork omits. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", fontSize: 17, letterSpacing: 3, color: "#5b6478" }}>
                TIER
              </div>
              <div style={{ display: "flex", fontSize: 24, color: "#0a1a3c" }}>{input.tier}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", fontSize: 17, letterSpacing: 3, color: "#5b6478" }}>
                REFERENCE
              </div>
              <div style={{ display: "flex", fontSize: 24, color: "#0a1a3c" }}>
                {input.entryId} / {input.resultId}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 16, color: "#8a92a3" }}>
            Provisional certificate generated for review. Not the final printed award.
          </div>
        </div>
      </div>
    ),
    { width: 1600, height: 1131, fonts: loaded.length ? loaded : undefined },
  );

  return Buffer.from(await response.arrayBuffer());
}

export interface InvoiceInput {
  invoiceNumber: string;
  paymentId: string;
  issuedAt: string;
  participantName: string;
  participantEmail: string;
  entryTitle: string;
  entryId: string;
  kindLabel: string;
  methodLabel: string;
  statusLabel: string;
  lines: { label: string; amountUsd: number }[];
  totalUsd: number;
}

export async function invoicePng(input: InvoiceInput): Promise<Buffer> {
  const loaded = await fonts();
  const rtl = isArabic(input.participantName) || isArabic(input.entryTitle);

  const row = (label: string, value: string, strong = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 24, paddingTop: 10, paddingBottom: 10 }}>
      <div style={{ display: "flex", fontSize: 22, color: strong ? "#0a1a3c" : "#5b6478" }}>{label}</div>
      <div style={{ display: "flex", fontSize: 22, color: "#0a1a3c" }}>{value}</div>
    </div>
  );

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          padding: 80,
          fontFamily: rtl ? ARABIC : LATIN,
          direction: rtl ? "rtl" : "ltr",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", fontSize: 20, letterSpacing: 5, color: "#5b6478" }}>
              GRIDLINERS AWARDS
            </div>
            <div style={{ display: "flex", fontSize: 40, color: "#0a1a3c" }}>Invoice</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontSize: 24, color: "#0a1a3c" }}>{input.invoiceNumber}</div>
            <div style={{ display: "flex", fontSize: 19, color: "#5b6478" }}>{input.issuedAt}</div>
          </div>
        </div>

        <div style={{ display: "flex", height: 2, width: "100%", background: "#2123bc", marginTop: 28, marginBottom: 28 }} />

        <div style={{ display: "flex", justifyContent: "space-between", gap: 48, marginBottom: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 460 }}>
            <div style={{ display: "flex", fontSize: 17, letterSpacing: 3, color: "#5b6478" }}>BILLED TO</div>
            <div style={{ display: "flex", fontSize: 24, color: "#0a1a3c" }}>{input.participantName}</div>
            <div style={{ display: "flex", fontSize: 19, color: "#5b6478" }}>{input.participantEmail}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 460 }}>
            <div style={{ display: "flex", fontSize: 17, letterSpacing: 3, color: "#5b6478" }}>ENTRY</div>
            <div style={{ display: "flex", fontSize: 24, color: "#0a1a3c" }}>{input.entryTitle}</div>
            <div style={{ display: "flex", fontSize: 19, color: "#5b6478" }}>{input.entryId}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", height: 1, width: "100%", background: "#0a1a3c", opacity: 0.15 }} />
          {input.lines.map((line, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(10,26,60,0.1)" }}>
              {row(line.label, `$${line.amountUsd.toFixed(2)}`)}
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid rgba(10,26,60,0.35)", marginTop: 12 }}>
            {row("Total", `$${input.totalUsd.toFixed(2)}`, true)}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 32, marginTop: 24 }}>
          <div style={{ display: "flex", fontSize: 19, color: "#5b6478" }}>
            {input.kindLabel} · {input.methodLabel} · {input.statusLabel} · {input.paymentId}
          </div>
          <div style={{ display: "flex", fontSize: 17, color: "#8a92a3" }}>
            Provisional invoice generated for review.
          </div>
        </div>
      </div>
    ),
    { width: 1240, height: 1754, fonts: loaded.length ? loaded : undefined },
  );

  return Buffer.from(await response.arrayBuffer());
}
