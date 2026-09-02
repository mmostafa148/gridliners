import type { Cycle } from "@/lib/api/types";

/**
 * One active cycle + two archived (screen-map 0.3).
 *
 * The active 2026 edition is positioned so the Voting Window is live, which
 * keeps countdowns and phase-aware CTAs demonstrable. Screens must still read
 * `cycle.phase` rather than comparing dates themselves, since Admin controls
 * phase transitions.
 *
 * PLACEHOLDER dates and thresholds (CD §5.4 / §6.2): the real window, scoring
 * and voting dates are admin-configured and not yet fixed.
 *
 * Edition label is an open item — the brand is locked on "2026" while the
 * participation period runs Nov → Feb. See docs/build-state.md.
 */

export const cycles: Cycle[] = [
  {
    id: "cycle-2026",
    year: 2026,
    label: { en: "Gridliners Awards 2026", ar: "جوائز غريدلاينرز 2026" },
    status: "active",
    phase: "voting",
    submissionWindows: {
      early_bird: { start: "2025-11-15T00:00:00Z", end: "2025-12-14T23:59:59Z" },
      normal: { start: "2025-12-15T00:00:00Z", end: "2026-01-31T23:59:59Z" },
      late: { start: "2026-02-01T00:00:00Z", end: "2026-02-15T23:59:59Z" },
    },
    juryScoringPeriod: { start: "2026-03-01T00:00:00Z", end: "2026-06-15T23:59:59Z" },
    votingWindow: { start: "2026-07-01T00:00:00Z", end: "2026-08-15T23:59:59Z" },
    resultsAnnouncementAt: "2026-08-30T17:00:00Z",
    cashExpiryDays: 7,
    shortlistThresholds: { students: 55, freelancers: 60, corporate: 65 },
  },
  {
    id: "cycle-2025",
    year: 2025,
    label: { en: "Gridliners Awards 2025", ar: "جوائز غريدلاينرز 2025" },
    status: "archived",
    phase: "results",
    submissionWindows: {
      early_bird: { start: "2024-11-15T00:00:00Z", end: "2024-12-14T23:59:59Z" },
      normal: { start: "2024-12-15T00:00:00Z", end: "2025-01-31T23:59:59Z" },
      late: { start: "2025-02-01T00:00:00Z", end: "2025-02-15T23:59:59Z" },
    },
    juryScoringPeriod: { start: "2025-03-01T00:00:00Z", end: "2025-06-15T23:59:59Z" },
    votingWindow: { start: "2025-07-01T00:00:00Z", end: "2025-08-15T23:59:59Z" },
    resultsAnnouncementAt: "2025-08-30T17:00:00Z",
    cashExpiryDays: 7,
    shortlistThresholds: { students: 55, freelancers: 60, corporate: 65 },
  },
  {
    id: "cycle-2024",
    year: 2024,
    label: { en: "Gridliners Awards 2024", ar: "جوائز غريدلاينرز 2024" },
    status: "archived",
    phase: "results",
    submissionWindows: {
      early_bird: { start: "2023-11-15T00:00:00Z", end: "2023-12-14T23:59:59Z" },
      normal: { start: "2023-12-15T00:00:00Z", end: "2024-01-31T23:59:59Z" },
      late: { start: "2024-02-01T00:00:00Z", end: "2024-02-15T23:59:59Z" },
    },
    juryScoringPeriod: { start: "2024-03-01T00:00:00Z", end: "2024-06-15T23:59:59Z" },
    votingWindow: { start: "2024-07-01T00:00:00Z", end: "2024-08-15T23:59:59Z" },
    resultsAnnouncementAt: "2024-08-30T17:00:00Z",
    cashExpiryDays: 7,
    shortlistThresholds: { students: 55, freelancers: 60, corporate: 65 },
  },
];

export const activeCycleId = "cycle-2026";
