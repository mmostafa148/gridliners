import { getLocale, getTranslations } from "next-intl/server";

import { ArchiveYears } from "@/components/marketing/archive-years";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { EventOverview } from "@/components/marketing/event-overview";
import { PageHeader } from "@/components/marketing/page-header";
import { ShortlistBoard } from "@/components/marketing/shortlist-board";
import { VotingBanner } from "@/components/marketing/voting-banner";
import { api } from "@/lib/api";
import { ceremonyHeld } from "@/lib/cycle-phase";
import { finalistYears, votingIsOpen, type YearShortlist } from "@/lib/finalists";
import { toShortlistView } from "@/lib/finalists-view";
import type { Locale } from "@/i18n/routing";

/**
 * One year's finalists, whole.
 *
 * Rendered by both routes. `/finalists/<year>` names its year; `/finalists`
 * resolves the running cycle and renders the same thing, because an index whose
 * only job was to send a reader somewhere else was a page with no finalists on
 * it at the end of the site's own "Finalists" link (§1.6 `[map-update]`,
 * 2026-08-24). Keeping the composition in one place is what stops the two
 * drifting into two different screens.
 *
 * The page ends on the rest of the archive, so every year reaches every other
 * year without going back up a level.
 */
export async function FinalistsYear({ shortlist }: { shortlist: YearShortlist }) {
  const year = shortlist.cycle.year;

  // `getLocale` on its own: `check-messages` binds namespaces to destructured
  // names positionally, so a non-`getTranslations` member in the same
  // `Promise.all` shifts every binding after it by one.
  const locale = (await getLocale()) as Locale;
  const [t, tClosing, activeCycle, years, ceremonies] = await Promise.all([
    getTranslations("finalists.header"),
    getTranslations("finalists.closing"),
    api.cycles.getActive(),
    finalistYears(),
    api.content.ceremonies(),
  ]);

  const edition = ceremonies.find((row) => row.year === year) ?? null;

  return (
    <>
      {/* The year is the title. An eyebrow saying "Finalists" and a title
          saying "Finalists 2026" would print the same word twice, and the year
          is the only part of this heading that changes. */}
      {/* The year is the title, and the header carries nothing else. A count
          line, the ordering note and a year switcher all lived here and all
          left for their own reasons: the filter bar publishes the total, the
          lead absorbed the ordering statement, and the other-years list at the
          foot is the better of the two ways to change year - it carries each
          year's finalist count, its ceremony city and whether its voting is
          open, against a row of bare years (§1.6 `[map-update]`, 2026-08-25). */}
      {/* The page name is the title and the year is the label above it - the
          arrangement every other inner page already uses. */}
      <PageHeader eyebrow={String(year)} title={t("title")} lead={t("lead")} />

      {/* The shortlist first. The page is called Finalists and this is the
          payload; the ceremony overview and the voting banner used to stand
          between the hero and the first name, which at a real cycle's volume is
          three screens of preamble before any work (§1.6 `[map-update]`,
          2026-08-25). */}
      {/* Three tier sections, always all three, in the model's own tier order,
          with the category filter across them. Resolved on the server and
          handed over as plain data - see `lib/finalists-view.ts`. */}
      <ShortlistBoard view={toShortlistView(shortlist, locale)} />

      {/* The phase, never a date, and only on the year the phase belongs to.
          An archived year is closed however its stored window reads.

          It reads after the field it describes rather than before it: the
          announcement bar and the header's phase action already state that
          voting is open, above the fold on every page, so what is left here is
          the explanation - who decided what, and how a vote is cast - and that
          belongs with the work it is about. */}
      {votingIsOpen(activeCycle, year) ? <VotingBanner /> : null}

      {/* Photography only on a year whose ceremony has happened. On the open
          year this publishes the city and the venue and nothing else: a stage
          frame under a heading naming a year still in `voting` reads as a
          record of a night that has not taken place, which is the one thing
          this page cannot say. */}
      <EventOverview edition={edition} held={ceremonyHeld(shortlist.cycle)} />

      <ArchiveYears
        years={years}
        activeCycle={activeCycle}
        ceremonies={ceremonies}
        current={year}
      />

      {/* `selfPrimaryFallback`, because during `voting` the phase's own primary
          action is this exact route. Without it the page would close on a
          button back to the top of itself. */}
      {/* `ArchiveYears` sits directly above and it is mist, so the seam's cells
          are mist. Left at the navy default they were a dark staircase cutting
          across a light ground - the seam reading as a cut, which is the one
          thing the device must not do. */}
      <ClosingCta
        cycle={activeCycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        groundAbove="bg-mist"
        selfHref={`/finalists/${activeCycle.year}`}
        selfPrimaryFallback
      />
    </>
  );
}
