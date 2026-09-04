import { getTranslations } from "next-intl/server";

import { ClosingCta } from "@/components/marketing/closing-cta";
import { EventOverview } from "@/components/marketing/event-overview";
import { HonoraryStrip } from "@/components/marketing/honorary-strip";
import { PageHeader } from "@/components/marketing/page-header";
import { WinnerYears } from "@/components/marketing/winner-years";
import { WinnersBoard } from "@/components/marketing/winners-board";
import { EmptyState } from "@/components/shared/status-patterns";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { ceremonyHeld } from "@/lib/cycle-phase";
import type { YearWinners } from "@/lib/winners";
import { winnerYears } from "@/lib/winners";

/**
 * One year's winners, whole.
 *
 * Rendered by both routes. `/winners/<year>` names its year; `/winners`
 * resolves the newest year whose results are published and renders the same
 * thing, so the site's five bare `/winners` links land on winners rather than
 * on a doorway (§1.7 `[map-update]`, 2026-08-28). Keeping the composition in
 * one place is what stops the two drifting into two screens.
 *
 * **Winners first.** The page is called Winners; the honorary set and the
 * ceremony are context around the medals, and the archive is how you leave.
 * The map's bullet order is a checklist rather than a layout - 1.5 was approved
 * "in the client-directed order" against the same map - so this needs no
 * further update.
 */
export async function WinnersYear({ winners }: { winners: YearWinners }) {
  const year = winners.cycle.year;

  // `getLocale` is not needed here, but the binding rule still applies:
  // `check-messages` maps namespaces to destructured names positionally, so a
  // non-`getTranslations` member in this array would shift every binding after
  // it by one.
  const [t, tClosing, activeCycle, years, ceremonies, honoraryOptions] = await Promise.all([
    getTranslations("winners"),
    getTranslations("winners.closing"),
    api.cycles.getActive(),
    winnerYears(),
    api.content.ceremonies(),
    api.taxonomy.honoraryOptions(),
  ]);

  const edition = ceremonies.find((row) => row.year === year) ?? null;
  const hasResults = winners.medalCount > 0 || winners.honorary.length > 0;
  const hasOtherYears = years.some(({ cycle }) => cycle.year !== year);
  const ceremonyIsHeld = ceremonyHeld(winners.cycle);
  const lastTier = winners.tiers.at(-1);
  const winnersGround =
    lastTier && lastTier.medalCount % 2 === 1 ? "bg-mist" : "bg-white";
  const honoraryGround =
    winners.honorary.length % 2 === 1 ? "bg-mist" : "bg-white";
  const closingGround = hasOtherYears
    ? "bg-mist"
    : edition
      ? ceremonyIsHeld
        ? "bg-white"
        : "bg-navy-950"
      : winners.honorary.length
        ? honoraryGround
        : hasResults
          ? winnersGround
          : "bg-white";

  return (
    <>
      {/* The page name is the title and the year is the label above it, which
          is what every other inner page already does - About, Categories, How
          to Enter and Jury Panel all set `title` to the page's own name. These
          two were the exceptions, with the year as the `h1` and the page name
          shrunk to an eyebrow.

          Nothing under the plate any more: the years moved to the foot on the
          client's direction, which is where 1.6 put its own archive and why
          that screen's header switcher was struck out. One way to change year,
          not two. */}
      <PageHeader eyebrow={String(year)} title={t("title")} lead={t("lead")} />

      {hasResults ? (
        <WinnersBoard tiers={winners.tiers} />
      ) : (
        /* A real cycle whose results are not out. 2026 is in `voting`: its
           shortlist is public and its rankings are proposed only, so this
           states that and sends the reader to the finalists rather than
           404ing a year that plainly exists. */
        <section className="bg-white text-navy-900">
          <div className="page-shell section-y">
            <EmptyState
              title={t("unpublished.title", { year })}
              description={t("unpublished.description")}
              action={
                <Button asChild variant="outline" size="cta">
                  <Link href={`/finalists/${year}`}>{t("unpublished.action")}</Link>
                </Button>
              }
            />
          </div>
        </section>
      )}

      {/* Honorary after the medals: it is a different award system, not a
          fourth level, and reading it second is what says so. Omitted entirely
          when a year designated none. */}
      <HonoraryStrip designations={winners.honorary} options={honoraryOptions} />

      {/* Reused from 1.6 unchanged. A year with published results has had its
          ceremony, so `held` is true through the same phase check that screen
          uses; a year without one omits the section itself. */}
      <EventOverview edition={edition} held={ceremonyIsHeld} />

      {/* The archive at the foot, the way 1.6 ends. A reader who has finished
          this year's winners is exactly the reader who might want another one,
          and until here the page has given them no reason to leave. */}
      <WinnerYears years={years} ceremonies={ceremonies} current={year} />

      {/* `groundAbove` follows what actually renders above the seam: the
          archive is mist and `EventOverview` is white, and the archive omits
          itself when this is the only published edition. Left at the wrong one
          the seam's cells read as a staircase cut across the ground rather than
          a join. */}
      <ClosingCta
        cycle={activeCycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        groundAbove={closingGround}
        selfHref={`/winners/${year}`}
        selfPrimaryFallback
      />
    </>
  );
}
