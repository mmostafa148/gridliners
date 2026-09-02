import type { AuditLogEntry, DisqualificationRecord } from "@/lib/api/types";

/**
 * Disqualification is a durable record, separate from entry status (§3.6):
 * subject, reason, evidence, actor, date, and the affected editions.
 */
export const disqualifications: DisqualificationRecord[] = [
  {
    id: "dq-001",
    participantId: "p-012",
    subjectName: "Vertex Labs",
    entryId: "e-012",
    reason: {
      en: "Payment chargeback after submission, plus unlicensed use of third-party assets.",
      ar: "استرداد مبلغ الدفع بعد التقديم، إضافة إلى استخدام أصول لطرف ثالث دون ترخيص.",
    },
    evidence: "Stripe dispute DP-4821; asset licence audit dated 2026-03-04.",
    actor: "admin@gridliners.com",
    at: "2026-03-06T10:00:00Z",
    // Current plus one future edition, per the competition terms.
    affectedCycleIds: ["cycle-2026", "cycle-2027"],
  },
];

/**
 * Comprehensive audit log — a v1 NFR (§3.6). Every entry carries actor,
 * timestamp and reason.
 */
export const auditLog: AuditLogEntry[] = [
  {
    id: "al-001",
    action: "tier_verified",
    actor: "admin@gridliners.com",
    at: "2026-02-24T09:30:00Z",
    entityType: "entry",
    entityId: "e-001",
    reason: "Trade licence checked; corporate tier confirmed as declared.",
  },
  {
    id: "al-002",
    action: "tier_correction",
    actor: "admin@gridliners.com",
    at: "2026-02-22T11:15:00Z",
    entityType: "entry",
    entityId: "e-007",
    reason: "Declared freelancers; trade licence shows a 24-person agency.",
  },
  {
    id: "al-003",
    action: "settlement_issued",
    actor: "admin@gridliners.com",
    at: "2026-02-22T11:20:00Z",
    entityType: "payment",
    entityId: "pay-007b",
    reason: "Upgrade difference of $200 against the original early-bird window.",
  },
  {
    id: "al-004",
    action: "settlement_issued",
    actor: "admin@gridliners.com",
    at: "2026-02-26T11:20:00Z",
    entityType: "entry",
    entityId: "e-008",
    reason: "Downgrade difference of $150 issued as next-cycle credit GLCR-8H2K-2026.",
  },
  {
    id: "al-005",
    action: "cash_confirmed",
    actor: "admin@gridliners.com",
    at: "2025-11-27T10:30:00Z",
    entityType: "payment",
    entityId: "pay-013",
    reason: "Cash received at the Riyadh office; receipt 4471.",
  },
  {
    id: "al-006",
    action: "category_moved",
    actor: "admin@gridliners.com",
    at: "2026-02-25T16:40:00Z",
    entityType: "entry",
    entityId: "e-016",
    reason: "Moved from Visual Art to AI Designs during Tier Verification; participant notified.",
  },
  {
    id: "al-007",
    action: "admin_entered_score",
    actor: "admin@gridliners.com",
    at: "2026-06-15T20:00:00Z",
    entityType: "score",
    entityId: "s-006",
    reason: "Juror j-003 unreachable through the period; score entered to complete the cohort.",
  },
  {
    id: "al-008",
    action: "votes_voided",
    actor: "admin@gridliners.com",
    at: "2026-07-06T09:00:00Z",
    entityType: "vote",
    entityId: "v-005",
    reason: "Velocity cluster: 14 verifications from one IP inside 4 minutes. Voiding is silent by design.",
  },
  {
    id: "al-009",
    action: "disqualification",
    actor: "admin@gridliners.com",
    at: "2026-03-06T10:00:00Z",
    entityType: "entry",
    entityId: "e-012",
    reason: "Chargeback plus unlicensed third-party assets; see dq-001.",
  },
  {
    id: "al-010",
    action: "medal_withheld",
    actor: "admin@gridliners.com",
    at: "2025-08-29T14:00:00Z",
    entityType: "result",
    entityId: "r-2025-013",
    reason: "Sole Cadet in the group with zero votes; medal withheld at review.",
  },
  {
    id: "al-011",
    action: "result_finalized",
    actor: "admin@gridliners.com",
    at: "2025-08-30T17:00:00Z",
    entityType: "result",
    entityId: "r-2025-001",
    reason: "Group reviewed and announced: Brand Identity Redesign × Corporate.",
  },
];
