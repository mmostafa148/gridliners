import type {
  PostCategory,
  AuditLogEntry,
  AwardLevel,
  ContentLanguage,
  Credit,
  Criterion,
  Cycle,
  DisqualificationRecord,
  Entry,
  EntryState,
  GroupResult,
  HonoraryDesignation,
  HonoraryDesignationOption,
  JuryCohort,
  Juror,
  NotificationTemplate,
  Page,
  ParentCategory,
  Participant,
  Payment,
  PaymentKind,
  PaymentMethod,
  PaymentStatus,
  PricingConfig,
  PricingSnapshot,
  Score,
  SessionUser,
  SubCategory,
  Tier,
  UserRole,
  Vote,
  WinnerSummary,
  Announcement,
  CeremonyEdition,
  Faq,
  NewsItem,
  NewsKind,
  Partner,
  TeamMember,
  Testimonial,
} from "./types";

/**
 * Service interfaces — the contract screens code against.
 *
 * Phase 0 ships mock implementations; the real backend replaces them behind
 * these same signatures, so no screen changes. Payment, OTP and auth are
 * deliberately isolated here for exactly that reason.
 */

export interface CyclesService {
  list(): Promise<Cycle[]>;
  getActive(): Promise<Cycle>;
  getById(id: string): Promise<Cycle | null>;
  getByYear(year: number): Promise<Cycle | null>;
  /** Admin: advance or set the phase. */
  setPhase(id: string, phase: Cycle["phase"]): Promise<Cycle>;
}

export interface TaxonomyService {
  parentCategories(): Promise<ParentCategory[]>;
  subCategories(parentId?: string): Promise<SubCategory[]>;
  subCategory(id: string): Promise<SubCategory | null>;
  criteria(parentCategoryId: string): Promise<Criterion[]>;
  honoraryOptions(): Promise<HonoraryDesignationOption[]>;
}

export interface QuoteRequest {
  cycleId: string;
  tier: Tier;
  baseSubCategoryId: string;
  additionalSubCategoryIds: string[];
  participantId: string;
  promoCode?: string;
  /**
   * A credit to spend, by code.
   *
   * Validated by the service, not by the caller: it has to belong to this
   * participant, be valid for this cycle and not already be redeemed. An
   * invalid code prices as if it were absent rather than throwing, because a
   * quote is a question and the answer is "that changes nothing".
   */
  creditCode?: string;
  /** Defaults to now; the window is resolved from this instant. */
  at?: string;
}

export interface PricingService {
  config(cycleId: string): Promise<PricingConfig>;
  /** Live quote. Becomes a frozen snapshot the moment checkout completes. */
  quote(request: QuoteRequest): Promise<PricingSnapshot>;
  /** Spendable credits: this participant's, not yet redeemed. */
  creditsForParticipant(participantId: string): Promise<Credit[]>;
  /**
   * Every credit ever issued to this participant, redeemed or not.
   *
   * Billing needs the redeemed ones - a credits list that silently drops a
   * credit the moment it is spent cannot answer "what happened to it".
   */
  allCreditsForParticipant(participantId: string): Promise<Credit[]>;
}

export interface EntryFilter {
  cycleId?: string;
  /**
   * Several calendars at once.
   *
   * Added for My Entries' multi-select filters. `cycleId` is unchanged and
   * every existing caller keeps working; when both are given they intersect,
   * which is what a caller asking for both would mean.
   */
  cycleIds?: string[];
  participantId?: string;
  states?: EntryState[];
  tier?: Tier;
  parentCategoryId?: string;
  subCategoryId?: string;
  search?: string;
}

export interface CreateEntryInput {
  cycleId: string;
  participantId: string;
  title: string;
  description: string;
  contentLanguage: ContentLanguage;
  country: string;
  declaredTier: Tier;
  baseSubCategoryId: string;
  additionalSubCategoryIds?: string[];
}

/** My Entries' whole query, in one object so the URL and the service agree. */
export interface EntryPageQuery extends EntryFilter {
  page?: number;
  pageSize?: number;
}

export interface EntriesService {
  list(filter?: EntryFilter): Promise<Entry[]>;
  /**
   * One page of a participant's entries.
   *
   * `participantId` is required rather than optional: this is the read My
   * Entries uses, and a paginated entry list with no owner is a query nobody
   * on a participant screen should be able to write by accident.
   */
  page(query: EntryPageQuery & { participantId: string }): Promise<Page<Entry>>;
  getById(id: string): Promise<Entry | null>;
  getBySlug(slug: string): Promise<Entry | null>;
  create(input: CreateEntryInput): Promise<Entry>;
  update(id: string, patch: Partial<Entry>): Promise<Entry>;
  /** Draft → Submitted (card) or Pending Payment (cash). */
  submit(id: string, method: PaymentMethod, snapshot: PricingSnapshot): Promise<Entry>;
  /** Admin: record the verified tier and any settlement. */
  verify(id: string, verifiedTier: Tier, actor: string): Promise<Entry>;
  /**
   * Participant: abandon a draft.
   *
   * Only a draft. Anything that has been paid for is a financial record and
   * `cancelled` is an Admin outcome, not a participant's button.
   */
  discardDraft(id: string, participantId: string): Promise<void>;
  /** Participant: settle a tier upgrade through the mock card route. */
  settleUpgrade(id: string, participantId: string): Promise<Entry>;
}

export interface ResultsService {
  /** Finalized results only — what public screens are allowed to show. */
  published(cycleId: string): Promise<GroupResult[]>;
  /** Every result including proposed, pre-finalization ones (Admin only). */
  all(cycleId: string): Promise<GroupResult[]>;
  forEntry(entryId: string): Promise<GroupResult[]>;
  forGroup(cycleId: string, subCategoryId: string, tier: Tier): Promise<GroupResult[]>;
  /** Derived summary — "Winner" is never a stored entry state. */
  winnerSummary(entryId: string): Promise<WinnerSummary>;
  honorary(cycleId: string): Promise<HonoraryDesignation[]>;
  /** Admin: withhold a medal in a thin group. */
  withhold(resultId: string, reason: string, actor: string): Promise<GroupResult>;
  finalizeGroup(cycleId: string, subCategoryId: string, tier: Tier, actor: string): Promise<GroupResult[]>;
}

export interface VotesService {
  countForEntry(entryId: string): Promise<number>;
  list(cycleId: string): Promise<Vote[]>;
  /** Records a vote whose OTP has already been verified. */
  record(entryId: string, email: string): Promise<Vote>;
  /** Silent by design — no notification is ever sent (§3.2). */
  void(voteIds: string[], reason: string, actor: string): Promise<Vote[]>;
  hasVoted(entryId: string, email: string): Promise<boolean>;
  /**
   * One page of the votes cast from `email`, newest first.
   *
   * **Matched on the same normalized hash the dedup rule uses**, so a vote cast
   * from `name+tag@host` is found by `name@host` - which is the address the
   * account is signed in with. Returns the vote and nothing about any other
   * voter: no hash, no OTP record, no IP, no fraud flag.
   */
  forEmail(email: string, page?: { page?: number; pageSize?: number }): Promise<Page<Vote>>;
}

export interface OtpService {
  request(entryId: string, email: string): Promise<{ challengeId: string; expiresAt: string }>;
  verify(challengeId: string, code: string): Promise<{ ok: boolean; reason?: "expired" | "invalid" }>;
}

export interface JuryService {
  jurors(): Promise<Juror[]>;
  juror(id: string): Promise<Juror | null>;
  cohorts(cycleId: string): Promise<JuryCohort[]>;
  /** Verified entries visible to a juror, in their assigned parents. */
  queue(jurorId: string, cycleId: string): Promise<Entry[]>;
  scores(entryId: string): Promise<Score[]>;
  scoreFor(jurorId: string, entryId: string): Promise<Score | null>;
  saveScore(input: Omit<Score, "id" | "weightedTotal">): Promise<Score>;
}

export interface NotificationsService {
  templates(): Promise<NotificationTemplate[]>;
  template(id: string): Promise<NotificationTemplate | null>;
  update(id: string, patch: Partial<NotificationTemplate>): Promise<NotificationTemplate>;
}

/** Everything 2.8 Profile may write. Deliberately not `Partial<Participant>`. */
export interface ProfilePatch {
  name?: string;
  email?: string;
  jobTitle?: string;
  nationality?: string;
  country?: string;
  companyName?: string;
  photoUrl?: string | null;
  uiLanguage?: ContentLanguage;
}

export interface ParticipantsService {
  list(): Promise<Participant[]>;
  getById(id: string): Promise<Participant | null>;
  /**
   * Profile edit.
   *
   * A named patch type rather than `Partial<Participant>`: the wide version
   * would let a screen write `lifetimeSubmissions` or `createdAt`, which are
   * derived and historical facts respectively.
   */
  update(id: string, patch: ProfilePatch): Promise<Participant>;
}

export interface PaymentPageQuery {
  participantId: string;
  status?: PaymentStatus;
  kind?: PaymentKind;
  /** Several at once, for Billing's multi-select filters. Additive: the
   *  singular fields above are unchanged and still honoured. */
  statuses?: PaymentStatus[];
  kinds?: PaymentKind[];
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentsService {
  forEntry(entryId: string): Promise<Payment[]>;
  forParticipant(participantId: string): Promise<Payment[]>;
  /** One page of a participant's financial record, newest first. */
  page(query: PaymentPageQuery): Promise<Page<Payment>>;
  /** Cash: the participant lets an unpaid reference lapse, or it times out. */
  expireCash(paymentId: string, participantId: string): Promise<Payment>;
  /** Mocked Stripe: resolves as if the hosted checkout succeeded. */
  charge(entryId: string, snapshot: PricingSnapshot): Promise<Payment>;
  /** Cash: creates the pending record and its expiry. */
  createCashPending(entryId: string, snapshot: PricingSnapshot): Promise<Payment>;
  /** Admin confirms cash receipt. */
  confirmCash(paymentId: string, actor: string): Promise<Payment>;
}

export interface GovernanceService {
  auditLog(): Promise<AuditLogEntry[]>;
  disqualifications(): Promise<DisqualificationRecord[]>;
  record(entry: Omit<AuditLogEntry, "id">): Promise<AuditLogEntry>;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  uiLanguage: ContentLanguage;
  /** Must be true. The service rejects the registration otherwise. */
  acceptedTerms: boolean;
}

/**
 * Why a result object rather than a thrown error.
 *
 * Every one of these outcomes is something a form has to *say*, in the right
 * place, in the right language - a duplicate email belongs on the email field,
 * a wrong password on the form. Throwing would make the screen re-derive that
 * from a message string.
 */
export type AuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: "invalid_credentials" | "email_taken" | "terms_required" | "server_error" };

export type ResetResult =
  | { ok: true }
  | { ok: false; reason: "invalid_token" | "expired_token" | "server_error" };

export interface AuthService {
  /**
   * **Read-only, and it does not decide who is signed in.**
   *
   * The mock store is one object per server process, so a `session` field on it
   * is shared by every visitor at once - which is not a session, it is a global
   * variable. Who is signed in lives in the request's cookie and is resolved by
   * `lib/auth/session.ts`; this returns whatever the store happens to hold and
   * exists for the dev tools and the kitchen sink.
   */
  session(): Promise<SessionUser | null>;
  /** Mocked sign-in by role: kept for `/dev/kitchen-sink`, not used by 2.1. */
  signInAs(role: UserRole): Promise<SessionUser>;
  signOut(): Promise<void>;

  /** Credentials against the fixture accounts. Never reveals which half failed. */
  signIn(email: string, password: string): Promise<AuthResult>;
  register(input: RegisterInput): Promise<AuthResult>;
  /**
   * **Always resolves, whatever the address.** Telling a caller that an email
   * is unknown turns the form into a membership oracle, which is exactly what
   * the brief forbids. A token is minted only when the account exists.
   */
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<ResetResult>;
  changePassword(userId: string, current: string, next: string): Promise<AuthResult>;
  /** The account behind a session, for route guards and profile reads. */
  userById(id: string): Promise<SessionUser | null>;
}

/**
 * Editorial content. Read-only: there is no create/update here because the
 * screens that use it never write, and a CMS will own it.
 */
export interface ContentService {
  /** The announcement live at `at`, or null. One bar, one message. */
  announcement(at?: Date): Promise<Announcement | null>;
  news(filter?: { kind?: NewsKind; limit?: number }): Promise<NewsItem[]>;
  /**
   * The media centre, paged.
   *
   * **Paging happens here, not in the page.** A listing that fetches every
   * record and slices it in the component is a listing that will not survive
   * the real backend, where the count and the window come from the query.
   * `total` is the count *after* filtering, so the control knows how many
   * pages exist without a second call.
   */
  posts(filter?: {
    kind?: NewsKind;
    categoryId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: NewsItem[]; total: number; page: number; pageSize: number; pages: number }>;
  /** One post, or null when the slug is not published. */
  postBySlug(slug: string): Promise<NewsItem | null>;
  /** Posts sharing a category, newest first, excluding the one being read. */
  relatedPosts(slug: string, limit?: number): Promise<NewsItem[]>;
  /** The categories a post can be filed under, in the client's order. */
  postCategories(): Promise<PostCategory[]>;
  partners(filter?: { categoryId?: string }): Promise<Partner[]>;
  testimonials(): Promise<Testimonial[]>;
  /** About's FAQ list, in the order the client set. */
  faqs(): Promise<Faq[]>;
  /** The people who run the programme, in the order the client set. */
  team(): Promise<TeamMember[]>;
  /** Past and current ceremonies, newest year first. */
  ceremonies(): Promise<CeremonyEdition[]>;
}

/**
 * The two public inboxes: Contact and Become a Partner.
 *
 * §5.11 gives the admin a contact inbox and a partner inbox, so a submission is
 * a record the programme receives rather than an email the browser sends. Both
 * return a reference the sender can quote, because "we got it" with nothing to
 * quote is not a confirmation.
 */
export interface InboxService {
  contact(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    locale: string;
  }): Promise<{ ok: true; reference: string } | { ok: false; reason: string }>;
  partner(payload: {
    organisation: string;
    contactPerson: string;
    email: string;
    phone: string;
    message: string;
    locale: string;
  }): Promise<{ ok: true; reference: string } | { ok: false; reason: string }>;
}

export interface NewsletterService {
  /**
   * `already` is a success for the reader and a no-op for the list: telling a
   * visitor whether an address is on it would leak whether that person entered.
   */
  subscribe(
    email: string,
    locale: string,
  ): Promise<{ ok: true; already: boolean } | { ok: false; reason: "invalid" }>;
}

export interface GridlinersApi {
  newsletter: NewsletterService;
  content: ContentService;
  inbox: InboxService;
  cycles: CyclesService;
  taxonomy: TaxonomyService;
  pricing: PricingService;
  entries: EntriesService;
  results: ResultsService;
  votes: VotesService;
  otp: OtpService;
  jury: JuryService;
  notifications: NotificationsService;
  participants: ParticipantsService;
  payments: PaymentsService;
  governance: GovernanceService;
  auth: AuthService;
}

/** Award levels in podium order, for iterating result groups. */
export const MEDAL_ORDER: readonly AwardLevel[] = ["gold", "silver", "bronze", "did_not_place"];
