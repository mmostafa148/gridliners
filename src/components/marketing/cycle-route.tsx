import { getFormatter, getTranslations } from "next-intl/server";

import type { Cycle, CyclePhase } from "@/lib/api/types";
import { PHASE_SEQUENCE, phaseIndex } from "@/lib/cycle-phase";
import { cn } from "@/lib/utils";

/**
 * The cycle as one route.
 *
 * This was two sections telling the same story twice: a grid of six steps
 * saying what happens, then a rail of six phases saying when. Six items, six
 * items, four of them the same item under two names, and neither one able to
 * answer "what happens next and when" without the reader holding both in their
 * head. They are one thing, so they are one section.
 *
 * The merge is not lossless by default and had to be handled: the step list
 * carried a Shortlist that is not a phase (it is the outcome of jury scoring,
 * which is where its copy now lives), and the phase list carried a
 * Configuration that had no step copy at all (it has one now). Nothing that was
 * on the page has left it.
 *
 * **Six cards**, three across at `lg`, two at `sm`, one on a phone. A stacked
 * ruled list and then a horizontal rail were both tried and both failed the
 * same way: text floating on bare ground with a hairline doing the only
 * structural work, and each fix they were given was a fix to type or to a rule,
 * which is the tell that the arrangement was the problem.
 *
 * Separate cards with air between them, at the same gap the tier plates on this
 * page use, so the two sections separate their parts by the same distance. Each
 * phase is a thing a reader takes in whole, and a card says that where a sixth
 * of a ruled plate said "part of a table".
 *
 * Phase names come from the `cyclePhase` namespace rather than a friendlier set
 * written for this section, so a phase is called the same thing here, in the
 * hero's status chip, and in the dashboard. One name per thing.
 *
 * The live phase inverts to navy rather than taking a tint. A gold wash went
 * muddy over a cool near-white when this section carried one, and would again;
 * an inverted cell is unmissable, uses the identity's own two grounds, and
 * needs no border, bar or panel to say "here".
 *
 * Nothing dims for a passed phase. A phase being over does not make its text
 * optional to read, and dimming prose is not a state — it is just harder to
 * read.
 *
 * The section used to carry a column head reading "Opens" over a caveat that
 * these dates are administered and can change. Both were cut on the client's
 * instruction. `enter.cycle.opens` still labels each date in the stacked
 * layout, where a date sits inline in a row and needs saying.
 *
 * The caveat is back, at the foot rather than the head. It is a required
 * disclosure — this section publishes six dates and nothing else on the site
 * says they can move — but it is not returning to the arrangement that was
 * rejected. As small print after the route it qualifies dates the reader has
 * just read, instead of standing over them as a header.
 */
export async function CycleRoute({ cycle }: { cycle: Cycle }) {
  const [t, tPhase, format] = await Promise.all([
    // `enter.cycle`, not `home.cycle`: this section was built for Home, moved
    // off it, and belongs to How to Enter now. Its copy moved with it.
    getTranslations("enter.cycle"),
    getTranslations("cyclePhase"),
    getFormatter(),
  ]);

  const startOf: Record<CyclePhase, string | null> = {
    configuration: null,
    submissions: cycle.submissionWindows.early_bird.start,
    verification: cycle.submissionWindows.late.end,
    jury_scoring: cycle.juryScoringPeriod.start,
    voting: cycle.votingWindow.start,
    results: cycle.resultsAnnouncementAt,
    closed: null,
  };

  const current = phaseIndex(cycle.phase);

  const stations = PHASE_SEQUENCE.map((phase, i) => ({
    phase,
    i,
    name: tPhase(phase),
    body: t(`body.${phase}`),
    // UTC, the zone the cycle's windows are authored in. Verification opens on
    // the instant submissions close, which is 23:59:59Z; rendered in the app's
    // Asia/Dubai zone that is the small hours of the next morning, so the row
    // printed a date a day past the one the cycle actually closes on. Phases
    // that start at 00:00:00Z were unaffected, which is what hid it.
    date: startOf[phase]
      ? format.dateTime(new Date(startOf[phase]!), {
          dateStyle: "medium",
          timeZone: "UTC",
        })
      : null,
    isCurrent: i === current,
    isPast: i < current,
  }));

  return (
    <section className="bg-white">
      <div className="page-shell section-y">
        {/* Rendered inline rather than through `SectionHeading`, so the head
            fills the width the way the cost section's does. The shared
            component stacks all three on the start edge, which left this
            section opening on half a row of empty white — and it is used by
            two components that have not reached a page yet, so changing it
            would be changing something nothing has reviewed. */}
        <div className="grid gap-x-16 gap-y-5 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="font-display text-coord uppercase text-blue-700">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 text-h1 text-balance">{t("title")}</h2>
          </div>
          <p className="max-w-[52ch] text-body-md text-navy-600 lg:col-span-5 lg:col-start-8">
            {t("description")}
          </p>
        </div>

        {/* The six phases as one contained object.

            This replaced a horizontal track: six columns of text with a rail
            through them, on bare white, with nothing holding them. Every fix
            it was given was a fix to type or to a hairline, which is the tell
            that the arrangement itself was the problem — a track spends its
            whole width on one axis and leaves each phase a column too narrow
            for its own sentence, so six sentences set the section's height and
            the rail runs through the middle of all that air.

            A grid, contained, is the honest shape: the six are parts of one
            cycle, so they belong inside one object with rules between them.
            (The three tiers on this same page went the other way, to separate
            plates, for the opposite reason — a tier is a thing you pick
            between, and those are not parts of anything.)

            The live phase inverts to navy rather than taking a tint. A wash
            went muddy over this ground when the section was navy-50 and would
            again; an inverted cell is unmissable, uses the identity's own two
            grounds, and needs no border, bar or panel to say "here". */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {stations.map((s) => (
            <div
              key={s.phase}
              aria-current={s.isCurrent ? "step" : undefined}
              className={cn(
                "px-8 py-9 sm:px-9 sm:py-10",
                // Six cards with air between them, not one plate ruled into
                // sixths. The gap matches the tier plates on this page, so the
                // two sections separate their parts by the same distance.
                s.isCurrent ? "bg-navy-950 text-cream-100" : "bg-mist",
              )}
            >
              {/* The chip's height is reserved in every cell, not only the one
                  that has a chip. A bare numeral is 16px and the chip row is
                  taller, so the live cell pushed its own name, date and prose
                  down and a row of three cells came out on two baselines. */}
              <div className="flex min-h-7 flex-wrap items-center gap-x-4 gap-y-2">
                <p
                  aria-hidden
                  className={cn(
                    "font-data text-data-md leading-none tabular-nums",
                    // 16px is not large text, so 4.5:1 applies. `navy-500` is
                    // 3.45:1 and has been reached for twice in this file.
                    s.isCurrent ? "text-gold" : "text-navy-600",
                  )}
                >
                  {String(s.i + 1).padStart(2, "0")}
                </p>
                {s.isCurrent ? (
                  <span className="inline-flex items-center gap-2 bg-gold-deep px-2 py-0.5 font-display text-coord uppercase text-cream-50">
                    <span className="size-1.5 bg-cream-50/70" aria-hidden />
                    {t("now")}
                  </span>
                ) : null}
              </div>

              {/* A two-line floor, so six cells put their dates and their prose
                  on the same baselines whether a name wraps or not. */}
              <h3
                className={cn(
                  "mt-5 min-h-[2.7em] text-h4 text-balance",
                  s.isCurrent ? "text-cream-50" : "text-navy-900",
                )}
              >
                {s.name}
              </h3>

              {/* Every cell reserves the date line: configuration has no date,
                  and without the floor its prose would ride up alone. */}
              <p
                className={cn(
                  "min-h-[1.5rem] font-data text-data-sm tabular-nums",
                  s.isCurrent ? "text-gold" : "text-navy-900",
                )}
              >
                {s.date}
              </p>

              <p
                className={cn(
                  "mt-4 max-w-[38ch] text-body-sm",
                  s.isCurrent ? "text-cream-200/80" : "text-navy-600",
                )}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* The dates carry a caveat, and it belongs after them.

            Outside the grid, on the section's own ground, with no border, chip
            or fill — a seventh cell in a three-column grid would read as a
            seventh phase, which is the one thing this line must not do. mt-8 is
            wider than the grid's own gap-6, so it separates from the last row
            rather than continuing it.

            Wording is the approved string, restored verbatim. */}
        <p className="mt-8 max-w-[60ch] text-body-sm text-navy-600">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
