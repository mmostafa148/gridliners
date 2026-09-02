import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/marketing/page-header";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { WinnersYear } from "@/components/marketing/winners-year";
import { EmptyState } from "@/components/shared/status-patterns";
import { api } from "@/lib/api";
import { latestWinnerYear, yearWinners } from "@/lib/winners";

/**
 * Winners with no year — the latest published edition.
 *
 * **Five committed links point here** and none of them points at a year: the
 * header nav, the footer, Home's featured-winner block twice, and Home's
 * quick-navigate. Every one is a "show me the winners" context, and Home
 * resolves its featured podiums with `latestPublishedCycle()` and links them
 * straight to this route - so a reader who clicks a 2025 podium has to land on
 * 2025's winners rather than on a list of years (§1.7 `[map-update]`,
 * 2026-08-28).
 *
 * **It cannot mean "the running cycle".** 2026 has no published results, so
 * that reading puts an empty page behind the site's main Winners link. It means
 * the newest year that actually published, which is what `latestWinnerYear`
 * returns and what `phasePresentation` leaves free by owning `/winners/<year>`
 * for its own deep links.
 *
 * Rendered through the same `WinnersYear` composition as a year page, so the
 * two routes cannot drift into two screens.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "winners.meta" });
  return { title: tMeta("titleFallback"), description: tMeta("description") };
}

export default async function WinnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const year = await latestWinnerYear();
  const winners = year === null ? null : await yearWinners(year);

  if (winners) return <WinnersYear winners={winners} />;

  // Nothing has ever published. Not reachable with the current fixtures, and
  // deliberately not a 404: the route is linked from the header of every page,
  // so it has to resolve to something that explains itself.
  const [t, tClosing, cycle] = await Promise.all([
    getTranslations("winners"),
    getTranslations("winners.closing"),
    api.cycles.getActive(),
  ]);

  return (
    <>
      <PageHeader title={t("meta.titleFallback")} lead={t("lead")} />

      <section className="bg-white text-navy-900">
        <div className="page-shell section-y">
          <EmptyState
            title={t("noneEver.title")}
            description={t("noneEver.description")}
          />
        </div>
      </section>

      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        groundAbove="bg-white"
        selfHref="/winners"
        selfPrimaryFallback
      />
    </>
  );
}
