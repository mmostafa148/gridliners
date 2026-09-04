import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { ArrowRight } from "lucide-react";

import { ClosingCta } from "@/components/marketing/closing-cta";
import { ProjectGallery } from "@/components/marketing/project-gallery";
import { ProjectShareDock } from "@/components/marketing/project-share-dock";
import { WinnerPortrait } from "@/components/marketing/winner-portrait";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import {
  awardById,
  awardIds,
  type AwardColorway,
  type AwardView,
} from "@/lib/award";
import { countryName } from "@/lib/display-names";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * 3.1 — the hosted award page.
 *
 * **The record of one award, and the target of the badge embed.** A winner's
 * badge on their own site links here; so does My Awards. Until this route
 * existed the badge pointed at the project page, which is the work rather than
 * the award — related, but not the same claim.
 *
 * **It opens on the award, not on the work.** Every other page in this build
 * that carries a project opens on the project; this one opens on the metal,
 * because the award is its subject and the project is what the award is *for*.
 * The Winner Frame is the identity's own artwork for exactly this.
 *
 * **The year is set, not stamped.** `winner-year-2026.svg` exists in the brand
 * set and is locked to 2026 — the same fault `AwardMark` was built to avoid
 * (build-state §50). A 2025 award may not carry a 2026 plate, so the year is
 * typeset beside the frame in the display face.
 *
 * **Honorary designations take the same route and a different composition:**
 * black, no tier line, and the citation as the page's substance (Addendum §21,
 * screen map 3.1).
 */

export async function generateStaticParams() {
  return (await awardIds()).map((resultId) => ({ resultId }));
}

async function load(params: Promise<{ locale: Locale; resultId: string }>) {
  const { locale, resultId } = await params;
  return {
    locale,
    award: await awardById(decodeURIComponent(resultId), locale),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; resultId: string }>;
}): Promise<Metadata> {
  const { locale, award } = await load(params);
  if (!award) return {};

  const [t, tLevel, tType] = await Promise.all([
    getTranslations({ locale, namespace: "award" }),
    getTranslations({ locale, namespace: "awardLevel" }),
    getTranslations({ locale, namespace: "honoraryType" }),
  ]);

  const title =
    award.kind === "medal"
      ? t("metaTitle", {
          holder: award.holder,
          level: tLevel(award.level),
          year: award.cycle.year,
        })
      : t("metaTitle", {
          holder: award.holder,
          level: tType(award.type),
          year: award.cycle.year,
        });

  const description =
    award.kind === "medal"
      ? t("metaDescription", {
          project: award.entry?.title ?? award.holder,
          level: tLevel(award.level),
          group: award.subCategory.name[locale],
          year: award.cycle.year,
        })
      : t("metaHonorary", {
          holder: award.holder,
          type: tType(award.type),
          year: award.cycle.year,
        });

  // Absolute, built from SITE_URL rather than `metadataBase`, which the root
  // layout does not set — the same call 1.8 makes for the same reason.
  const canonical = `${SITE_URL}/${locale}/awards/${encodeURIComponent(award.id)}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "article" },
  };
}

/**
 * The award's metal, in the three roles the approved winners card gives it:
 * cells over the portrait, a rule across the head, and a plate at its end.
 * Taken from `winners-board.tsx` rather than re-invented, because this page is
 * the detail view of that card and must not speak a second dialect.
 */
const METAL: Record<
  AwardColorway,
  { cell: string; rule: string; plate: string; ink: string }
> = {
  gold: {
    cell: "bg-gold",
    rule: "bg-gold",
    plate: "bg-gold text-navy-900",
    ink: "text-gold",
  },
  silver: {
    cell: "bg-silver",
    rule: "bg-silver",
    plate: "bg-silver text-navy-900",
    ink: "text-silver",
  },
  bronze: {
    cell: "bg-bronze",
    rule: "bg-bronze",
    plate: "bg-bronze text-white",
    ink: "text-bronze",
  },
  honorary: {
    cell: "bg-cream-100",
    rule: "bg-cream-100",
    plate: "bg-cream-100 text-navy-900",
    ink: "text-cream-100",
  },
};

/** The place, as the winners page states it. */
const RANK: Record<string, string> = { gold: "01", silver: "02", bronze: "03" };

/**
 * The supplied portraits, chosen the way the winners page chooses them.
 *
 * Four monochrome photographs per award system, alternated by position there;
 * here there is one award per page, so the id seeds the choice instead. They
 * are placeholder photography from the brand deck, registered as such - the
 * client's own winners will replace them.
 */
const PORTRAITS: Record<AwardColorway, string[]> = {
  gold: ["/media/winners/gold.webp", "/media/winners/gold.webp"],
  silver: ["/media/winners/silver.webp", "/media/winners/silver.webp"],
  bronze: ["/media/winners/bronze.webp", "/media/winners/bronze.webp"],
  honorary: [
    "/media/winners/honorary.webp",
    "/media/winners/honorary.webp",
  ],
};

function portraitFor(award: AwardView): string {
  const pool = PORTRAITS[award.colorway];
  // Deterministic per award, so a page does not change photograph between
  // builds or between locales.
  const seed = [...award.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  return pool[seed % pool.length];
}

export default async function AwardPage({
  params,
}: {
  params: Promise<{ locale: Locale; resultId: string }>;
}) {
  const { locale, award } = await load(params);
  if (!award) notFound();
  setRequestLocale(locale);

  // Awaited separately: `check-messages` reads a `Promise.all` positionally and
  // binds one namespace per destructured name, so a non-`getTranslations` entry
  // in the array would shift every binding after it.
  const format = await getFormatter();
  const [t, tLevel, tType, tTier, tWinners, tClosing, cycle] =
    await Promise.all([
      getTranslations("award"),
      getTranslations("awardLevel"),
      getTranslations("honoraryType"),
      getTranslations("tier"),
      getTranslations("winners"),
      getTranslations("winners.closing"),
      api.cycles.getActive(),
    ]);

  const name = award.kind === "medal" ? tLevel(award.level) : tType(award.type);
  const shareUrl = `${SITE_URL}/${locale}/awards/${encodeURIComponent(award.id)}`;
  const metal = METAL[award.colorway];
  const contentDir = award.entry?.contentLanguage === "ar" ? "rtl" : "ltr";

  return (
    <>
      {/* ---- the winner, the metal and the record ------------------------ */}
      <section className="bg-navy-950 pt-[4.5rem] text-cream-100">
        <div className="grid md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <WinnerPortrait
            photo={portraitFor(award)}
            slug={award.id}
            metal={metal.cell}
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="min-h-[24rem] bg-transparent md:min-h-[36rem]"
          />

          <div className="flex flex-col justify-center gap-7 px-6 py-12 sm:px-10 md:py-16 lg:px-14">
            {/* The head, the same device the winners card uses: the award word
                at the start, the metal across the measure, the place on its own
                plate at the far end. */}
            <span className="flex items-center gap-5">
              <span className="shrink-0 font-display text-coord uppercase text-cream-200/70">
                {t("official")}
              </span>
              <span aria-hidden className={cn("h-px flex-1", metal.rule)} />
              <span
                aria-hidden
                className={cn(
                  "shrink-0 px-4 py-1.5 font-data text-data-lg leading-none tabular-nums",
                  metal.plate,
                )}
              >
                {award.kind === "medal" ? RANK[award.level] : award.cycle.year}
              </span>
            </span>

            <p className={cn("font-display text-h2 uppercase", metal.ink)}>
              {name}
            </p>

            <h1 className="text-balance font-display text-display-md leading-[0.95] text-cream-50">
              {award.holder}
            </h1>

            {/* Group, tier and country on one line, slash-separated, exactly as
                the winners card sets its own record line. */}
            <p className="flex flex-wrap items-baseline gap-x-3 font-display text-coord uppercase text-cream-200/70">
              {award.kind === "medal" ? (
                <>
                  <span className="text-cream-50">
                    {award.subCategory.name[locale]}
                  </span>
                  <span aria-hidden className="text-cream-200/30">
                    /
                  </span>
                  <span>{tTier(award.tier)}</span>
                  {award.entry ? (
                    <>
                      <span aria-hidden className="text-cream-200/30">
                        /
                      </span>
                      <span>{countryName(award.entry.country, locale)}</span>
                    </>
                  ) : null}
                </>
              ) : (
                <span className="text-cream-50">{t("citation")}</span>
              )}
            </p>

            {award.kind === "honorary" ? (
              <p className="max-w-[52ch] text-body-lg leading-relaxed text-cream-100">
                {award.citation}
              </p>
            ) : null}

            <p className="max-w-[56ch] text-body-sm text-cream-200/70">
              {award.kind === "medal"
                ? t("officialNote", { year: award.cycle.year })
                : t("honoraryNote")}
            </p>

            {/* The count closes the record, on its own rule, the way the card
                foot does. An honorary designation is not voted, so it has no
                count and gets the year instead. */}
            {award.kind === "medal" ? (
              <p className="mt-3 flex items-center gap-2 border-t border-cream-50/20 pt-5 font-display text-coord uppercase text-cream-200/70">
                <span className="font-data text-data-md tabular-nums text-cream-50">
                  {format.number(award.votes)}
                </span>
                {t("votes")}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---- the work it was given for ----------------------------------- */}
      {award.entry ? (
        <>
          {/* The work, as a strip.
           *
           * The record used to run down a narrow column with the measure empty
           * beside it, which read as a caption to the pictures rather than the
           * record of what won. It is a band of its own now - its own ground,
           * ruled above and below - and its four parts are spread across the
           * full measure with a hairline between each.
           *
           * The rules are `border-s`, so they sit between the columns in both
           * directions. They appear from `lg`, where there is width for four
           * columns; below that the strip stacks and the rules would divide
           * nothing. */}
          <section className="border-y border-navy-900/12 bg-white">
            <div className="page-shell">
              <div className="grid gap-y-9 py-12 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto] lg:gap-y-0">
                <div className="lg:pe-8">
                  <h2 className="text-balance font-display text-h2 leading-tight text-navy-950">
                    <bdi lang={award.entry.contentLanguage} dir={contentDir}>
                      {award.entry.title}
                    </bdi>
                  </h2>
                  {award.entry.client ? (
                    <p className="mt-3 font-display text-coord uppercase text-navy-600">
                      {award.entry.client}
                    </p>
                  ) : null}
                </div>

                <p className="text-body-lg text-navy-700 lg:border-s lg:border-navy-900/12 lg:px-8">
                  <bdi lang={award.entry.contentLanguage} dir={contentDir}>
                    {award.entry.description}
                  </bdi>
                </p>

                <div className="lg:border-s lg:border-navy-900/12 lg:ps-8">
                  <Link
                    href={`/projects/${award.entry.slug}`}
                    className="group inline-flex items-center gap-3 bg-navy-900 px-7 py-3.5 font-display text-coord uppercase text-cream-50 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    {t("viewProject")}
                    <ArrowRight
                      aria-hidden
                      className="size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <ProjectGallery images={award.gallery} title={award.entry.title} framed />
        </>
      ) : null}

      {/* The page closes on blue, the way every approved public page does. */}
      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        groundAbove={
          award.entry
            ? award.gallery.length
              ? "bg-mist"
              : "bg-white"
            : "bg-navy-950"
        }
      />
      <ProjectShareDock url={shareUrl} title={`${name}, ${award.holder}`} />
      <span className="sr-only">{tWinners("votesUnit")}</span>
    </>
  );
}
