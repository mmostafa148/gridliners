import type {
  ContentLanguage,
  Entry,
  PricingConfig,
  Tier,
} from "@/lib/api/types";

/**
 * The wizard's working state, and the rules that decide when a step is done.
 *
 * **One shape, six steps, and the draft is the storage.** Every field here maps
 * onto something `Entry` already holds, so "save draft" is a real `update` on a
 * real entry rather than a parallel store that has to be reconciled later. The
 * only fields that are not on `Entry` are the ones that belong to the checkout
 * rather than the work - the promo code, the credit, the accepted terms - and
 * those are deliberately not persisted, because a quote is not a fact about a
 * project.
 */

export const WIZARD_STEPS = [1, 2, 3, 4, 5, 6] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];
export const DESCRIPTION_MAX = 1200;

export interface WizardDraft {
  tier: Tier | "";
  proof: {
    studentId: string;
    university: string;
    portfolioUrl: string;
    freelanceLicence: string;
    companyName: string;
    tradeLicence: string;
  };
  parentId: string;
  baseSubCategoryId: string;
  additionalSubCategoryIds: string[];
  title: string;
  client: string;
  country: string;
  contentLanguage: ContentLanguage;
  description: string;
  externalUrl: string;
  portfolioUrl: string;
  credits: string;
  media: {
    coverName: string;
    gallery: string[];
    documents: string[];
    videoUrl: string;
  };
}

export function emptyDraft(defaults: Partial<WizardDraft> = {}): WizardDraft {
  return {
    tier: "",
    proof: {
      studentId: "",
      university: "",
      portfolioUrl: "",
      freelanceLicence: "",
      companyName: "",
      tradeLicence: "",
    },
    parentId: "",
    baseSubCategoryId: "",
    additionalSubCategoryIds: [],
    title: "",
    client: "",
    country: "",
    contentLanguage: "en",
    description: "",
    externalUrl: "",
    portfolioUrl: "",
    credits: "",
    media: { coverName: "", gallery: [], documents: [], videoUrl: "" },
    ...defaults,
  };
}

/** Read an existing draft entry back into the wizard's shape. */
export function draftFromEntry(entry: Entry, parentOf: Map<string, string>): WizardDraft {
  const proof = entry.eligibilityProof;
  return {
    tier: entry.declaredTier,
    proof: {
      studentId: proof.studentId ?? "",
      university: proof.university ?? "",
      portfolioUrl: proof.portfolioUrl ?? "",
      freelanceLicence: proof.freelanceLicence ?? "",
      companyName: proof.companyName ?? "",
      tradeLicence: proof.tradeLicence ?? "",
    },
    parentId: parentOf.get(entry.baseSubCategoryId) ?? "",
    baseSubCategoryId: entry.baseSubCategoryId,
    additionalSubCategoryIds: [...entry.additionalSubCategoryIds],
    title: entry.title,
    client: entry.client ?? "",
    country: entry.country,
    contentLanguage: entry.contentLanguage,
    description: entry.description,
    externalUrl: entry.externalUrl ?? "",
    portfolioUrl: "",
    credits: entry.credits.join("\n"),
    media: {
      coverName: entry.media.coverUrl ? "cover" : "",
      gallery: entry.media.galleryUrls.map((_, i) => `image-${i + 1}`),
      documents: entry.media.documentUrls.map((_, i) => `document-${i + 1}`),
      videoUrl: entry.media.videoUrl ?? "",
    },
  };
}

/**
 * Which proofs a tier requires.
 *
 * Addendum §3.6: a student proves enrolment, a freelancer proves practice, a
 * company proves registration. The wizard asks for exactly the tier's own
 * fields and never all nine at once.
 */
export function requiredProofs(tier: Tier | ""): (keyof WizardDraft["proof"])[] {
  if (tier === "students") return ["studentId", "university"];
  if (tier === "freelancers") return ["portfolioUrl"];
  if (tier === "corporate") return ["companyName", "tradeLicence"];
  return [];
}

const URL_OK = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;

/**
 * What is wrong with one step, as field → message key.
 *
 * **Per step, not per form.** Validating the whole draft on step 2 would report
 * a missing title before the reader has been asked for one, which is how a
 * wizard teaches somebody to ignore its errors.
 */
export function validateStep(step: WizardStep, draft: WizardDraft): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!draft.tier) errors.tier = "tierRequired";
    for (const key of requiredProofs(draft.tier)) {
      if (!draft.proof[key].trim()) errors[key] = "proofRequired";
    }
    if (draft.proof.portfolioUrl && !URL_OK.test(draft.proof.portfolioUrl)) {
      errors.portfolioUrl = "urlInvalid";
    }
  }

  if (step === 2) {
    if (!draft.parentId) errors.parentId = "parentRequired";
    if (!draft.baseSubCategoryId) errors.baseSubCategoryId = "baseRequired";
  }

  if (step === 3) {
    if (!draft.title.trim()) errors.title = "titleRequired";
    if (!draft.country) errors.country = "countryRequired";
    if (!draft.description.trim()) errors.description = "descriptionRequired";
    else if (draft.description.length > DESCRIPTION_MAX) errors.description = "descriptionLong";
    if (draft.externalUrl && !URL_OK.test(draft.externalUrl)) errors.externalUrl = "urlInvalid";
    if (draft.portfolioUrl && !URL_OK.test(draft.portfolioUrl)) errors.portfolioUrl = "urlInvalid";
  }

  if (step === 4) {
    if (!draft.media.coverName) errors.cover = "coverRequired";
    if (draft.media.videoUrl && !URL_OK.test(draft.media.videoUrl)) errors.videoUrl = "urlInvalid";
  }

  return errors;
}

/** Every step up to and including `step` that is complete. */
export function completedThrough(draft: WizardDraft): WizardStep {
  for (const step of WIZARD_STEPS) {
    if (Object.keys(validateStep(step, draft)).length) return step;
  }
  return 6;
}

/**
 * The pricing window in force right now, for the live quote on steps 2 and 5.
 *
 * Read from the cycle's own windows rather than from a date the screen picks:
 * a window may be extended, and a quote built on the clock would contradict
 * the platform the moment it were.
 */
export function currentWindow(
  windows: { early_bird: { start: string; end: string }; normal: { start: string; end: string }; late: { start: string; end: string } },
  at = Date.now(),
): "early_bird" | "normal" | "late" {
  if (at <= Date.parse(windows.early_bird.end)) return "early_bird";
  if (at <= Date.parse(windows.normal.end)) return "normal";
  return "late";
}

/** The base price for a tier in the window that is open. */
export function basePriceFor(
  config: PricingConfig,
  tier: Tier,
  window: "early_bird" | "normal" | "late",
): number {
  return config.basePrices[tier][window];
}
