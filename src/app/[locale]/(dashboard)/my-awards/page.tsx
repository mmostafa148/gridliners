import type { Metadata } from "next";
import { Download, Info } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { AwardMark } from "@/components/account/award-mark";
import { CollectAward } from "@/components/account/collect-award";
import { EntryCover } from "@/components/account/entry-cover";
import {
  AccountEmptyState,
  AccountNote,
  AccountPanel,
  AccountStack,
  CountPill,
  Eyebrow,
  Meta,
  PANEL_X,
  accountAction,
  accountRowAction,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { deliverablesFor } from "@/lib/account/files/deliverables";
import { requireParticipant } from "@/lib/auth/guard";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "awards" });
  return { title: t("title") };
}

/**
 * 2.7 — the honours.
 *
 * **The award is attached to the work that won it.** Each win is a full-width
 * band: the project's own cover to one edge, the ribbon, the level and year,
 * and the award's name — with **one** action, `Collect my award`, which opens
 * the certificate, badge, package and embed beneath it. §51 recorded the
 * previous page as download management: fifteen equal buttons across five
 * records.
 *
 * **Three meanings, three compositions.** A medal is an occasion and takes the
 * band. Finalist recognition is a standing, and takes a quiet strip with one
 * shared action. An honorary designation attaches to a person rather than an
 * entry (Addendum §21) and takes a black statement with no cover at all.
 *
 * A record per group result, not per entry: `e-101` holds Gold in one group and
 * Bronze in another, and each is its own certificate.
 */
export default async function MyAwardsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { participant } = await requireParticipant();

  const [t, tTier, tLevel, deliverables, entries, cycles, subCategories] = await Promise.all([
    getTranslations("awards"),
    getTranslations("tier"),
    getTranslations("awardLevel"),
    deliverablesFor(participant.id, locale),
    api.entries.list({ participantId: participant.id }),
    api.cycles.list(),
    api.taxonomy.subCategories(),
  ]);

  const finalists = entries.filter((e) => e.state === "shortlisted");
  const yearOf = new Map(cycles.map((c) => [c.id, c.year]));
  const parentOf = new Map(subCategories.map((sub) => [sub.id, sub.parentId]));
  const entryById = new Map(entries.map((e) => [e.id, e]));

  // Honorary designations naming this participant, by name rather than by
  // entry: §21 attaches one to a person or entity, and it may have no entry.
  const honorary = (await Promise.all(cycles.map((c) => api.results.honorary(c.id))))
    .flat()
    .filter((h) => h.published && h.subject.name === participant.name);

  const nothing = deliverables.length === 0 && finalists.length === 0 && honorary.length === 0;

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      <div className="account-shell pt-7 md:pt-9">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
          {deliverables.length ? (
            <CountPill>{deliverables.length}</CountPill>
          ) : null}
        </div>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("lead")}</p>
      </div>

      <div className="account-shell pb-[var(--account-y)] pt-6">
        {nothing ? (
          <AccountEmptyState title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <AccountStack>
            {deliverables.length ? (
              <>
                {/* Two facts true of every award below, said once, and as
                    notices rather than as loose grey sentences. */}
                <AccountNote tone="info" icon={Info}>
                  {t("provisionalBody")}
                </AccountNote>

                {/* One panel per award: the award is the unit, and a panel is
                    what gives it an edge. */}
                {deliverables.map((d) => {
                  const entry = entryById.get(d.entryId);
                  return (
                    <AccountPanel key={d.resultId}>
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
                        <span className="relative block w-fit shrink-0">
                          {entry ? (
                            <EntryCover
                              entry={entry}
                              parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                              className="size-24 sm:size-28"
                              sizes="112px"
                            />
                          ) : null}
                          <AwardMark
                            level={d.level}
                            year={d.cycleYear}
                            size="xs"
                            className="absolute -top-1 end-1"
                          />
                        </span>

                        <div className="flex min-w-0 flex-1 flex-col gap-5">
                          {/* The link to the public page belongs on the title's
                              line, not beside the disclosure — as a sibling of
                              an expanding panel it was centred against it and
                              floated into the middle of the card. */}
                          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-2">
                            <div className="min-w-0">
                              <Eyebrow tone="gold">
                                {tLevel(d.level)} · {d.cycleYear}
                              </Eyebrow>
                              <h2 className="mt-1.5 font-display text-account-section text-navy-900">
                                {d.entryTitle}
                              </h2>
                              <p className="mt-1 text-body-sm text-navy-600">
                                {d.group} · {tTier(d.tier as "students")} · {d.entryId}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
                              <Link
                                href={`/awards/${d.resultId}`}
                                className={cn(accountAction.quiet, "shrink-0")}
                              >
                                {t("publicPage")}
                              </Link>
                              <Link
                                href={`/projects/${d.entrySlug}`}
                                className={cn(accountAction.quiet, "shrink-0")}
                              >
                                {t("viewWork")}
                              </Link>
                            </div>
                          </div>

                          <CollectAward
                            resultId={d.resultId}
                            entrySlug={d.entrySlug}
                            level={d.level}
                            cycleYear={d.cycleYear}
                            locale={locale}
                          />
                        </div>
                      </div>
                    </AccountPanel>
                  );
                })}
              </>
            ) : null}

            {finalists.length ? (
              <AccountPanel
                title={t("recognitionTitle")}
                lead={t("finalistLead")}
                padded={false}
              >
                <ul className="flex flex-col">
                  {finalists.map((entry) => (
                    <li
                      key={entry.id}
                      className={cn(
                        "flex items-center gap-4 border-b border-navy-900/8 py-3 last:border-b-0",
                        PANEL_X,
                      )}
                    >
                      <EntryCover
                        entry={entry}
                        parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                        className="size-11 shrink-0"
                        sizes="44px"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-medium text-navy-900">
                          {entry.title}
                        </span>
                        <Meta className="block">
                          {t("year")} {yearOf.get(entry.cycleId)}
                        </Meta>
                      </span>
                      <a
                        href={`/${locale}/downloads/finalist-badge/${entry.id}`}
                        className={cn(accountRowAction.secondary, "shrink-0 gap-2")}
                      >
                        <Download aria-hidden className="size-3.5" />
                        {t("badge")}
                      </a>
                      <Link
                        href={`/entries/${entry.id}`}
                        className={cn(accountAction.quiet, "hidden shrink-0 sm:inline-flex")}
                      >
                        {t("viewEntry")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccountPanel>
            ) : null}

            {honorary.length ? (
              <AccountPanel title={t("honoraryTitle")} padded={false}>
                {/* §21's black. The designation is the only thing on this page
                    not attached to an entry, and the dark surface says so. */}
                <ul className="flex flex-col">
                  {honorary.map((h) => (
                    <li
                      key={h.id}
                      className="flex flex-col gap-5 bg-[#111111] p-6 text-cream-50 sm:flex-row sm:items-start sm:gap-7"
                    >
                      <AwardMark level="honorary" size="sm" />
                      <div className="min-w-0">
                        <Eyebrow tone="onNavy">{h.type.replace(/_/g, " ")}</Eyebrow>
                        <h3 className="mt-1.5 font-display text-account-section text-cream-50">
                          {h.subject.name}
                        </h3>
                        <p className="mt-2.5 max-w-[68ch] text-body-sm leading-relaxed text-cream-200/85">
                          {h.citation[locale]}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </AccountPanel>
            ) : null}
          </AccountStack>
        )}
      </div>
    </AccountShell>
  );
}
