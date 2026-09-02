import type { Entry, Payment, PricingSnapshot, Vote } from "@/lib/api/types";

/**
 * The lifecycle data the participant module is built and reviewed against.
 *
 * **Added beside the Phase 1 set, never woven into it.** The existing fixtures
 * already carry one entry in each state, but each sits on a different
 * participant - p-004 has the draft, p-005 the pending payment, p-007 the
 * upgrade settlement - which is right for exercising the state machine and
 * useless for reviewing a dashboard. A participant screen needs one account
 * that has *all* of it.
 *
 * **Nothing here is `shortlisted`.** That is the constraint that keeps Phase 1
 * untouched: `/projects/[slug]`, `/finalists` and `/winners` publish
 * shortlisted entries and published results and read nothing else, so an entry
 * added in any other state cannot change a public page. The 390 public slugs
 * stay 390. Verified by the regression pass rather than asserted.
 *
 * Two accounts carry it:
 *
 * - **p-016 Qamar Studio (EN)** already owns nine shortlisted projects and five
 *   medals across two cycles, including one project that took two different
 *   medals in two groups. What it lacked was the working half of an account -
 *   a draft, an unpaid reference, a settlement - so that is what is added.
 * - **p-003 نور الشمري (AR)** owns fourteen shortlisted projects and two
 *   medals on Arabic-authored work. It gets a smaller set, enough that every
 *   screen has Arabic content to be read in rather than translated English.
 */

function snapshot(
  base: number,
  subCategoryId: string,
  quotedAt: string,
  options: Partial<PricingSnapshot> = {},
): PricingSnapshot {
  const additionalSubCategories = options.additionalSubCategories ?? [];
  const subtotalUsd =
    base + additionalSubCategories.reduce((sum, line) => sum + line.amountUsd, 0);
  const loyalty = options.loyalty ?? null;
  const promo = options.promo ?? null;
  const credit = options.credit ?? null;
  return {
    window: options.window ?? "normal",
    tier: options.tier ?? "corporate",
    basePriceUsd: base,
    baseSubCategoryId: subCategoryId,
    additionalSubCategories,
    submissionNumber: options.submissionNumber ?? 1,
    loyalty,
    promo,
    credit,
    subtotalUsd,
    totalUsd:
      Math.round((subtotalUsd - (loyalty?.amountUsd ?? 0) - (promo?.amountUsd ?? 0)) * 100) / 100,
    quotedAt,
  };
}

/** Media that resolves to the designed empty state, like every other fixture. */
function media(slug: string) {
  return {
    coverUrl: `/placeholders/${slug}-cover.jpg`,
    galleryUrls: [`/placeholders/${slug}-01.jpg`, `/placeholders/${slug}-02.jpg`],
    documentUrls: [],
  };
}

/** The three fields every scenario entry shares; `as const` would freeze the array. */
const BASE = {
  credits: [] as string[],
  categoryMove: null,
  juryFinalScore: null,
};

export const scenarioEntries: Entry[] = [
  // -- p-016, English, one of every working state ---------------------------
  {
    ...BASE,
    id: "e-901",
    slug: "qamar-annual-report-2026",
    cycleId: "cycle-2026",
    participantId: "p-016",
    state: "draft",
    title: "Qamar Annual Report 2026",
    description:
      "A 96-page annual report for a cultural foundation, set in two directions on one grid. Draft: the gallery and the outcome section are still to come.",
    contentLanguage: "en",
    country: "AE",
    client: "Bayt Al Noor Foundation",
    media: media("qamar-annual-report-2026"),
    declaredTier: "corporate",
    baseSubCategoryId: "layout-magazine-design",
    additionalSubCategoryIds: [],
    eligibilityProof: {
      tier: "corporate",
      companyName: "Qamar Studio FZ-LLC",
      tradeLicence: "DED-1174429",
      retentionUntil: "2027-08-31T23:59:59Z",
    },
    verification: null,
    createdAt: "2026-02-02T09:12:00Z",
    checkoutCompletedAt: null,
    submittedAt: null,
    paymentIds: [],
  },
  {
    ...BASE,
    id: "e-902",
    slug: "qamar-museum-signage",
    cycleId: "cycle-2026",
    participantId: "p-016",
    state: "pending_payment",
    title: "Nadwa Museum Signage",
    description:
      "A bilingual wayfinding system for a museum of regional printing, from building-scale lettering down to a 12mm door plate.",
    contentLanguage: "en",
    country: "AE",
    client: "Nadwa Museum",
    media: media("qamar-museum-signage"),
    declaredTier: "corporate",
    baseSubCategoryId: "visual-identity-brand-identity-design",
    additionalSubCategoryIds: ["visual-identity-logo-design"],
    eligibilityProof: {
      tier: "corporate",
      companyName: "Qamar Studio FZ-LLC",
      tradeLicence: "DED-1174429",
      retentionUntil: "2027-08-31T23:59:59Z",
    },
    verification: null,
    createdAt: "2026-02-10T14:00:00Z",
    checkoutCompletedAt: "2026-02-10T14:26:00Z",
    submittedAt: null,
    paymentIds: ["pay-901"],
  },
  {
    ...BASE,
    id: "e-903",
    slug: "qamar-festival-titles",
    cycleId: "cycle-2026",
    participantId: "p-016",
    state: "submitted",
    title: "Aswat Festival Titles",
    description:
      "A 40-second title sequence for a regional music festival, built from letterforms that resolve out of waveform data.",
    contentLanguage: "en",
    country: "AE",
    client: "Aswat Festival",
    media: media("qamar-festival-titles"),
    declaredTier: "freelancers",
    baseSubCategoryId: "film-motion-graphics-animation",
    additionalSubCategoryIds: [],
    eligibilityProof: {
      tier: "freelancers",
      portfolioUrl: "https://qamar.design/work",
      freelanceLicence: "FL-2026-88213",
      retentionUntil: "2027-08-31T23:59:59Z",
    },
    // Declared freelance, verified corporate: the upgrade path, still unpaid.
    verification: {
      declaredTier: "freelancers",
      verifiedTier: "corporate",
      actor: "admin@gridliners.com",
      verifiedAt: null,
      corrections: [
        {
          from: "freelancers",
          to: "corporate",
          actor: "admin@gridliners.com",
          at: "2026-02-19T08:40:00Z",
          note: "Trade licence names an 11-person studio; the corporate tier applies.",
        },
      ],
      settlement: {
        kind: "payment_link",
        status: "pending",
        amountUsd: 250,
        deadline: "2026-03-05T23:59:59Z",
        paymentId: "pay-903b",
      },
    },
    createdAt: "2026-02-14T10:30:00Z",
    checkoutCompletedAt: "2026-02-14T10:58:00Z",
    submittedAt: "2026-02-14T10:58:00Z",
    paymentIds: ["pay-903"],
  },
  {
    ...BASE,
    id: "e-904",
    slug: "qamar-coffee-house",
    cycleId: "cycle-2026",
    participantId: "p-016",
    state: "verified",
    title: "Rukn Coffee House",
    description:
      "An identity for a coffee house built around a single repeated ligature, applied across cups, bags, awnings and a delivery bike.",
    contentLanguage: "en",
    country: "AE",
    client: "Rukn",
    media: media("qamar-coffee-house"),
    declaredTier: "corporate",
    baseSubCategoryId: "packaging-packaging-design",
    additionalSubCategoryIds: [],
    // Declared corporate, verified freelance: the downgrade path, credited.
    verification: {
      declaredTier: "corporate",
      verifiedTier: "freelancers",
      actor: "admin@gridliners.com",
      verifiedAt: "2026-02-21T09:15:00Z",
      corrections: [
        {
          from: "corporate",
          to: "freelancers",
          actor: "admin@gridliners.com",
          at: "2026-02-21T09:02:00Z",
          note: "Entered under the studio licence, but the work is a sole practitioner's.",
        },
      ],
      settlement: {
        kind: "credit",
        status: "settled",
        amountUsd: 150,
        deadline: "2026-03-05T23:59:59Z",
        creditCode: "GLCR-QM16-2027",
      },
    },
    eligibilityProof: {
      tier: "corporate",
      companyName: "Qamar Studio FZ-LLC",
      tradeLicence: "DED-1174429",
      retentionUntil: "2027-08-31T23:59:59Z",
    },
    createdAt: "2026-01-28T11:00:00Z",
    checkoutCompletedAt: "2026-01-28T11:31:00Z",
    submittedAt: "2026-01-28T11:31:00Z",
    paymentIds: ["pay-904"],
  },
  {
    ...BASE,
    id: "e-905",
    slug: "qamar-lantern-series",
    cycleId: "cycle-2025",
    participantId: "p-016",
    state: "not_shortlisted",
    title: "Lantern Series",
    description:
      "A set of six posters for a Ramadan programme, drawn from the geometry of a single hanging lamp.",
    contentLanguage: "en",
    country: "AE",
    media: media("qamar-lantern-series"),
    declaredTier: "corporate",
    baseSubCategoryId: "layout-poster-design",
    additionalSubCategoryIds: [],
    eligibilityProof: {
      tier: "corporate",
      companyName: "Qamar Studio FZ-LLC",
      tradeLicence: "DED-1174429",
      retentionUntil: "2026-08-31T23:59:59Z",
    },
    verification: {
      declaredTier: "corporate",
      verifiedTier: "corporate",
      actor: "admin@gridliners.com",
      verifiedAt: "2025-02-01T10:00:00Z",
      corrections: [],
      settlement: null,
    },
    createdAt: "2025-01-20T08:00:00Z",
    checkoutCompletedAt: "2025-01-20T08:40:00Z",
    submittedAt: "2025-01-20T08:40:00Z",
    paymentIds: ["pay-905"],
    juryFinalScore: 71.4,
  },
  {
    ...BASE,
    id: "e-906",
    slug: "qamar-expired-reference",
    cycleId: "cycle-2026",
    participantId: "p-016",
    state: "cancelled",
    title: "Marsa Port Identity",
    description:
      "A port authority identity. Reserved against a cash reference that was never settled, so the entry auto-cancelled when the reference lapsed.",
    contentLanguage: "en",
    country: "AE",
    client: "Marsa Port Authority",
    media: media("qamar-expired-reference"),
    declaredTier: "corporate",
    baseSubCategoryId: "visual-identity-brand-identity-design",
    additionalSubCategoryIds: [],
    eligibilityProof: {
      tier: "corporate",
      companyName: "Qamar Studio FZ-LLC",
      tradeLicence: "DED-1174429",
      retentionUntil: "2027-08-31T23:59:59Z",
    },
    verification: null,
    createdAt: "2026-01-05T09:00:00Z",
    checkoutCompletedAt: "2026-01-05T09:22:00Z",
    submittedAt: null,
    paymentIds: ["pay-906"],
  },

  // -- p-003, Arabic ---------------------------------------------------------
  {
    ...BASE,
    id: "e-911",
    slug: "noor-maqam-draft",
    cycleId: "cycle-2026",
    participantId: "p-003",
    state: "draft",
    title: "مقام — عائلة خطية",
    description:
      "عائلة خطية عربية بأربعة أوزان، مرسومة للعناوين الصحفية وللشاشات الصغيرة معًا. ما زالت مسودّة: نماذج الأوزان الثقيلة لم تُرفع بعد.",
    contentLanguage: "ar",
    country: "SA",
    media: media("noor-maqam-draft"),
    declaredTier: "freelancers",
    baseSubCategoryId: "type-typeface-design",
    additionalSubCategoryIds: [],
    eligibilityProof: {
      tier: "freelancers",
      portfolioUrl: "https://noon.example/work",
      freelanceLicence: "SA-FL-44120",
      retentionUntil: "2027-08-31T23:59:59Z",
    },
    verification: null,
    createdAt: "2026-02-06T07:30:00Z",
    checkoutCompletedAt: null,
    submittedAt: null,
    paymentIds: [],
  },
  {
    ...BASE,
    id: "e-912",
    slug: "noor-nahda-covers",
    cycleId: "cycle-2026",
    participantId: "p-003",
    state: "pending_payment",
    title: "أغلفة نهضة",
    description:
      "سلسلة أغلفة لاثني عشر كتابًا في تاريخ الطباعة العربية، تجمعها شبكة واحدة ولون واحد لكل عقد.",
    contentLanguage: "ar",
    country: "SA",
    client: "دار نهضة",
    media: media("noor-nahda-covers"),
    declaredTier: "freelancers",
    baseSubCategoryId: "layout-magazine-design",
    additionalSubCategoryIds: [],
    eligibilityProof: {
      tier: "freelancers",
      portfolioUrl: "https://noon.example/work",
      freelanceLicence: "SA-FL-44120",
      retentionUntil: "2027-08-31T23:59:59Z",
    },
    verification: null,
    createdAt: "2026-02-12T11:00:00Z",
    checkoutCompletedAt: "2026-02-12T11:19:00Z",
    submittedAt: null,
    paymentIds: ["pay-911"],
  },
  {
    ...BASE,
    id: "e-913",
    slug: "noor-excluded-entry",
    cycleId: "cycle-2026",
    participantId: "p-003",
    state: "excluded",
    title: "دليل الرياض البصري",
    description:
      "دليل بصري لمدينة الرياض. أُخرجت المشاركة من التحكيم بعد أن بقيت تسوية المستوى دون حسم حتى انقضاء المهلة.",
    contentLanguage: "ar",
    country: "SA",
    media: media("noor-excluded-entry"),
    declaredTier: "students",
    baseSubCategoryId: "digital-ui-ux",
    additionalSubCategoryIds: [],
    eligibilityProof: {
      tier: "students",
      studentId: "SA-KSU-2211884",
      university: "جامعة الملك سعود",
      retentionUntil: "2027-08-31T23:59:59Z",
    },
    verification: {
      declaredTier: "students",
      verifiedTier: "freelancers",
      actor: "admin@gridliners.com",
      verifiedAt: null,
      corrections: [
        {
          from: "students",
          to: "freelancers",
          actor: "admin@gridliners.com",
          at: "2026-01-22T09:30:00Z",
          note: "بطاقة الطالب منتهية؛ ينطبق مستوى المستقلّين.",
        },
      ],
      settlement: {
        kind: "payment_link",
        status: "unresolved",
        amountUsd: 125,
        deadline: "2026-02-05T23:59:59Z",
        paymentId: "pay-913b",
      },
    },
    createdAt: "2026-01-14T08:00:00Z",
    checkoutCompletedAt: "2026-01-14T08:35:00Z",
    submittedAt: "2026-01-14T08:35:00Z",
    paymentIds: ["pay-913"],
  },
];

export const scenarioPayments: Payment[] = [
  {
    id: "pay-901",
    entryId: "e-902",
    participantId: "p-016",
    kind: "entry_fee",
    method: "cash",
    status: "pending",
    amountUsd: 570,
    snapshot: snapshot(500, "visual-identity-brand-identity-design", "2026-02-10T14:26:00Z", {
      additionalSubCategories: [
        {
          subCategoryId: "visual-identity-logo-design",
          label: { en: "Logo Design", ar: "تصميم الشعارات" },
          amountUsd: 120,
        },
      ],
      submissionNumber: 2,
      loyalty: { ruleId: "loyalty-2nd", percentOff: 5, amountUsd: 31 },
    }),
    createdAt: "2026-02-10T14:26:00Z",
    confirmedAt: null,
    // Deliberately far out, so the countdown on Entry Detail and the dashboard
    // is a live number during review rather than an already-lapsed date.
    expiresAt: "2027-03-31T23:59:59Z",
    invoiceNumber: "GL-2026-0901",
  },
  {
    id: "pay-903",
    entryId: "e-903",
    participantId: "p-016",
    kind: "entry_fee",
    method: "stripe",
    status: "paid",
    amountUsd: 250,
    snapshot: snapshot(250, "film-motion-graphics-animation", "2026-02-14T10:58:00Z", { tier: "freelancers" }),
    createdAt: "2026-02-14T10:58:00Z",
    confirmedAt: "2026-02-14T10:58:00Z",
    invoiceNumber: "GL-2026-0903",
  },
  {
    id: "pay-903b",
    entryId: "e-903",
    participantId: "p-016",
    kind: "tier_supplement",
    method: "stripe",
    status: "pending",
    amountUsd: 250,
    snapshot: null,
    createdAt: "2026-02-19T08:40:00Z",
    confirmedAt: null,
    paymentLinkUrl: "https://pay.example.com/gl/tier/e-903",
    invoiceNumber: "GL-2026-0903S",
  },
  {
    id: "pay-904",
    entryId: "e-904",
    participantId: "p-016",
    kind: "entry_fee",
    method: "stripe",
    status: "paid",
    amountUsd: 500,
    snapshot: snapshot(500, "packaging-packaging-design", "2026-01-28T11:31:00Z"),
    createdAt: "2026-01-28T11:31:00Z",
    confirmedAt: "2026-01-28T11:31:00Z",
    invoiceNumber: "GL-2026-0904",
  },
  {
    id: "pay-905",
    entryId: "e-905",
    participantId: "p-016",
    kind: "entry_fee",
    method: "stripe",
    status: "refunded",
    amountUsd: 425,
    snapshot: snapshot(500, "layout-poster-design", "2025-01-20T08:40:00Z", {
      submissionNumber: 5,
      loyalty: { ruleId: "loyalty-5th", percentOff: 15, amountUsd: 75 },
    }),
    createdAt: "2025-01-20T08:40:00Z",
    confirmedAt: "2025-01-20T08:40:00Z",
    invoiceNumber: "GL-2025-0905",
  },
  {
    id: "pay-906",
    entryId: "e-906",
    participantId: "p-016",
    kind: "entry_fee",
    method: "cash",
    status: "expired",
    amountUsd: 500,
    snapshot: snapshot(500, "visual-identity-brand-identity-design", "2026-01-05T09:22:00Z"),
    createdAt: "2026-01-05T09:22:00Z",
    confirmedAt: null,
    expiresAt: "2026-01-12T23:59:59Z",
    invoiceNumber: "GL-2026-0906",
  },
  {
    id: "pay-907",
    entryId: "e-901",
    participantId: "p-016",
    kind: "entry_fee",
    method: "stripe",
    status: "failed",
    amountUsd: 500,
    snapshot: snapshot(500, "layout-magazine-design", "2026-02-03T16:10:00Z"),
    createdAt: "2026-02-03T16:10:00Z",
    confirmedAt: null,
    invoiceNumber: "GL-2026-0907",
  },
  {
    id: "pay-911",
    entryId: "e-912",
    participantId: "p-003",
    kind: "entry_fee",
    method: "cash",
    status: "pending",
    amountUsd: 250,
    snapshot: snapshot(250, "layout-magazine-design", "2026-02-12T11:19:00Z", {
      tier: "freelancers",
    }),
    createdAt: "2026-02-12T11:19:00Z",
    confirmedAt: null,
    expiresAt: "2027-03-31T23:59:59Z",
    invoiceNumber: "GL-2026-0911",
  },
  {
    id: "pay-913",
    entryId: "e-913",
    participantId: "p-003",
    kind: "entry_fee",
    method: "stripe",
    status: "paid",
    amountUsd: 106.25,
    snapshot: snapshot(125, "digital-ui-ux", "2026-01-14T08:35:00Z", {
      tier: "students",
      promo: { code: "STUDENT15", kind: "percentage", value: 15, amountUsd: 18.75 },
    }),
    createdAt: "2026-01-14T08:35:00Z",
    confirmedAt: "2026-01-14T08:35:00Z",
    invoiceNumber: "GL-2026-0913",
  },
  {
    id: "pay-913b",
    entryId: "e-913",
    participantId: "p-003",
    kind: "tier_supplement",
    method: "stripe",
    status: "failed",
    amountUsd: 125,
    snapshot: null,
    createdAt: "2026-02-05T23:59:59Z",
    confirmedAt: null,
    paymentLinkUrl: "https://pay.example.com/gl/tier/e-913",
    invoiceNumber: "GL-2026-0913S",
  },
];

/**
 * The credit a downgrade issues, and one already spent.
 *
 * Both belong to p-016 so 2.9's credits list has a live row and a redeemed one
 * — a list that only ever shows unredeemed credits never shows what redemption
 * looks like.
 */
export const scenarioCredits = [
  {
    code: "GLCR-QM16-2027",
    ownerParticipantId: "p-016",
    amountUsd: 150,
    issuedForEntryId: "e-904",
    validForCycleId: "cycle-2027",
    issuedAt: "2026-02-21T09:15:00Z",
    redeemedAt: null,
  },
  {
    code: "GLCR-QM16-2026",
    ownerParticipantId: "p-016",
    amountUsd: 100,
    issuedForEntryId: "e-905",
    validForCycleId: "cycle-2026",
    issuedAt: "2025-03-02T10:00:00Z",
    redeemedAt: "2026-01-28T11:31:00Z",
  },
];

/**
 * Votes cast from the demo addresses.
 *
 * `emailHash` is computed by the same function the mock hashes with, so
 * `votes.forEmail` finds these for the signed-in account. Written as literals
 * rather than derived at import time, because the hash function lives in the
 * mock and the fixtures must not depend on it.
 */
export const scenarioVotes: Vote[] = [
  {
    id: "v-901",
    entryId: "e-470",
    cycleId: "cycle-2026",
    emailHash: "",
    otpVerifiedAt: "2026-06-04T10:12:00Z",
    requestedAt: "2026-06-04T10:10:00Z",
    ipHash: "h:mock",
    voided: false,
  },
  {
    id: "v-902",
    entryId: "e-605",
    cycleId: "cycle-2026",
    emailHash: "",
    otpVerifiedAt: "2026-06-09T18:40:00Z",
    requestedAt: "2026-06-09T18:38:00Z",
    ipHash: "h:mock",
    voided: false,
  },
  {
    id: "v-903",
    entryId: "e-001",
    cycleId: "cycle-2026",
    emailHash: "",
    otpVerifiedAt: "2026-06-11T08:05:00Z",
    requestedAt: "2026-06-11T08:03:00Z",
    ipHash: "h:mock",
    voided: false,
  },
];

/** Which address each scenario vote was cast from; hashed by the store. */
export const scenarioVoteEmails: Record<string, string> = {
  "v-901": "studio@qamar.design",
  "v-902": "studio@qamar.design",
  "v-903": "noor.alshammari@example.com",
};
