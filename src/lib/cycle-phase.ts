import type {
  Cycle,
  CyclePhase,
  GroupResult,
  PricingWindow,
} from "@/lib/api/types";

/**
 * Cycle-phase logic.
 *
 * The public site changes what it asks of a visitor six times a year: enter,
 * wait, vote, look at winners. Rather than scattering that across screens, the
 * mapping lives here once and is consumed by the hero and by the header's CTA
 * slot, so the two can never disagree about what the cycle is doing.
 *
 * Screens read `cycle.phase` rather than comparing dates, because Admin
 * controls phase transitions (§3.1) — a window can be extended before it
 * closes, and the phase is the authority.
 */

export interface PhaseAction {
  /** Message key under `home.cta.*`. */
  labelKey: string;
  href: string;
}

export interface PhasePresentation {
  /** Message keys under `home.hero.<phase>.*`. */
  phase: CyclePhase;
  primary: PhaseAction;
  secondary: PhaseAction | null;
  /**
   * Which instant the hero counts down to, if any. `since` opens the period
   * being counted, so the hero can show how much of it has already gone rather
   * than only how much is left — a bare "13 days" says nothing about whether
   * that is most of the window or the last of it.
   */
  countdown: { target: string; since: string; labelKey: string } | null;
}

export function phasePresentation(cycle: Cycle): PhasePresentation {
  const label = (key: string) => key;

  switch (cycle.phase) {
    case "submissions":
      return {
        phase: cycle.phase,
        primary: { labelKey: label("enter"), href: "/entries/new" },
        secondary: { labelKey: label("howToEnter"), href: "/how-to-enter" },
        countdown: {
          target: cycle.submissionWindows.late.end,
          since: cycle.submissionWindows.early_bird.start,
          labelKey: "submissionsClose",
        },
      };

    case "verification":
      return {
        phase: cycle.phase,
        primary: { labelKey: label("categories"), href: "/categories" },
        secondary: { labelKey: label("jury"), href: "/jury-panel" },
        countdown: {
          target: cycle.juryScoringPeriod.start,
          since: cycle.submissionWindows.late.end,
          labelKey: "judgingOpens",
        },
      };

    case "jury_scoring":
      return {
        phase: cycle.phase,
        primary: { labelKey: label("jury"), href: "/jury-panel" },
        secondary: { labelKey: label("categories"), href: "/categories" },
        countdown: {
          target: cycle.votingWindow.start,
          since: cycle.juryScoringPeriod.start,
          labelKey: "votingOpens",
        },
      };

    case "voting":
      return {
        phase: cycle.phase,
        // Both actions used to land on /finalists, which gave the hero two
        // buttons doing the same thing. The secondary now explains what the
        // visitor is being asked to vote on.
        primary: { labelKey: label("vote"), href: `/finalists/${cycle.year}` },
        secondary: { labelKey: label("howToEnter"), href: "/how-to-enter" },
        countdown: {
          target: cycle.votingWindow.end,
          since: cycle.votingWindow.start,
          labelKey: "votingCloses",
        },
      };

    case "results":
      return {
        phase: cycle.phase,
        primary: { labelKey: label("winners"), href: `/winners/${cycle.year}` },
        secondary: { labelKey: label("finalists"), href: `/finalists/${cycle.year}` },
        countdown: null,
      };

    case "closed":
      return {
        phase: cycle.phase,
        primary: { labelKey: label("winners"), href: `/winners/${cycle.year}` },
        secondary: { labelKey: label("howToEnter"), href: "/how-to-enter" },
        countdown: null,
      };

    case "configuration":
    default:
      return {
        phase: "configuration",
        primary: { labelKey: label("howToEnter"), href: "/how-to-enter" },
        secondary: { labelKey: label("categories"), href: "/categories" },
        countdown: {
          target: cycle.submissionWindows.early_bird.start,
          // Nothing opens the configuration phase, so the gauge has no span to
          // fill; it collapses to the countdown alone.
          since: cycle.submissionWindows.early_bird.start,
          labelKey: "submissionsOpen",
        },
      };
  }
}

/** Order the six phases run in, for the timeline. `closed` is terminal, not a step. */
export const PHASE_SEQUENCE: CyclePhase[] = [
  "configuration",
  "submissions",
  "verification",
  "jury_scoring",
  "voting",
  "results",
];

export function phaseIndex(phase: CyclePhase): number {
  const index = PHASE_SEQUENCE.indexOf(phase);
  return index === -1 ? PHASE_SEQUENCE.length : index; // `closed` sorts past the end
}

/**
 * Whether this cycle's ceremony has already taken place.
 *
 * The phase, never a date, for the reason stated at the top of this file. There
 * is no separate "ceremony happened" flag on `Cycle` and there does not need to
 * be: the ceremony is defined as where the medals are conferred, so it is the
 * results moment. `results` is that night; `closed` is after it.
 *
 * Read by the finalists screen, which shows a year's ceremony photography only
 * once there is a night for it to be of - a stage frame on a year still in
 * `voting` asserts that a ceremony happened when it has not.
 */
export function ceremonyHeld(cycle: Cycle): boolean {
  return cycle.phase === "results" || cycle.phase === "closed";
}

/** The pricing window an instant falls in, or null outside the participation period. */
export function currentPricingWindow(cycle: Cycle, at: Date): PricingWindow | null {
  const t = at.getTime();
  for (const [key, range] of Object.entries(cycle.submissionWindows) as [
    PricingWindow,
    { start: string; end: string },
  ][]) {
    if (t >= Date.parse(range.start) && t <= Date.parse(range.end)) return key;
  }
  return null;
}

/**
 * The most recent cycle that has finalized, published results.
 *
 * Not the same as the active cycle: while voting is open, the active cycle has
 * only proposed rankings, which may never be shown publicly (§1.1 requires an
 * Admin review before any group is announced). So "latest winners" on the
 * public site means the newest cycle whose results were actually finalized.
 */
export function latestPublishedCycle(
  cycles: Cycle[],
  hasPublishedResults: (cycleId: string) => boolean,
): Cycle | null {
  return (
    [...cycles]
      .sort((a, b) => b.year - a.year)
      .find((cycle) => hasPublishedResults(cycle.id)) ?? null
  );
}

/** Group results by `subCategoryId × tier` — the key a result is actually filed under. */
export function groupResults(results: GroupResult[]) {
  const groups = new Map<string, GroupResult[]>();
  for (const result of results) {
    const key = `${result.subCategoryId}|${result.tier}`;
    groups.set(key, [...(groups.get(key) ?? []), result]);
  }
  return groups;
}
