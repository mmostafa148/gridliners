import { getTranslations } from "next-intl/server";

import { PixelGrid } from "@/components/brand/pixel-grid";
import { Countdown } from "@/components/shared/countdown";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Cycle } from "@/lib/api/types";
import { phasePresentation } from "@/lib/cycle-phase";
import { cn } from "@/lib/utils";

/**
 * The last thing on a page, and it is the cycle's ask rather than the page's.
 *
 * A band that always said "Start an entry" would be wrong for most of the
 * year: entries are open for three months of a cycle that runs about ten. So
 * the action is whatever `phasePresentation` says the site is currently asking
 * for, from the same map the hero, the header rail and the phone menu read,
 * which is what stops four surfaces disagreeing about what to do next.
 *
 * Takes its heading and its line as strings, the way `PageHeader` does, so each
 * page passes copy from the namespace it owns and this component stays the
 * shape of the thing rather than a consumer of one page's messages. What it
 * owns is the part that is genuinely shared: resolving the phase, dropping a
 * self-link, and the fill that survives this ground.
 *
 * The countdown is opt-out. On How to Enter it is the point, because everything
 * above it is identical in every phase and this is the only part that moves. On
 * Home the hero's readout has already counted the same deadline down two
 * screens earlier, and saying it twice on one page makes neither one urgent.
 *
 * `ceremonial`, because the countdown's default muted foreground is invisible
 * on any of the grounds this band uses.
 */
export async function ClosingCta({
  cycle,
  title,
  body,
  countdown: showCountdown = true,
  culmination = false,
  secondary: secondaryOverride,
  groundAbove = "bg-navy-950",
  selfHref,
  selfPrimaryFallback = false,
}: {
  cycle: Cycle;
  title: string;
  body: string;
  /** Set false where the page has already counted this deadline down. */
  countdown?: boolean;
  /**
   * The band as the page's last statement rather than one more section.
   *
   * Raises the heading to the display scale the page's own sections use and
   * gives the block room, for a page that ends on this rather than passing
   * through it. Home and How to Enter keep the compact band, which is right
   * where the reader has just been given a countdown or a price table.
   */
  culmination?: boolean;
  /**
   * Replaces the phase's own second action.
   *
   * The primary is never overridable: it is what the site is currently asking
   * for, from the one map the hero, the rail and the phone menu all read, and
   * a page that could contradict it would be the fifth surface disagreeing.
   * The second slot is a page's own business, and About's map bullet asks for
   * contact rather than whatever the phase happens to offer.
   */
  secondary?: { href: string; label: string };
  /**
   * The ground of the section directly above, for the seam at this band's head.
   *
   * The seam is that section breaking into this one, so its cells have to BE
   * that section's colour - `selection-process.tsx` states the rule and the
   * voting banner repeats it: "a seam whose cells are not the ground above it
   * reads as a cut."
   *
   * Defaults to `bg-navy-950`, which is right on four of the six pages that
   * close on this band: Home follows `Testimonials`, how-to-enter follows
   * `SubmissionGuidelines`, jury-panel follows `SelectionProcess` and
   * categories follows `HonoraryAwards`, all navy. It is a default rather than
   * a fixed value because the other two are not: the finalists year closes
   * after `ArchiveYears` on mist, and its empty state after a white section.
   *
   * **About is the remaining case and is deliberately not passing one.** It
   * follows `FaqAccordion` on mist and so draws a navy seam against a mist
   * ground - the same defect, on an approved screen, logged in build-state
   * rather than fixed inside a finalists task.
   */
  groundAbove?: string;
  /**
   * The route this section is rendered on. A secondary action pointing at it
   * is dropped: `phasePresentation` offers "How to enter" as the second action
   * in three of the seven phases, so on that page the band ended in a button
   * back to the top of the page the reader is already on.
   */
  selfHref?: string;
  /**
   * What to do when the *primary* points at `selfHref` too.
   *
   * Two phases make a page their own primary action — `voting` points at
   * `/finalists/<year>` and `jury_scoring` at `/jury-panel` — and on that page
   * the site's ask is not somewhere to go, it is the thing the reader is
   * already looking at. Opting in promotes the phase's second action into the
   * primary slot and leaves the second slot empty.
   *
   * This is not an override of what the site is asking for; the primary stays
   * unoverridable, and every page that does not opt in is unchanged. It is only
   * an answer to the case where the ask *is* this page.
   */
  selfPrimaryFallback?: boolean;
}) {
  const [tCta, tCountdown] = await Promise.all([
    getTranslations("home.cta"),
    getTranslations("home.countdown"),
  ]);

  const presentation = phasePresentation(cycle);
  const countdown = showCountdown ? presentation.countdown : null;

  // Only when the page opted in, and only when the ask really is this page.
  const promote =
    selfPrimaryFallback &&
    Boolean(selfHref) &&
    presentation.primary.href === selfHref;

  const primary = promote ? presentation.secondary : presentation.primary;
  const phaseSecondary =
    !promote && presentation.secondary && presentation.secondary.href !== selfHref
      ? presentation.secondary
      : null;

  /**
   * The actions take the end side when nothing else is using it.
   *
   * The band is one row: copy on the start, the countdown on the end. A page
   * that has already counted this deadline down elsewhere leaves that end slot
   * empty, and the buttons then sit under the copy with half the band beside
   * them holding nothing.
   *
   * The rule is simply that: whenever the end slot is free, the actions take
   * it. Home and About both pass `countdown={false}` and both get it. How to
   * Enter takes the default and keeps its buttons under the copy while the
   * cycle is in a phase that counts down — and picks up the same end-side
   * layout in the phases that do not, which is the same improvement rather
   * than a different band.
   */
  const actionsOnEnd = !countdown;

  const actions = (
    <div
      className={cn(
        "flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        actionsOnEnd && "lg:justify-end",
      )}
    >
      {/* Cream fill, not the award variant's navy: this section's ground is
          the identity's blue, and navy on blue is the same trap the footer
          hit, a button that dissolves as it fills. */}
      {primary ? (
        <Button
          asChild
          variant="award"
          size="cta"
          className="w-full justify-between bg-cream-100 text-navy-900 sm:w-auto sm:justify-center"
        >
          <Link href={primary.href}>{tCta(primary.labelKey)}</Link>
        </Button>
      ) : null}
      {secondaryOverride ? (
        <Button
          asChild
          variant="outline"
          size="cta"
          className="w-full border-cream-100/40 bg-transparent text-cream-100 hover:bg-cream-100/10 hover:text-cream-50 sm:w-auto"
        >
          <Link href={secondaryOverride.href}>{secondaryOverride.label}</Link>
        </Button>
      ) : phaseSecondary ? (
        <Button
          asChild
          variant="outline"
          size="cta"
          className="w-full border-cream-100/40 bg-transparent text-cream-100 hover:bg-cream-100/10 hover:text-cream-50 sm:w-auto"
        >
          <Link href={phaseSecondary.href}>{tCta(phaseSecondary.labelKey)}</Link>
        </Button>
      ) : null}
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-blue-700 text-cream-100">
      {/* The band's head breaks out of the section above it rather than
          starting on a ruled edge. Navy cells solid along the top and thinning
          downward, so the ground the reader has been on reaches into the blue
          instead of stopping at it — the same device the cost plate uses at its
          foot, run the other way.

          The cells carry `groundAbove`, which is the previous section's own
          colour. This used to be hard-coded to `bg-navy-950` on the reasoning
          that the component closes several pages and could not know its
          neighbour - true of the value, not of the caller, which always knows.
          Navy is still the default and is still right on four of the six
          pages; the two that follow a light section now say so. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
      >
        <PixelGrid
          direction="down"
          seed={29}
          cols={64}
          rows={3}
          density={0.4}
          cellSize="clamp(0.875rem, 1.8vw, 1.75rem)"
          cellClassName={groundAbove}
        />
      </div>

      {/* The dissolve's height is reserved, never overlapped. */}
      <div className="page-shell section-y relative pt-[calc(var(--section-y)+clamp(0.875rem,1.8vw,1.75rem)*3)]">
        <div className="flex flex-col gap-x-16 gap-y-10 lg:flex-row lg:items-end lg:justify-between">
          <div className={cn(culmination ? "max-w-3xl" : "max-w-xl")}>
            <h2
              className={cn(
                "text-balance text-cream-100",
                culmination ? "text-display-md" : "text-h1",
              )}
            >
              {title}
            </h2>
            <p
              className={cn(
                "text-cream-100/85",
                culmination ? "mt-7 text-body-lg" : "mt-5 text-body-md",
              )}
            >
              {body}
            </p>

            {/* The actions stay under the copy only while the end slot is
                spoken for. */}
            {actionsOnEnd ? null : <div className="mt-8">{actions}</div>}
          </div>

          {countdown ? (
            // `hero`, so the figures land at display scale. This is the last
            // thing on the page and the one number a reader is being asked to
            // act on; at the default size it was a caption in the corner of a
            // blue rectangle.
            <Countdown
              target={countdown.target}
              label={tCountdown(countdown.labelKey)}
              tone="ceremonial"
              size="hero"
              className="shrink-0"
            />
          ) : actionsOnEnd ? (
            <div className="lg:shrink-0">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
