/**
 * Gridliners domain model.
 *
 * Mirrors the ratified data model in docs/gridliners-addendum-v1-1.md, which
 * outranks every other document. The load-bearing decisions encoded here:
 *
 *  - Results are GROUP-scoped, keyed Cycle × Sub-category × Tier × Entry
 *    (§3.1). One entry can hold different outcomes in each group it entered.
 *  - "Winner" is DERIVED, never stored as an entry state (§3.7).
 *  - The declared tier is never overwritten; verification keeps declared and
 *    verified side by side with full correction history (§3.3).
 *  - Every payment stores a full pricing snapshot, because quotes are final
 *    at checkout and must never be retro-priced (§3.4).
 *  - Platform-authored content is bilingual; entry content is shown as
 *    submitted and never translated (§3.8).
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** Platform-authored copy. The admin UI enforces both fields (§3.8). */
export interface LocalizedText {
  en: string;
  ar: string;
}

/** Language an entry was authored in. Displayed as submitted, never translated. */
export type ContentLanguage = "en" | "ar";

/** ISO-8601 timestamp. */
export type IsoDateTime = string;

export type Tier = "students" | "freelancers" | "corporate";
export const TIERS: readonly Tier[] = ["students", "freelancers", "corporate"];

export type PricingWindow = "early_bird" | "normal" | "late";
export const PRICING_WINDOWS: readonly PricingWindow[] = [
  "early_bird",
  "normal",
  "late",
];

/** Six phases: Config → Submission → Verification → Scoring → Voting → Results. */
export type CyclePhase =
  | "configuration"
  | "submissions"
  | "verification"
  | "jury_scoring"
  | "voting"
  | "results"
  | "closed";

/**
 * Entry state machine (§3.7). `Disqualified` is cross-cutting and reachable
 * from any state. There is deliberately no `winner` member.
 */
export type EntryState =
  | "draft"
  | "pending_payment"
  | "submitted"
  | "verified"
  | "shortlisted"
  | "not_shortlisted"
  | "excluded"
  | "cancelled"
  | "disqualified";

export const ENTRY_STATES: readonly EntryState[] = [
  "draft",
  "pending_payment",
  "submitted",
  "verified",
  "shortlisted",
  "not_shortlisted",
  "excluded",
  "cancelled",
  "disqualified",
];

/** Outcome of one group result. Ranks 1/2/3 map to gold/silver/bronze. */
export type AwardLevel = "gold" | "silver" | "bronze" | "did_not_place";

/** Asset colorways: metals for wins, blue for finalists, black for honorary. */
export type AssetColorway = "gold" | "silver" | "bronze" | "finalist" | "honorary";

export type PaymentMethod = "stripe" | "cash";

export type PaymentStatus = "paid" | "pending" | "expired" | "refunded" | "failed";

/** Entry fee vs a tier-correction top-up; both are linked to the entry (§3.3). */
export type PaymentKind = "entry_fee" | "tier_supplement";

// ---------------------------------------------------------------------------
// Cycle
// ---------------------------------------------------------------------------

export interface DateRange {
  start: IsoDateTime;
  end: IsoDateTime;
}

export interface Cycle {
  id: string;
  /** Public edition label. Open item: brand says 2026 while the cycle runs
   *  Nov → Feb (i.e. into 2027). See build-state conflict log. */
  year: number;
  label: LocalizedText;
  status: "active" | "archived";
  phase: CyclePhase;
  /** Participation period, split into the three pricing windows. */
  submissionWindows: Record<PricingWindow, DateRange>;
  juryScoringPeriod: DateRange;
  votingWindow: DateRange;
  resultsAnnouncementAt: IsoDateTime;
  /** Cash entries expire this many days after checkout (placeholder: 7). */
  cashExpiryDays: number;
  /** Jury final-score threshold to be shortlisted, per tier (placeholder: 60). */
  shortlistThresholds: Record<Tier, number>;
}

// ---------------------------------------------------------------------------
// Taxonomy & criteria (frozen — Appendix A)
// ---------------------------------------------------------------------------

export interface ParentCategory {
  id: string;
  name: LocalizedText;
  /**
   * What belongs in this category, in one sentence.
   *
   * A record rather than page copy: it is the taxonomy's own editorial field,
   * managed alongside the names by whoever manages the taxonomy, and 1.3 is not
   * the last screen that will need it. Keeping it here also keeps the message
   * files from growing a second, id-keyed copy of the taxonomy.
   *
   * Structure stays frozen per Appendix A: this adds a field to the record, not
   * a category, a sub-category, an id or a fee.
   */
  description: LocalizedText;
  order: number;
}

export interface SubCategory {
  id: string;
  parentId: string;
  name: LocalizedText;
  /** Fee to add this sub-category on top of the base entry (§1.2). */
  additionalFeeUsd: number;
  order: number;
}

/** Scored 0–100 by each juror; weights sum to 100 within a parent category. */
export interface Criterion {
  id: string;
  parentCategoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  weight: number;
}

/** Not enterable and never paid — Admin/jury designated (§1.4). */
export type HonoraryType =
  | "student_of_the_year"
  | "designer_of_the_year"
  | "best_agency"
  | "best_project"
  | "best_university"
  | "audience_award"
  | "sustainability_innovation";

export interface HonoraryDesignationOption {
  id: HonoraryType;
  name: LocalizedText;
  order: number;
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export interface LoyaltyRule {
  id: string;
  /** Applies from this submission number within the cycle onward. */
  fromSubmissionNumber: number;
  percentOff: number;
  label: LocalizedText;
}

export type PromoKind = "percentage" | "fixed" | "next_cycle_credit";

export interface PromoCode {
  id: string;
  code: string;
  kind: PromoKind;
  /** Percent for `percentage`, USD for `fixed` / `next_cycle_credit`. */
  value: number;
  validFrom: IsoDateTime;
  validUntil: IsoDateTime;
  maxRedemptions: number | null;
  redemptions: number;
  /** Set for participant-bound credits issued on a tier downgrade (§3.3). */
  boundParticipantId?: string;
  singleUse: boolean;
  active: boolean;
}

export interface PricingConfig {
  cycleId: string;
  currency: "USD";
  /** 3×3 base table: tier × window. */
  basePrices: Record<Tier, Record<PricingWindow, number>>;
  loyaltyRules: LoyaltyRule[];
  promoCodes: PromoCode[];
}

/** A single fee line inside a snapshot. */
export interface PricingLine {
  subCategoryId: string;
  label: LocalizedText;
  amountUsd: number;
}

/**
 * Full pricing snapshot stored on every payment (§3.4). Quotes are final at
 * checkout: later window changes, cash confirmation or expiry never re-price
 * an already-quoted entry.
 */
export interface PricingSnapshot {
  window: PricingWindow;
  tier: Tier;
  basePriceUsd: number;
  baseSubCategoryId: string;
  additionalSubCategories: PricingLine[];
  /** Cycle submission number captured at checkout. */
  submissionNumber: number;
  loyalty: { ruleId: string; percentOff: number; amountUsd: number } | null;
  promo: {
    code: string;
    kind: PromoKind;
    value: number;
    amountUsd: number;
  } | null;
  /**
   * A next-cycle credit spent against this entry, or null.
   *
   * The eighth logged model extension. A downgrade settlement issues a `Credit`
   * (§3.3) and the wizard has to be able to spend it, which means the amount
   * has to survive in the frozen snapshot beside loyalty and promo - otherwise
   * Billing shows a total that its own line items do not add up to.
   */
  credit: { code: string; amountUsd: number } | null;
  subtotalUsd: number;
  totalUsd: number;
  quotedAt: IsoDateTime;
}

export interface Payment {
  id: string;
  entryId: string;
  participantId: string;
  kind: PaymentKind;
  method: PaymentMethod;
  status: PaymentStatus;
  amountUsd: number;
  snapshot: PricingSnapshot | null;
  createdAt: IsoDateTime;
  /** Set when Stripe settles, or when Admin confirms cash receipt. */
  confirmedAt: IsoDateTime | null;
  /** Cash only: the auto-cancel deadline. */
  expiresAt?: IsoDateTime;
  /** Tier supplements carry the Stripe payment link sent to the participant. */
  paymentLinkUrl?: string;
  invoiceNumber: string;
}

/** Participant-bound, single-use, next-cycle credit from a tier downgrade. */
export interface Credit {
  code: string;
  ownerParticipantId: string;
  amountUsd: number;
  issuedForEntryId: string;
  validForCycleId: string;
  issuedAt: IsoDateTime;
  redeemedAt: IsoDateTime | null;
}

// ---------------------------------------------------------------------------
// Participants & entries
// ---------------------------------------------------------------------------

export interface Participant {
  id: string;
  name: string;
  email: string;
  country: string;
  /** Drives the language of every email sent to them (§3.8). */
  uiLanguage: ContentLanguage;
  createdAt: IsoDateTime;
  /** Count of entries that reached Submitted, across cycles. */
  lifetimeSubmissions: number;

  /**
   * The rest of the account record - the seventh logged model extension.
   *
   * The Sitemap's **My Profile** branch names Full Name, Email Address, Job
   * Title, Nationality, Country of Residence, Company Name and Photo/Logo.
   * Four of those had nowhere to live: `country` is the country of residence
   * and is not the same fact as nationality, and job title, company name and
   * the photo were absent entirely.
   *
   * Every one is optional. A participant who has only ever registered has a
   * name, an email and a language, and 2.8 must render that account without
   * inventing the rest of it - which is also the empty state the brief asks
   * for. Nothing on a public screen reads any of these.
   */
  jobTitle?: string;
  /** ISO 3166-1 alpha-2, like `country`, but the passport rather than the desk. */
  nationality?: string;
  companyName?: string;
  /** A portrait or a company logo; the participant chooses which it is. */
  photoUrl?: string;
}

/**
 * A page of results from a service that paginates.
 *
 * **Paging happens in the service, not in a component.** My Entries, Billing
 * and My Votes each read a set that grows without bound across cycles, and a
 * screen that fetches everything and slices it is a screen that gets slower
 * every year while looking like it works.
 */
export interface Page<T> {
  items: T[];
  /** Rows matching the filter, before paging. */
  total: number;
  /** 1-based, already clamped into range by the service. */
  page: number;
  pageSize: number;
  pages: number;
}

/** Admin-only evidence (§3.6): never exposed to jury or public. */
export interface EligibilityProof {
  tier: Tier;
  studentId?: string;
  university?: string;
  portfolioUrl?: string;
  freelanceLicence?: string;
  companyName?: string;
  tradeLicence?: string;
  /** Purged after the cycle plus a retention window (placeholder: 6 months). */
  retentionUntil: IsoDateTime;
}

export interface EntryMedia {
  coverUrl: string;
  galleryUrls: string[];
  documentUrls: string[];
  videoUrl?: string;
}

export interface TierCorrection {
  from: Tier;
  to: Tier;
  actor: string;
  at: IsoDateTime;
  note?: string;
}

export type SettlementKind = "payment_link" | "credit";
export type SettlementStatus = "pending" | "settled" | "unresolved";

/** Tier-difference settlement (§3.3). Computed against the entry's ORIGINAL
 *  submission window pricing, never the current window. */
export interface Settlement {
  kind: SettlementKind;
  status: SettlementStatus;
  amountUsd: number;
  deadline: IsoDateTime;
  paymentId?: string;
  creditCode?: string;
}

/**
 * Verification record. The declared tier is never overwritten — it lives on
 * the entry, and this record carries the verified tier plus provenance.
 */
export interface VerificationRecord {
  declaredTier: Tier;
  verifiedTier: Tier;
  actor: string;
  verifiedAt: IsoDateTime | null;
  corrections: TierCorrection[];
  settlement: Settlement | null;
}

/** Re-categorization is allowed only during Tier Verification (§1.3). */
export interface CategoryMove {
  fromSubCategoryId: string;
  toSubCategoryId: string;
  fromParentId: string;
  toParentId: string;
  actor: string;
  at: IsoDateTime;
  participantNotifiedAt: IsoDateTime | null;
  priceDeltaUsd: number;
}

export interface Entry {
  id: string;
  slug: string;
  cycleId: string;
  participantId: string;
  state: EntryState;

  title: string;
  description: string;
  /** Entry content is rendered as submitted — AR or EN, never translated. */
  contentLanguage: ContentLanguage;
  country: string;
  credits: string[];
  /**
   * Where the work itself lives, if the entrant published it anywhere.
   *
   * The fifth logged data-model extension, added for §1.8 bullet 4. Optional
   * because most entries have nowhere to point: the entry wizard's step 4
   * (screen-map 2.4) collects a cover, a gallery, documents and a video URL,
   * and a project's own address is a separate thing from all four.
   *
   * `store.ts` is untouched - a fixture that sets nothing renders nothing.
   */
  externalUrl?: string;
  /**
   * The organisation the work was made for.
   *
   * The sixth logged data-model extension. The Sitemap lists **Project Client**
   * as a mapped element of the project page, and it is a different fact from
   * the participant who entered: the owner made the work, the client
   * commissioned it. Nothing else in the model carried it, so the page could
   * only show it for the handful of projects that had hand-written story data
   * and left it off the other 386.
   *
   * Optional, because a self-initiated project has no client, and never
   * translated - a client's name is entry content like the title (§3.8).
   */
  client?: string;
  media: EntryMedia;

  /** What the participant declared. Never mutated by verification. */
  declaredTier: Tier;
  /** Base sub-category, included in the base price; sets parent + criteria. */
  baseSubCategoryId: string;
  /** Optional paid add-ons — must share the base sub-category's parent (§1.2). */
  additionalSubCategoryIds: string[];

  eligibilityProof: EligibilityProof;
  verification: VerificationRecord | null;
  categoryMove: CategoryMove | null;

  createdAt: IsoDateTime;
  /** Tiebreak timestamp: checkout completion, not cash confirmation (§3.1). */
  checkoutCompletedAt: IsoDateTime | null;
  submittedAt: IsoDateTime | null;

  paymentIds: string[];
  /** Populated once the whole cohort has scored. */
  juryFinalScore: number | null;
  disqualificationId?: string;
}

/** Effective tier for judging and ranking: verified when known, else declared. */
export function effectiveTier(entry: Entry): Tier {
  return entry.verification?.verifiedTier ?? entry.declaredTier;
}

// ---------------------------------------------------------------------------
// Jury & scoring
// ---------------------------------------------------------------------------

export interface Juror {
  id: string;
  name: LocalizedText;
  title: LocalizedText;
  /**
   * Where the juror practises. Part of the person's record rather than page
   * copy: 1.5 publishes it, the jury shell greets by it, and an admin editing
   * the panel edits it here.
   */
  company: LocalizedText;
  /**
   * One short paragraph, bilingual. A juror is published with their scope and
   * their standing, and the standing is this.
   */
  bio: LocalizedText;
  photoUrl: string;
  country: string;
  socials: { platform: string; url: string }[];
  /** Assigned at parent-category level; sub-categories are inherited. */
  assignedParentCategoryIds: string[];
  /** Soft factor when Admin composes cohorts (§3.8). */
  languages: ContentLanguage[];
  active: boolean;
}

export interface CriterionScore {
  criterionId: string;
  /** 0–100. */
  score: number;
}

export interface Score {
  id: string;
  jurorId: string;
  entryId: string;
  criterionScores: CriterionScore[];
  weightedTotal: number;
  submittedAt: IsoDateTime | null;
  /** Admin filled in for a no-show juror; auditable, internal only (§3.5). */
  enteredByAdmin: { actor: string; at: IsoDateTime; justification: string } | null;
}

/** Cohort freezes per parent category when scoring opens (§3.5). */
export interface JuryCohort {
  cycleId: string;
  parentCategoryId: string;
  jurorIds: string[];
  frozenAt: IsoDateTime | null;
}

// ---------------------------------------------------------------------------
// Voting
// ---------------------------------------------------------------------------

export interface Vote {
  id: string;
  entryId: string;
  cycleId: string;
  /** Stored hashed; plus-addressing is normalized before hashing. */
  emailHash: string;
  /** A vote counts if its OTP was verified before the window closed (§3.2). */
  otpVerifiedAt: IsoDateTime | null;
  requestedAt: IsoDateTime;
  ipHash: string;
  /** Admin fraud-voiding is silent — no notification is ever sent (§3.2). */
  voided: boolean;
  voidedReason?: string;
}

export interface OtpChallenge {
  id: string;
  entryId: string;
  email: string;
  expiresAt: IsoDateTime;
  verifiedAt: IsoDateTime | null;
  attempts: number;
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

/**
 * Group-scoped result (§3.1). The key is Cycle × Sub-category × Tier × Entry;
 * deliverables (badge, award page, certificate) attach to THIS record, not to
 * the entry.
 */
export interface GroupResult {
  id: string;
  cycleId: string;
  subCategoryId: string;
  tier: Tier;
  entryId: string;
  votes: number;
  rank: number | null;
  level: AwardLevel;
  /** Admin may withhold a medal in a thin group (§3.1). */
  withheld: boolean;
  withheldReason?: string;
  finalized: boolean;
  finalizedAt: IsoDateTime | null;
  /** Ordered trace of what decided the rank: votes → jury score → checkout. */
  tiebreakTrace?: string[];
}

/** Honorary designation — attached to a person or entity, black colorway,
 *  certificate omits the Tier line (§1.4). */
export interface HonoraryDesignation {
  id: string;
  cycleId: string;
  type: HonoraryType;
  subject: { kind: "person" | "entity"; name: string };
  /** Optional: some designations reference a project, others do not. */
  entryId?: string;
  citation: LocalizedText;
  designatedBy: string;
  designatedAt: IsoDateTime;
  published: boolean;
}

/** Derived summary — "Winner" is never stored on the entry (§3.7). */
export interface WinnerSummary {
  entryId: string;
  isWinner: boolean;
  medals: { level: Exclude<AwardLevel, "did_not_place">; resultId: string }[];
  /** True once the entry reached Cadet status; drives the blue badge. */
  isFinalist: boolean;
}

// ---------------------------------------------------------------------------
// Governance
// ---------------------------------------------------------------------------

/** Durable record, separate from entry status (§3.6). */
export interface DisqualificationRecord {
  id: string;
  participantId: string;
  subjectName: string;
  entryId?: string;
  reason: LocalizedText;
  evidence: string;
  actor: string;
  at: IsoDateTime;
  /** Current edition plus any future bans, per the rules. */
  affectedCycleIds: string[];
}

export type AuditAction =
  | "tier_verified"
  | "tier_correction"
  | "cash_confirmed"
  | "settlement_issued"
  | "admin_entered_score"
  | "category_moved"
  | "votes_voided"
  | "disqualification"
  | "medal_withheld"
  | "result_finalized";

/** Comprehensive audit log — a v1 NFR, not a nice-to-have (§3.6). */
export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actor: string;
  at: IsoDateTime;
  entityType: "entry" | "result" | "vote" | "participant" | "score" | "payment";
  entityId: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationAudience = "participant" | "jury" | "voter" | "admin";

export type NotificationTiming =
  | "immediate"
  | "scheduled"
  | "on_admin_action"
  | "optional";

/** Every template exists in both languages (§3.8). Recipient language follows
 *  the UI language, except voter emails which follow the page they voted from. */
export interface NotificationTemplate {
  id: string;
  /** Source section in the Notification Specification or the addendum. */
  source: string;
  audience: NotificationAudience;
  trigger: LocalizedText;
  timing: NotificationTiming;
  scheduleHint?: string;
  subject: LocalizedText;
  body: LocalizedText;
  /** Admin-toggleable templates (e.g. "Thank You for Participating"). */
  enabled: boolean;
  optional: boolean;
}

// ---------------------------------------------------------------------------
// Auth (mocked behind an interface so the real backend drops in later)
// ---------------------------------------------------------------------------

export type UserRole = "participant" | "jury" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  uiLanguage: ContentLanguage;
  /** Set for jury accounts. */
  jurorId?: string;
  /** Set for participant accounts. */
  participantId?: string;
}

// ---------------------------------------------------------------------------
// Editorial content
//
// Marketing surfaces the awards programme publishes about itself: the
// announcement bar, News & Insights, Partners, Testimonials. Read-only, and
// deliberately outside the mutable store, since a CMS owns this rather than the
// application.
// ---------------------------------------------------------------------------

export interface Announcement {
  id: string;
  message: LocalizedText;
  href?: string;
  linkLabel?: LocalizedText;
  startsAt: IsoDateTime;
  /** null = runs until it is taken down by hand. */
  endsAt: IsoDateTime | null;
}

/**
 * What a media-centre record is.
 *
 * The Sitemap's Media Center branch is one content type with three public
 * kinds - News & Highlights, Blog, Winner Interviews - and the content map
 * names the same three (§1.11). `event` predates them and stays: Home lists
 * upcoming events from this table, and an event is a dated notice rather than
 * a piece of writing.
 */
export type NewsKind = "news" | "article" | "interview" | "event";

/**
 * A category a post is filed under, from the Sitemap's "List of Blogs by
 * Categories". A record rather than a string union, because §5.14 gives the
 * admin a post-categories manager.
 */
export interface PostCategory {
  id: string;
  slug: string;
  name: LocalizedText;
}

/** One movement of a post body: an optional heading and its paragraphs. */
export interface PostSection {
  heading?: LocalizedText;
  paragraphs: LocalizedText[];
}

/**
 * The interviewee, for `kind: "interview"`.
 *
 * **The portrait is drawn, not photographed.** Attaching a real face to an
 * invented name misrepresents a person who never agreed to appear here, so the
 * seed drives a generated graphic portrait and no photograph of a human being
 * is used for anybody who does not exist.
 */
export interface Interviewee {
  name: LocalizedText;
  role: LocalizedText;
  /** Drives the drawn portrait, so a person looks the same on every render. */
  portraitSeed: number;
  videoUrl: string;
  posterUrl: string;
  /** What was said, for a reader who cannot or will not play the film. */
  transcript: PostSection[];
}

export interface NewsItem {
  id: string;
  slug: string;
  kind: NewsKind;
  title: LocalizedText;
  excerpt: LocalizedText;
  imageUrl: string;
  /** width / height of the source frame, so cells reserve their space. */
  ratio: number;
  publishedAt: IsoDateTime;
  /** Events only: when it happens, and where. */
  startsAt?: IsoDateTime;
  venue?: LocalizedText;
  /** Which category it is filed under. Every post has one; events may not. */
  categoryId?: string;
  /** The body, in sections. Absent on events, which are notices. */
  body?: PostSection[];
  /** Set on `kind: "interview"` and on nothing else. */
  interview?: Interviewee;
  /** Rounded reading time, computed from the body when the fixture is built. */
  readMinutes?: number;
}

/**
 * A published question and its answer, for the About page's FAQ list.
 *
 * A record rather than page copy: content-map §5.11 gives the admin an FAQs
 * editor separate from its page editors, so this is a list the client curates
 * and reorders, not prose inside a template.
 */
export interface Faq {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  order: number;
}

/**
 * Somebody who runs the programme.
 *
 * `name` is the person, `role` is their post, `bio` is the one thing that post
 * is responsible for.
 *
 * `photoUrl` is nullable and null throughout the fixtures: **no team
 * photography exists in this repo**, and none may be invented. Real portraits
 * of real people cannot be attached to invented names — that is the exact
 * defect `fixtures/jury.ts` logs against its own panel, where two studio
 * portraits under invented names depicted strangers as those people. The About
 * page draws a deterministic brand mosaic in the frame instead, and swapping in
 * six real files is a fixture edit with no code change.
 *
 * `links` is nullable per network for the same reason the organisation's own
 * handles are unverified in `social-icons.tsx`: a link pointing at a stranger's
 * account is worse than no link, so a null renders nothing at all.
 */
export interface TeamMember {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  bio: LocalizedText;
  order: number;
  photoUrl: string | null;
  links: {
    linkedin: string | null;
    instagram: string | null;
  };
}

/**
 * One year's ceremony: where it was held, and one frame of it.
 *
 * Deliberately not on `Cycle`. A cycle is the competition — windows, phases,
 * thresholds — and entries and pricing key off it; a venue and a photograph
 * have no business in that type. This joins to a cycle by `year` instead.
 */
export interface CeremonyEdition {
  id: string;
  /** Joins to `Cycle.year`. */
  year: number;
  city: LocalizedText;
  /** null where the venue is not settled or not recorded. */
  venue: LocalizedText | null;
  /** null where no photograph of that year exists. */
  image: { src: string; ratio: number } | null;
  /**
   * The host city, not the ceremony.
   *
   * A ceremony still to come has no photograph of itself and may never be given
   * one before the night - but the city it will be held in exists and can be
   * pictured, which is why this is a separate field rather than a second use of
   * `image`. Conflating them is exactly the error this build already made once:
   * a frame of a lit stage under a year still in `voting` reads as a record of
   * a night that has not taken place.
   *
   * `null` on every edition today. The client has supplied no city photography
   * and none is invented; the finalists hero falls back to the pixel grid until
   * one arrives, and renders the photograph the moment it does.
   */
  cityImage: { src: string; ratio: number } | null;
  /**
   * The ceremony's main film.
   *
   * `null` until the client supplies footage, which is the state of every
   * edition today — there is no video file in the repository. A screen renders
   * the film when there is one and omits the slot entirely when there is not.
   * Nothing stands in for it.
   */
  videoUrl: string | null;
  /**
   * Further photographs of the night, beyond `image`.
   *
   * Empty where none exist. `image` stays the edition's single lead frame, so
   * About keeps working unchanged; this is the set a per-year event overview
   * shows beneath it.
   */
  gallery: { src: string; ratio: number }[];
}

export type PartnerTier = "principal" | "partner" | "supporter";

export interface Partner {
  id: string;
  name: string;
  /**
   * What the partner does, from the Sitemap's Partners > Categories.
   *
   * **Distinct from `tier`, and it is this that the partners page groups by.**
   * `tier` is a commercial fact the client uses elsewhere; the wall shows every
   * mark at one weight, because a logo wall that scales by spend is a medal
   * table wearing a different hat.
   */
  categoryId: string;
  tier: PartnerTier;
  url: string;
  /** Real marks come from the client; until then the name is set in Presicav. */
  logoUrl?: string;
  /**
   * Optical size against the tier's cap height. Normalising marks by their
   * bounding box is the thing that makes a logo wall look uneven: a wordmark
   * capped at the same height as a bare symbol carries far more ink, so the
   * symbol reads small and the wordmark reads loud. This is the per-mark
   * correction, set by eye, which is the only way it is ever set.
   */
  logoScale?: number;
}

export interface Testimonial {
  id: string;
  quote: LocalizedText;
  author: LocalizedText;
  role: LocalizedText;
  imageUrl?: string;
  /**
   * The part of the programme this quote is actually about. Praise in general
   * is worth nothing and reads as invented; these three each name a specific
   * mechanism, and the section labels them so the reader can see that.
   */
  topic?: LocalizedText;
}
