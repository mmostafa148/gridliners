import type { OtpChallenge, Vote } from "@/lib/api/types";

/**
 * Individual vote records — a representative sample for the admin voting
 * monitor and fraud tooling. Aggregate counts live on GroupResult.votes.
 *
 * Rules exercised here (§3.2):
 *  - A vote is valid if its OTP was verified BEFORE the window closed; the
 *    request time is irrelevant (v-010 requested in time but never verified).
 *  - Voiding is silent — no notification is ever sent (v-005, v-006).
 *  - One vote per project per email; plus-addressing is normalized before
 *    hashing, so a "+tag" variant collides with the base address.
 */

function vote(
  id: string,
  entryId: string,
  emailHash: string,
  ipHash: string,
  requestedAt: string,
  otpVerifiedAt: string | null,
  options: Partial<Vote> = {},
): Vote {
  return {
    id,
    entryId,
    cycleId: "cycle-2026",
    emailHash,
    otpVerifiedAt,
    requestedAt,
    ipHash,
    voided: false,
    ...options,
  };
}

export const votes: Vote[] = [
  vote("v-001", "e-001", "h:9f2a41", "ip:a12", "2026-07-02T09:14:00Z", "2026-07-02T09:15:20Z"),
  vote("v-002", "e-001", "h:3c8b07", "ip:b77", "2026-07-02T10:02:00Z", "2026-07-02T10:03:11Z"),
  vote("v-003", "e-001", "h:70de55", "ip:c31", "2026-07-03T18:40:00Z", "2026-07-03T18:41:02Z"),
  vote("v-004", "e-013", "h:1188ac", "ip:d09", "2026-07-04T07:22:00Z", "2026-07-04T07:23:45Z"),

  // Velocity cluster from one IP — voided by Admin after fraud review.
  vote("v-005", "e-001", "h:aa01f2", "ip:e55", "2026-07-05T22:01:00Z", "2026-07-05T22:01:40Z", {
    voided: true,
    voidedReason: "Vote velocity: 14 verifications from one IP inside 4 minutes.",
  }),
  vote("v-006", "e-001", "h:aa02f3", "ip:e55", "2026-07-05T22:02:00Z", "2026-07-05T22:02:30Z", {
    voided: true,
    voidedReason: "Vote velocity: 14 verifications from one IP inside 4 minutes.",
  }),

  vote("v-007", "e-002", "h:5b93c1", "ip:f18", "2026-07-06T11:30:00Z", "2026-07-06T11:31:15Z"),
  vote("v-008", "e-003", "h:c40a88", "ip:g42", "2026-07-07T16:05:00Z", "2026-07-07T16:06:00Z"),
  vote("v-009", "e-015", "h:e21b39", "ip:h63", "2026-07-08T08:45:00Z", "2026-07-08T08:46:20Z"),

  // Requested before close but never verified — does not count.
  vote("v-010", "e-002", "h:77cc10", "ip:i94", "2026-07-09T13:00:00Z", null),
];

/** Live OTP challenges backing the voting modal's states. */
export const otpChallenges: OtpChallenge[] = [
  {
    id: "otp-001",
    entryId: "e-002",
    email: "visitor@example.com",
    expiresAt: "2026-07-09T13:10:00Z",
    verifiedAt: null,
    attempts: 1,
  },
];

/** The one code the mock OtpService accepts, so the flow is demonstrable. */
export const MOCK_OTP_CODE = "204815";
