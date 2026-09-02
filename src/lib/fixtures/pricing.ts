import type { Credit, PricingConfig } from "@/lib/api/types";

/**
 * Pricing per Consolidated Decisions §2 — the 3×3 base table is confirmed;
 * loyalty rules, promo codes and per-sub-category fees are PLACEHOLDERS and
 * remain admin-configurable (CD §6.2). Sub-category fees live on each
 * SubCategory in taxonomy.ts, because each is set individually (§1.3).
 */

export const pricingConfigs: PricingConfig[] = [
  {
    cycleId: "cycle-2026",
    currency: "USD",
    basePrices: {
      students: { early_bird: 100, normal: 125, late: 150 },
      freelancers: { early_bird: 200, normal: 250, late: 300 },
      corporate: { early_bird: 400, normal: 500, late: 650 },
    },
    loyaltyRules: [
      {
        id: "loyalty-2nd",
        fromSubmissionNumber: 2,
        percentOff: 5,
        label: { en: "2nd entry this cycle", ar: "المشاركة الثانية في الدورة" },
      },
      {
        id: "loyalty-3rd",
        fromSubmissionNumber: 3,
        percentOff: 10,
        label: { en: "3rd entry this cycle", ar: "المشاركة الثالثة في الدورة" },
      },
      {
        id: "loyalty-5th",
        fromSubmissionNumber: 5,
        percentOff: 15,
        label: { en: "5th entry or more", ar: "المشاركة الخامسة فأكثر" },
      },
    ],
    promoCodes: [
      {
        id: "promo-early15",
        code: "EARLY15",
        kind: "percentage",
        value: 15,
        validFrom: "2025-11-15T00:00:00Z",
        validUntil: "2025-12-14T23:59:59Z",
        maxRedemptions: 200,
        redemptions: 143,
        singleUse: false,
        active: false, // window has passed — exercises the expired-code path
      },
      {
        id: "promo-studio50",
        code: "STUDIO50",
        kind: "fixed",
        value: 50,
        validFrom: "2025-11-15T00:00:00Z",
        validUntil: "2026-02-15T23:59:59Z",
        maxRedemptions: null,
        redemptions: 38,
        singleUse: false,
        active: true,
      },
      {
        id: "promo-uni10",
        code: "UNI10",
        kind: "percentage",
        value: 10,
        validFrom: "2025-11-15T00:00:00Z",
        validUntil: "2026-02-15T23:59:59Z",
        maxRedemptions: 500,
        redemptions: 87,
        singleUse: false,
        active: true,
      },
      {
        // Participant-bound single-use credit from a tier downgrade (§3.3).
        id: "promo-credit-mira",
        code: "GLCR-8H2K-2026",
        kind: "next_cycle_credit",
        value: 150,
        validFrom: "2026-03-01T00:00:00Z",
        validUntil: "2027-02-15T23:59:59Z",
        maxRedemptions: 1,
        redemptions: 0,
        boundParticipantId: "p-008",
        singleUse: true,
        active: true,
      },
    ],
  },
];

/** Next-cycle credits issued on tier downgrades — one instrument per record. */
export const credits: Credit[] = [
  {
    code: "GLCR-8H2K-2026",
    ownerParticipantId: "p-008",
    amountUsd: 150,
    issuedForEntryId: "e-008",
    validForCycleId: "cycle-2027",
    issuedAt: "2026-02-26T11:20:00Z",
    redeemedAt: null,
  },
];
