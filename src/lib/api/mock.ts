import { posts, postCategories } from "@/lib/fixtures/posts";
import {
  announcements,
  ceremonies as ceremonyList,
  faqs as faqList,
  news as newsItems,
  partners as partnerList,
  team as teamList,
  testimonials as testimonialList,
} from "@/lib/fixtures/content";
import { mockAccounts } from "@/lib/fixtures/participants";
import { MOCK_OTP_CODE } from "@/lib/fixtures/votes";

import type {
  AuditLogEntry,
  AwardLevel,
  Cycle,
  Entry,
  GroupResult,
  NewsItem,
  Page,
  Participant,
  Payment,
  PricingSnapshot,
  Score,
  SessionUser,
  Tier,
  Vote,
  WinnerSummary,
} from "./types";
import type {
  AuthResult,
  CreateEntryInput,
  EntryFilter,
  EntryPageQuery,
  GridlinersApi,
  PaymentPageQuery,
  ProfilePatch,
  QuoteRequest,
  RegisterInput,
  ResetResult,
} from "./services";
import { getState, mutate, withLatency } from "./store";

/**
 * Mock implementations of every service interface. Business rules that the
 * real backend will own are still enforced here, so screens are built against
 * correct behaviour rather than against a permissive stub.
 */

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

/**
 * The mock credential store.
 *
 * Deliberately outside `MockState`: it is not domain data, it is the stand-in
 * for an identity provider, and keeping it separate means a real provider can
 * replace it without touching the store's shape. Seeded from the fixtures and
 * grown by `register`.
 *
 * **This is not authentication.** Passwords are compared as plain strings.
 * There is no hash, no salt, no lockout and no rotation. Authentication is
 * mocked behind a service interface so a real provider can replace it later;
 * this is the inside of that mock and none of it survives that swap.
 */
const accounts = structuredClone(mockAccounts);

/** Reset tokens, minted by `requestPasswordReset` and consumed once. */
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();
const RESET_TTL_MS = 30 * 60_000;

/**
 * The last token minted, for the dev-only "use this link" affordance.
 *
 * There is no mail service in this build, so a reset that only sent an email
 * would be a flow nobody can finish. `/forgot-password` prints the link in
 * development and prints nothing in production.
 */
export function __devLastResetToken(): string | null {
  let latest: string | null = null;
  let at = 0;
  for (const [token, record] of resetTokens) {
    if (record.expiresAt > at) { at = record.expiresAt; latest = token; }
  }
  return latest;
}

function userFor(account: (typeof accounts)[number]): SessionUser {
  return {
    id: account.userId,
    name: account.name,
    email: account.email,
    role: "participant",
    uiLanguage: account.uiLanguage,
    participantId: account.participantId,
  };
}

/** Normalizes plus-addressing before hashing, per the dedup rule (§3.2). */
function hashEmail(email: string): string {
  const [local, domain = ""] = email.trim().toLowerCase().split("@");
  const normalized = `${local.split("+")[0]}@${domain}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
  }
  return `h:${(hash >>> 0).toString(16)}`;
}

function now() {
  return new Date().toISOString();
}

/**
 * One page of an already-filtered, already-sorted list.
 *
 * **An out-of-range page clamps to the last real one rather than returning
 * nothing.** A reader who deep-links `?page=40` into a list that has six is
 * asking for the end of it, and an empty grid reads as a broken screen -
 * the same call 1.11's listing made and for the same reason.
 */
function paginate<T>(rows: T[], page = 1, pageSize = 12): Page<T> {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const start = (current - 1) * pageSize;
  return { items: rows.slice(start, start + pageSize), total, page: current, pageSize, pages };
}

/** Newest first, by whichever timestamp the row calls its own. */
function byNewest<T>(rows: T[], stamp: (row: T) => string | null | undefined): T[] {
  return [...rows].sort((a, b) => Date.parse(stamp(b) ?? "") - Date.parse(stamp(a) ?? ""));
}

// ---------------------------------------------------------------------------

const cycles: GridlinersApi["cycles"] = {
  list: () => withLatency(() => [...getState().cycles]),
  getActive: () =>
    withLatency(() => {
      const active = getState().cycles.find((cycle) => cycle.status === "active");
      if (!active) throw new Error("No active cycle in fixtures");
      return active;
    }),
  getById: (id) => withLatency(() => getState().cycles.find((c) => c.id === id) ?? null),
  getByYear: (year) => withLatency(() => getState().cycles.find((c) => c.year === year) ?? null),
  setPhase: (id, phase) =>
    withLatency(() =>
      mutate((draft) => {
        const cycle = draft.cycles.find((c) => c.id === id);
        if (!cycle) throw new Error(`Unknown cycle ${id}`);
        cycle.phase = phase;
        return cycle;
      }),
    ),
};

const taxonomy: GridlinersApi["taxonomy"] = {
  parentCategories: () =>
    withLatency(() => [...getState().parentCategories].sort((a, b) => a.order - b.order)),
  subCategories: (parentId) =>
    withLatency(() =>
      getState()
        .subCategories.filter((sub) => !parentId || sub.parentId === parentId)
        .sort((a, b) => a.order - b.order),
    ),
  subCategory: (id) => withLatency(() => getState().subCategories.find((s) => s.id === id) ?? null),
  criteria: (parentCategoryId) =>
    withLatency(() => getState().criteria.filter((c) => c.parentCategoryId === parentCategoryId)),
  honoraryOptions: () =>
    withLatency(() => [...getState().honoraryOptions].sort((a, b) => a.order - b.order)),
};

/** Resolves which pricing window an instant falls in. */
function windowFor(cycle: Cycle, at: string): PricingSnapshot["window"] {
  const t = new Date(at).getTime();
  const entriesOf = Object.entries(cycle.submissionWindows) as [
    PricingSnapshot["window"],
    { start: string; end: string },
  ][];
  for (const [key, range] of entriesOf) {
    if (t >= new Date(range.start).getTime() && t <= new Date(range.end).getTime()) {
      return key;
    }
  }
  // Outside the participation period the late-window price is quoted; Admin
  // controls whether submissions are open at all via the cycle phase.
  return "late";
}

const pricing: GridlinersApi["pricing"] = {
  config: (cycleId) =>
    withLatency(() => {
      const config = getState().pricingConfigs.find((c) => c.cycleId === cycleId);
      if (!config) throw new Error(`No pricing config for ${cycleId}`);
      return config;
    }),

  quote: (request: QuoteRequest) =>
    withLatency(() => {
      const state = getState();
      const cycle = state.cycles.find((c) => c.id === request.cycleId);
      const config = state.pricingConfigs.find((c) => c.cycleId === request.cycleId);
      if (!cycle || !config) throw new Error(`Unknown cycle ${request.cycleId}`);

      const at = request.at ?? now();
      const window = windowFor(cycle, at);
      const basePriceUsd = config.basePrices[request.tier][window];

      const base = state.subCategories.find((s) => s.id === request.baseSubCategoryId);
      if (!base) throw new Error(`Unknown sub-category ${request.baseSubCategoryId}`);

      // Additional sub-categories must share the base's parent (§1.2).
      const additionalSubCategories = request.additionalSubCategoryIds.map((id) => {
        const sub = state.subCategories.find((s) => s.id === id);
        if (!sub) throw new Error(`Unknown sub-category ${id}`);
        if (sub.parentId !== base.parentId) {
          throw new Error(
            `Sub-category ${id} belongs to ${sub.parentId}; additions must share the base parent ${base.parentId}`,
          );
        }
        return { subCategoryId: sub.id, label: sub.name, amountUsd: sub.additionalFeeUsd };
      });

      const subtotalUsd =
        basePriceUsd + additionalSubCategories.reduce((sum, line) => sum + line.amountUsd, 0);

      // Loyalty counts entries that reached Submitted in THIS cycle (§3.4).
      const submittedThisCycle = state.entries.filter(
        (e) =>
          e.cycleId === request.cycleId &&
          e.participantId === request.participantId &&
          e.submittedAt !== null,
      ).length;
      const submissionNumber = submittedThisCycle + 1;

      const rule = [...config.loyaltyRules]
        .sort((a, b) => b.fromSubmissionNumber - a.fromSubmissionNumber)
        .find((r) => submissionNumber >= r.fromSubmissionNumber);
      const loyalty = rule
        ? {
            ruleId: rule.id,
            percentOff: rule.percentOff,
            amountUsd: Math.round(subtotalUsd * rule.percentOff) / 100,
          }
        : null;

      let promo: PricingSnapshot["promo"] = null;
      if (request.promoCode) {
        const code = config.promoCodes.find(
          (p) => p.code.toLowerCase() === request.promoCode!.toLowerCase(),
        );
        const withinWindow =
          code &&
          new Date(at) >= new Date(code.validFrom) &&
          new Date(at) <= new Date(code.validUntil);
        const boundToSomeoneElse =
          code?.boundParticipantId && code.boundParticipantId !== request.participantId;
        const exhausted = code?.maxRedemptions != null && code.redemptions >= code.maxRedemptions;

        if (!code || !code.active || !withinWindow || boundToSomeoneElse || exhausted) {
          throw new Error(`Promo code ${request.promoCode} is not valid for this entry`);
        }

        const amountUsd =
          code.kind === "percentage"
            ? Math.round(subtotalUsd * code.value) / 100
            : Math.min(code.value, subtotalUsd);
        promo = { code: code.code, kind: code.kind, value: code.value, amountUsd };
      }

      /**
       * A next-cycle credit, applied last.
       *
       * **An invalid code prices as absent rather than throwing.** A promo code
       * is something the participant typed and got wrong, so it is an error; a
       * credit code is something the platform issued and the screen offered, so
       * a stale one means "that is worth nothing now" and the quote should
       * still return a total.
       *
       * Capped at what is left after the discounts: a credit larger than the
       * remaining fee is not a refund, and a negative total is not a price.
       */
      let credit: PricingSnapshot["credit"] = null;
      const afterDiscounts =
        Math.round((subtotalUsd - (loyalty?.amountUsd ?? 0) - (promo?.amountUsd ?? 0)) * 100) / 100;
      if (request.creditCode) {
        const row = state.credits.find(
          (c) =>
            c.code === request.creditCode &&
            c.ownerParticipantId === request.participantId &&
            c.validForCycleId === request.cycleId &&
            !c.redeemedAt,
        );
        if (row) {
          credit = { code: row.code, amountUsd: Math.min(row.amountUsd, afterDiscounts) };
        }
      }

      const totalUsd = Math.round((afterDiscounts - (credit?.amountUsd ?? 0)) * 100) / 100;

      return {
        window,
        tier: request.tier,
        basePriceUsd,
        baseSubCategoryId: request.baseSubCategoryId,
        additionalSubCategories,
        submissionNumber,
        loyalty,
        promo,
        credit,
        subtotalUsd,
        totalUsd,
        quotedAt: at,
      } satisfies PricingSnapshot;
    }),

  creditsForParticipant: (participantId) =>
    withLatency(() =>
      getState().credits.filter((c) => c.ownerParticipantId === participantId && !c.redeemedAt),
    ),

  allCreditsForParticipant: (participantId) =>
    withLatency(() =>
      byNewest(
        getState().credits.filter((c) => c.ownerParticipantId === participantId),
        (c) => c.issuedAt,
      ),
    ),
};

function matchesFilter(entry: Entry, filter: EntryFilter, subParent: Map<string, string>): boolean {
  if (filter.cycleId && entry.cycleId !== filter.cycleId) return false;
  if (filter.cycleIds?.length && !filter.cycleIds.includes(entry.cycleId)) return false;
  if (filter.participantId && entry.participantId !== filter.participantId) return false;
  if (filter.states && !filter.states.includes(entry.state)) return false;
  if (filter.tier) {
    const tier = entry.verification?.verifiedTier ?? entry.declaredTier;
    if (tier !== filter.tier) return false;
  }
  if (filter.subCategoryId) {
    const all = [entry.baseSubCategoryId, ...entry.additionalSubCategoryIds];
    if (!all.includes(filter.subCategoryId)) return false;
  }
  if (filter.parentCategoryId) {
    const all = [entry.baseSubCategoryId, ...entry.additionalSubCategoryIds];
    if (!all.some((id) => subParent.get(id) === filter.parentCategoryId)) return false;
  }
  if (filter.search) {
    const needle = filter.search.toLowerCase();
    if (
      !entry.title.toLowerCase().includes(needle) &&
      !entry.description.toLowerCase().includes(needle)
    ) {
      return false;
    }
  }
  return true;
}

const entries: GridlinersApi["entries"] = {
  list: (filter = {}) =>
    withLatency(() => {
      const state = getState();
      const subParent = new Map(state.subCategories.map((s) => [s.id, s.parentId]));
      return state.entries.filter((entry) => matchesFilter(entry, filter, subParent));
    }),

  getById: (id) => withLatency(() => getState().entries.find((e) => e.id === id) ?? null),
  getBySlug: (slug) => withLatency(() => getState().entries.find((e) => e.slug === slug) ?? null),

  page: (query: EntryPageQuery & { participantId: string }) =>
    withLatency(() => {
      const state = getState();
      const subParent = new Map(state.subCategories.map((sub) => [sub.id, sub.parentId]));
      const rows = state.entries.filter((entry) => matchesFilter(entry, query, subParent));
      // Newest first by the last thing that happened to the entry, not by
      // creation: a draft edited today belongs above one submitted last year.
      const sorted = byNewest(rows, (e) => e.submittedAt ?? e.checkoutCompletedAt ?? e.createdAt);
      return paginate(sorted, query.page, query.pageSize ?? 10);
    }),

  discardDraft: (id, participantId) =>
    withLatency(() =>
      mutate((draft) => {
        const index = draft.entries.findIndex((e) => e.id === id);
        const entry = draft.entries[index];
        // Both checks, and in this order: an unknown id and somebody else's
        // entry must be indistinguishable from outside.
        if (!entry || entry.participantId !== participantId) {
          throw new Error("NOT_FOUND");
        }
        if (entry.state !== "draft") throw new Error("NOT_A_DRAFT");
        draft.entries.splice(index, 1);
      }),
    ),

  settleUpgrade: (id, participantId) =>
    withLatency(() =>
      mutate((draft) => {
        const entry = draft.entries.find((e) => e.id === id);
        if (!entry || entry.participantId !== participantId) throw new Error("NOT_FOUND");
        const settlement = entry.verification?.settlement;
        if (!settlement || settlement.kind !== "payment_link" || settlement.status === "settled") {
          throw new Error("NOTHING_TO_SETTLE");
        }
        // The supplement is its own payment record, linked to the entry, so
        // Billing shows the entry fee and the correction as two facts rather
        // than one number that changed.
        const payment: Payment = {
          id: nextId("pay"),
          entryId: entry.id,
          participantId: entry.participantId,
          kind: "tier_supplement",
          method: "stripe",
          status: "paid",
          amountUsd: settlement.amountUsd,
          snapshot: null,
          createdAt: now(),
          confirmedAt: now(),
          invoiceNumber: `GL-${new Date(entry.createdAt).getFullYear()}-${nextId("inv")}`,
        };
        draft.payments.push(payment);
        entry.paymentIds.push(payment.id);
        settlement.status = "settled";
        settlement.paymentId = payment.id;
        // Settling is what lets verification complete; the tier itself was
        // already corrected by Admin and is not re-decided here.
        if (entry.verification && !entry.verification.verifiedAt) {
          entry.verification.verifiedAt = now();
        }
        if (entry.state === "submitted") entry.state = "verified";
        return entry;
      }),
    ),

  create: (input: CreateEntryInput) =>
    withLatency(() =>
      mutate((draft) => {
        const id = nextId("e");
        const entry: Entry = {
          id,
          slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || id,
          cycleId: input.cycleId,
          participantId: input.participantId,
          state: "draft",
          title: input.title,
          description: input.description,
          contentLanguage: input.contentLanguage,
          country: input.country,
          credits: [],
          media: { coverUrl: "", galleryUrls: [], documentUrls: [] },
          declaredTier: input.declaredTier,
          baseSubCategoryId: input.baseSubCategoryId,
          additionalSubCategoryIds: input.additionalSubCategoryIds ?? [],
          eligibilityProof: {
            tier: input.declaredTier,
            retentionUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
          },
          verification: null,
          categoryMove: null,
          createdAt: now(),
          checkoutCompletedAt: null,
          submittedAt: null,
          paymentIds: [],
          juryFinalScore: null,
        };
        draft.entries.push(entry);
        return entry;
      }),
    ),

  update: (id, patch) =>
    withLatency(() =>
      mutate((draft) => {
        const index = draft.entries.findIndex((e) => e.id === id);
        if (index < 0) throw new Error(`Unknown entry ${id}`);
        draft.entries[index] = { ...draft.entries[index], ...patch, id };
        return draft.entries[index];
      }),
    ),

  submit: (id, method, snapshot) =>
    withLatency(() =>
      mutate((draft) => {
        const entry = draft.entries.find((e) => e.id === id);
        if (!entry) throw new Error(`Unknown entry ${id}`);
        if (entry.state !== "draft") {
          throw new Error(`Entry ${id} is ${entry.state}; only Drafts can be submitted`);
        }

        const cycle = draft.cycles.find((c) => c.id === entry.cycleId);
        const checkoutAt = now();
        const paymentId = nextId("pay");

        // Tiebreak timestamp is checkout completion, not cash confirmation.
        entry.checkoutCompletedAt = checkoutAt;

        /**
         * A credit is redeemed here, not at quote time.
         *
         * A quote is a question and may be asked any number of times; checkout
         * is the commitment. Redeeming at quote would burn a single-use credit
         * on somebody opening the review step and changing their mind.
         */
        if (snapshot.credit) {
          const row = draft.credits.find(
            (c) => c.code === snapshot.credit!.code && c.ownerParticipantId === entry.participantId,
          );
          if (row && !row.redeemedAt) row.redeemedAt = checkoutAt;
        }

        const payment: Payment = {
          id: paymentId,
          entryId: entry.id,
          participantId: entry.participantId,
          kind: "entry_fee",
          method,
          status: method === "stripe" ? "paid" : "pending",
          amountUsd: snapshot.totalUsd,
          snapshot,
          createdAt: checkoutAt,
          confirmedAt: method === "stripe" ? checkoutAt : null,
          ...(method === "cash" && cycle
            ? {
                expiresAt: new Date(
                  Date.parse(checkoutAt) + cycle.cashExpiryDays * 86_400_000,
                ).toISOString(),
              }
            : {}),
          invoiceNumber: `GL-${new Date(checkoutAt).getFullYear()}-${paymentId}`,
        };
        draft.payments.push(payment);
        entry.paymentIds.push(paymentId);

        if (method === "stripe") {
          entry.state = "submitted";
          entry.submittedAt = checkoutAt;
        } else {
          entry.state = "pending_payment";
        }
        return entry;
      }),
    ),

  verify: (id, verifiedTier, actor) =>
    withLatency(() =>
      mutate((draft) => {
        const entry = draft.entries.find((e) => e.id === id);
        if (!entry) throw new Error(`Unknown entry ${id}`);

        const corrections = entry.verification?.corrections ?? [];
        if (verifiedTier !== entry.declaredTier) {
          corrections.push({ from: entry.declaredTier, to: verifiedTier, actor, at: now() });
        }

        // A tier mismatch keeps the entry Submitted until settlement clears.
        const needsSettlement = verifiedTier !== entry.declaredTier;
        entry.verification = {
          declaredTier: entry.declaredTier,
          verifiedTier,
          actor,
          verifiedAt: needsSettlement ? null : now(),
          corrections,
          settlement: entry.verification?.settlement ?? null,
        };
        if (!needsSettlement) entry.state = "verified";

        draft.auditLog.push({
          id: nextId("al"),
          action: needsSettlement ? "tier_correction" : "tier_verified",
          actor,
          at: now(),
          entityType: "entry",
          entityId: entry.id,
          reason: needsSettlement
            ? `Declared ${entry.declaredTier}, verified ${verifiedTier}; settlement required.`
            : `Verified as declared (${verifiedTier}).`,
        });

        return entry;
      }),
    ),
};

function medalFromRank(rank: number | null): AwardLevel {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "did_not_place";
}

const results: GridlinersApi["results"] = {
  published: (cycleId) =>
    withLatency(() =>
      getState().groupResults.filter((r) => r.cycleId === cycleId && r.finalized),
    ),
  all: (cycleId) => withLatency(() => getState().groupResults.filter((r) => r.cycleId === cycleId)),
  forEntry: (entryId) => withLatency(() => getState().groupResults.filter((r) => r.entryId === entryId)),
  forGroup: (cycleId, subCategoryId, tier) =>
    withLatency(() =>
      getState()
        .groupResults.filter(
          (r) => r.cycleId === cycleId && r.subCategoryId === subCategoryId && r.tier === tier,
        )
        .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)),
    ),

  /**
   * Derived only: an entry "is a winner" when it holds at least one winning
   * group result that was finalized and not withheld (§3.1 / §3.7).
   */
  winnerSummary: (entryId) =>
    withLatency(() => {
      const state = getState();
      const entry = state.entries.find((e) => e.id === entryId);
      const rows = state.groupResults.filter((r) => r.entryId === entryId);
      const medals = rows
        .filter((r) => r.finalized && !r.withheld && r.level !== "did_not_place")
        .map((r) => ({
          level: r.level as Exclude<AwardLevel, "did_not_place">,
          resultId: r.id,
        }));

      return {
        entryId,
        isWinner: medals.length > 0,
        medals,
        isFinalist: entry?.state === "shortlisted",
      } satisfies WinnerSummary;
    }),

  honorary: (cycleId) =>
    withLatency(() =>
      getState().honoraryDesignations.filter((h) => h.cycleId === cycleId && h.published),
    ),

  withhold: (resultId, reason, actor) =>
    withLatency(() =>
      mutate((draft) => {
        const row = draft.groupResults.find((r) => r.id === resultId);
        if (!row) throw new Error(`Unknown result ${resultId}`);
        row.withheld = true;
        row.withheldReason = reason;
        draft.auditLog.push({
          id: nextId("al"),
          action: "medal_withheld",
          actor,
          at: now(),
          entityType: "result",
          entityId: resultId,
          reason,
        });
        return row;
      }),
    ),

  /**
   * Ranks a group by votes, then jury final score, then earlier checkout time
   * (§3.1), stores the tiebreak trace, and marks the rows finalized.
   */
  finalizeGroup: (cycleId, subCategoryId, tier, actor) =>
    withLatency(() =>
      mutate((draft) => {
        const rows = draft.groupResults.filter(
          (r) => r.cycleId === cycleId && r.subCategoryId === subCategoryId && r.tier === tier,
        );
        const entryById = new Map(draft.entries.map((e) => [e.id, e]));

        rows.sort((a, b) => {
          if (b.votes !== a.votes) return b.votes - a.votes;
          const ea = entryById.get(a.entryId);
          const eb = entryById.get(b.entryId);
          const scoreDelta = (eb?.juryFinalScore ?? 0) - (ea?.juryFinalScore ?? 0);
          if (scoreDelta !== 0) return scoreDelta;
          return (
            Date.parse(ea?.checkoutCompletedAt ?? "9999-12-31") -
            Date.parse(eb?.checkoutCompletedAt ?? "9999-12-31")
          );
        });

        rows.forEach((row, index) => {
          const rank = index + 1;
          row.rank = rank;
          row.level = row.withheld ? "did_not_place" : medalFromRank(rank);
          row.finalized = true;
          row.finalizedAt = now();
          row.tiebreakTrace = [
            `Votes: ${row.votes}`,
            `Jury final score: ${entryById.get(row.entryId)?.juryFinalScore ?? "n/a"}`,
            `Checkout: ${entryById.get(row.entryId)?.checkoutCompletedAt ?? "n/a"}`,
          ];
        });

        draft.auditLog.push({
          id: nextId("al"),
          action: "result_finalized",
          actor,
          at: now(),
          entityType: "result",
          entityId: `${subCategoryId}:${tier}`,
          reason: `Group finalized with ${rows.length} result(s).`,
        });

        return rows;
      }),
    ),
};

const votes: GridlinersApi["votes"] = {
  countForEntry: (entryId) =>
    withLatency(() => {
      const state = getState();
      // The aggregate on the group result is authoritative; individual records
      // are a representative sample for the admin monitor.
      const fromResults = state.groupResults
        .filter((r) => r.entryId === entryId)
        .reduce((max, r) => Math.max(max, r.votes), 0);
      if (fromResults > 0) return fromResults;
      return state.votes.filter((v) => v.entryId === entryId && !v.voided && v.otpVerifiedAt).length;
    }),

  list: (cycleId) => withLatency(() => getState().votes.filter((v) => v.cycleId === cycleId)),

  record: (entryId, email) =>
    withLatency(() =>
      mutate((draft) => {
        const emailHash = hashEmail(email);
        const entry = draft.entries.find((e) => e.id === entryId);
        if (!entry) throw new Error(`Unknown entry ${entryId}`);

        // Self-voting block covers the participant's own account email (§3.2).
        const owner = draft.participants.find((p) => p.id === entry.participantId);
        if (owner && hashEmail(owner.email) === emailHash) {
          throw new Error("SELF_VOTE_BLOCKED");
        }
        if (draft.votes.some((v) => v.entryId === entryId && v.emailHash === emailHash)) {
          throw new Error("ALREADY_VOTED");
        }

        const vote: Vote = {
          id: nextId("v"),
          entryId,
          cycleId: entry.cycleId,
          emailHash,
          otpVerifiedAt: now(),
          requestedAt: now(),
          ipHash: "ip:mock",
          voided: false,
        };
        draft.votes.push(vote);

        for (const row of draft.groupResults.filter((r) => r.entryId === entryId)) {
          row.votes += 1;
        }
        return vote;
      }),
    ),

  void: (voteIds, reason, actor) =>
    withLatency(() =>
      mutate((draft) => {
        const voided: Vote[] = [];
        for (const vote of draft.votes) {
          if (!voteIds.includes(vote.id)) continue;
          vote.voided = true;
          vote.voidedReason = reason;
          voided.push(vote);
        }
        draft.auditLog.push({
          id: nextId("al"),
          action: "votes_voided",
          actor,
          at: now(),
          entityType: "vote",
          entityId: voteIds.join(","),
          reason,
        });
        // Deliberately no notification: vote invalidation is silent (§3.2).
        return voided;
      }),
    ),

  forEmail: (email, page = {}) =>
    withLatency(() => {
      // The same normalized hash the dedup rule uses, so a vote cast from a
      // plus-addressed alias is found by the address the account signs in with.
      const hash = hashEmail(email);
      // A voided vote is not shown. Voiding is silent by design (§3.2), and a
      // list that quietly dropped one would be the notification.
      const mine = getState().votes.filter(
        (v) => v.emailHash === hash && !v.voided && v.otpVerifiedAt,
      );
      return paginate(byNewest(mine, (v) => v.otpVerifiedAt), page.page, page.pageSize ?? 12);
    }),

  hasVoted: (entryId, email) =>
    withLatency(() => {
      const emailHash = hashEmail(email);
      return getState().votes.some((v) => v.entryId === entryId && v.emailHash === emailHash);
    }),
};

const otp: GridlinersApi["otp"] = {
  request: (entryId, email) =>
    withLatency(() =>
      mutate((draft) => {
        const challengeId = nextId("otp");
        // Expiry ~10 minutes, per the Notification Specification.
        const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
        draft.otpChallenges.push({
          id: challengeId,
          entryId,
          email,
          expiresAt,
          verifiedAt: null,
          attempts: 0,
        });
        return { challengeId, expiresAt };
      }),
    ),

  verify: (challengeId, code) =>
    withLatency(() =>
      mutate((draft) => {
        const challenge = draft.otpChallenges.find((c) => c.id === challengeId);
        if (!challenge) return { ok: false, reason: "invalid" as const };
        challenge.attempts += 1;
        if (Date.now() > Date.parse(challenge.expiresAt)) {
          return { ok: false, reason: "expired" as const };
        }
        if (code !== MOCK_OTP_CODE) {
          return { ok: false, reason: "invalid" as const };
        }
        challenge.verifiedAt = now();
        return { ok: true };
      }),
    ),
};

const jury: GridlinersApi["jury"] = {
  jurors: () => withLatency(() => getState().jurors.filter((j) => j.active)),
  juror: (id) => withLatency(() => getState().jurors.find((j) => j.id === id) ?? null),
  cohorts: (cycleId) => withLatency(() => getState().juryCohorts.filter((c) => c.cycleId === cycleId)),

  /** Verification is rolling: jurors see entries as Admin verifies them. */
  queue: (jurorId, cycleId) =>
    withLatency(() => {
      const state = getState();
      const juror = state.jurors.find((j) => j.id === jurorId);
      if (!juror) return [];
      const subParent = new Map(state.subCategories.map((s) => [s.id, s.parentId]));

      return state.entries.filter((entry) => {
        if (entry.cycleId !== cycleId) return false;
        if (!["verified", "shortlisted", "not_shortlisted"].includes(entry.state)) return false;
        const parent = subParent.get(entry.baseSubCategoryId);
        return parent ? juror.assignedParentCategoryIds.includes(parent) : false;
      });
    }),

  scores: (entryId) => withLatency(() => getState().scores.filter((s) => s.entryId === entryId)),
  scoreFor: (jurorId, entryId) =>
    withLatency(
      () => getState().scores.find((s) => s.jurorId === jurorId && s.entryId === entryId) ?? null,
    ),

  saveScore: (input) =>
    withLatency(() =>
      mutate((draft) => {
        const criterionById = new Map(draft.criteria.map((c) => [c.id, c]));
        const weightedTotal =
          Math.round(
            input.criterionScores.reduce((sum, cs) => {
              const weight = criterionById.get(cs.criterionId)?.weight ?? 0;
              return sum + (cs.score * weight) / 100;
            }, 0) * 10,
          ) / 10;

        const existing = draft.scores.find(
          (s) => s.jurorId === input.jurorId && s.entryId === input.entryId,
        );
        if (existing) {
          Object.assign(existing, input, { weightedTotal });
          return existing;
        }

        const score: Score = { ...input, id: nextId("s"), weightedTotal };
        draft.scores.push(score);
        return score;
      }),
    ),
};

const notifications: GridlinersApi["notifications"] = {
  templates: () => withLatency(() => [...getState().notificationTemplates]),
  template: (id) =>
    withLatency(() => getState().notificationTemplates.find((t) => t.id === id) ?? null),
  update: (id, patch) =>
    withLatency(() =>
      mutate((draft) => {
        const index = draft.notificationTemplates.findIndex((t) => t.id === id);
        if (index < 0) throw new Error(`Unknown template ${id}`);
        draft.notificationTemplates[index] = {
          ...draft.notificationTemplates[index],
          ...patch,
          id,
        };
        return draft.notificationTemplates[index];
      }),
    ),
};

const participants: GridlinersApi["participants"] = {
  list: () => withLatency(() => [...getState().participants]),
  getById: (id) => withLatency(() => getState().participants.find((p) => p.id === id) ?? null),

  update: (id, patch: ProfilePatch) =>
    withLatency(() =>
      mutate((draft) => {
        const person = draft.participants.find((p) => p.id === id);
        if (!person) throw new Error("NOT_FOUND");

        // An email change is an identity change, so it moves the sign-in
        // account with it. Rejected if somebody else already holds the
        // address - which is the same check registration makes.
        if (patch.email && patch.email.toLowerCase() !== person.email.toLowerCase()) {
          const taken = draft.participants.some(
            (p) => p.id !== id && p.email.toLowerCase() === patch.email!.toLowerCase(),
          );
          if (taken) throw new Error("EMAIL_TAKEN");
          const account = accounts.find((a) => a.participantId === id);
          if (account) account.email = patch.email.toLowerCase();
        }

        // Assigned one field at a time rather than spread: the patch type is
        // narrow on purpose, and a spread would carry anything a caller added.
        if (patch.name !== undefined) person.name = patch.name;
        if (patch.email !== undefined) person.email = patch.email.toLowerCase();
        if (patch.jobTitle !== undefined) person.jobTitle = patch.jobTitle || undefined;
        if (patch.nationality !== undefined) person.nationality = patch.nationality || undefined;
        if (patch.country !== undefined) person.country = patch.country;
        if (patch.companyName !== undefined) person.companyName = patch.companyName || undefined;
        // `null` clears the photo; `undefined` leaves it alone. Removing an
        // image and not touching it are different requests.
        if (patch.photoUrl !== undefined) person.photoUrl = patch.photoUrl ?? undefined;
        if (patch.uiLanguage !== undefined) {
          person.uiLanguage = patch.uiLanguage;
          const account = accounts.find((a) => a.participantId === id);
          if (account) account.uiLanguage = patch.uiLanguage;
        }
        return person;
      }),
    ),
};

const payments: GridlinersApi["payments"] = {
  forEntry: (entryId) => withLatency(() => getState().payments.filter((p) => p.entryId === entryId)),
  forParticipant: (participantId) =>
    withLatency(() => getState().payments.filter((p) => p.participantId === participantId)),

  page: (query: PaymentPageQuery) =>
    withLatency(() => {
      const state = getState();
      const titleOf = new Map(state.entries.map((e) => [e.id, e.title.toLowerCase()]));
      const needle = query.search?.trim().toLowerCase();
      const rows = state.payments.filter((p) => {
        if (p.participantId !== query.participantId) return false;
        if (query.status && p.status !== query.status) return false;
        if (query.kind && p.kind !== query.kind) return false;
        if (query.statuses?.length && !query.statuses.includes(p.status)) return false;
        if (query.kinds?.length && !query.kinds.includes(p.kind)) return false;
        if (!needle) return true;
        // The three things somebody actually searches a receipt by.
        return (
          p.id.toLowerCase().includes(needle) ||
          p.invoiceNumber.toLowerCase().includes(needle) ||
          (titleOf.get(p.entryId) ?? "").includes(needle)
        );
      });
      return paginate(byNewest(rows, (p) => p.createdAt), query.page, query.pageSize ?? 10);
    }),

  expireCash: (paymentId, participantId) =>
    withLatency(() =>
      mutate((draft) => {
        const payment = draft.payments.find((p) => p.id === paymentId);
        if (!payment || payment.participantId !== participantId) throw new Error("NOT_FOUND");
        if (payment.method !== "cash" || payment.status !== "pending") {
          throw new Error("NOT_PENDING_CASH");
        }
        payment.status = "expired";
        // The entry follows the money: an unpaid reference that lapses leaves
        // the entry cancelled, which is the state the cycle's auto-cancel
        // produces and is what My Entries then has to say.
        const entry = draft.entries.find((e) => e.id === payment.entryId);
        if (entry && entry.state === "pending_payment") entry.state = "cancelled";
        return payment;
      }),
    ),

  charge: (entryId, snapshot) =>
    withLatency(() =>
      mutate((draft) => {
        const entry = draft.entries.find((e) => e.id === entryId);
        if (!entry) throw new Error(`Unknown entry ${entryId}`);
        const payment: Payment = {
          id: nextId("pay"),
          entryId,
          participantId: entry.participantId,
          kind: "entry_fee",
          method: "stripe",
          status: "paid",
          amountUsd: snapshot.totalUsd,
          snapshot,
          createdAt: now(),
          confirmedAt: now(),
          invoiceNumber: `GL-${new Date().getFullYear()}-${nextId("inv")}`,
        };
        draft.payments.push(payment);
        entry.paymentIds.push(payment.id);
        return payment;
      }),
    ),

  createCashPending: (entryId, snapshot) =>
    withLatency(() =>
      mutate((draft) => {
        const entry = draft.entries.find((e) => e.id === entryId);
        if (!entry) throw new Error(`Unknown entry ${entryId}`);
        const cycle = draft.cycles.find((c) => c.id === entry.cycleId);
        const payment: Payment = {
          id: nextId("pay"),
          entryId,
          participantId: entry.participantId,
          kind: "entry_fee",
          method: "cash",
          status: "pending",
          amountUsd: snapshot.totalUsd,
          snapshot,
          createdAt: now(),
          confirmedAt: null,
          expiresAt: new Date(
            Date.now() + (cycle?.cashExpiryDays ?? 7) * 86_400_000,
          ).toISOString(),
          invoiceNumber: `GL-${new Date().getFullYear()}-${nextId("inv")}`,
        };
        draft.payments.push(payment);
        entry.paymentIds.push(payment.id);
        return payment;
      }),
    ),

  confirmCash: (paymentId, actor) =>
    withLatency(() =>
      mutate((draft) => {
        const payment = draft.payments.find((p) => p.id === paymentId);
        if (!payment) throw new Error(`Unknown payment ${paymentId}`);
        payment.status = "paid";
        payment.confirmedAt = now();

        const entry = draft.entries.find((e) => e.id === payment.entryId);
        if (entry && entry.state === "pending_payment") {
          entry.state = "submitted";
          // submittedAt reflects confirmation; the tiebreak still reads
          // checkoutCompletedAt, which removes the cash disadvantage (§3.1).
          entry.submittedAt = now();
        }

        draft.auditLog.push({
          id: nextId("al"),
          action: "cash_confirmed",
          actor,
          at: now(),
          entityType: "payment",
          entityId: paymentId,
          reason: `Cash receipt confirmed for ${payment.entryId}.`,
        });
        return payment;
      }),
    ),
};

const governance: GridlinersApi["governance"] = {
  auditLog: () =>
    withLatency(() =>
      [...getState().auditLog].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
    ),
  disqualifications: () => withLatency(() => [...getState().disqualifications]),
  record: (entry) =>
    withLatency(() =>
      mutate((draft) => {
        const row: AuditLogEntry = { ...entry, id: nextId("al") };
        draft.auditLog.push(row);
        return row;
      }),
    ),
};

const auth: GridlinersApi["auth"] = {
  session: () => withLatency(() => getState().session),
  signInAs: (role) =>
    withLatency(() =>
      mutate((draft) => {
        const user = {
          participant: {
            id: "u-participant",
            name: "Layla Haddad",
            email: "layla@mizan.studio",
            role: "participant" as const,
            uiLanguage: "en" as const,
            participantId: "p-001",
          },
          jury: {
            id: "u-jury",
            name: "Dana Khoury",
            email: "dana.khoury@gridliners.com",
            role: "jury" as const,
            uiLanguage: "en" as const,
            jurorId: "j-001",
          },
          admin: {
            id: "u-admin",
            name: "Gridliners Admin",
            email: "admin@gridliners.com",
            role: "admin" as const,
            uiLanguage: "en" as const,
          },
        }[role];
        draft.session = user;
        return user;
      }),
    ),
  signOut: () =>
    withLatency(() =>
      mutate((draft) => {
        draft.session = null;
      }),
    ),
  /**
   * Credentials, checked case-insensitively on the address.
   *
   * **One failure reason for both halves.** "No such account" and "wrong
   * password" are the same answer here, because two answers turn the form into
   * a way of asking whether an address is registered.
   */
  signIn: (email, password) =>
    withLatency<AuthResult>(() => {
      const account = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!account || account.password !== password) {
        return { ok: false, reason: "invalid_credentials" };
      }
      return { ok: true, user: userFor(account) };
    }),

  register: (input: RegisterInput) =>
    withLatency<AuthResult>(() =>
      mutate((draft) => {
        if (!input.acceptedTerms) return { ok: false, reason: "terms_required" };
        const email = input.email.trim().toLowerCase();
        const taken =
          accounts.some((a) => a.email.toLowerCase() === email) ||
          draft.participants.some((p) => p.email.toLowerCase() === email);
        if (taken) return { ok: false, reason: "email_taken" };

        // A participant record and an account, together. The account is the
        // credential; the participant is the domain object every other service
        // reads, and a registration that made only one of them would leave the
        // dashboard with nothing to load.
        const participantId = nextId("p");
        const person: Participant = {
          id: participantId,
          name: input.name.trim(),
          email,
          // Not asked for at signup. The Sitemap puts country of residence on
          // My Profile, and registration stays as short as the brief says.
          country: "",
          uiLanguage: input.uiLanguage,
          createdAt: now(),
          lifetimeSubmissions: 0,
        };
        draft.participants.push(person);
        const account = {
          userId: `u-${participantId}`,
          participantId,
          email,
          password: input.password,
          name: person.name,
          uiLanguage: input.uiLanguage,
        };
        accounts.push(account);
        return { ok: true, user: userFor(account) };
      }),
    ),

  requestPasswordReset: (email) =>
    withLatency(() => {
      const account = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
      );
      // Resolves either way, and mints nothing for an address that is not
      // registered. The screen says the same sentence in both cases.
      if (account) {
        resetTokens.set(`rst_${account.userId}_${++idCounter}`, {
          userId: account.userId,
          expiresAt: Date.now() + RESET_TTL_MS,
        });
      }
    }),

  resetPassword: (token, password) =>
    withLatency<ResetResult>(() => {
      const record = resetTokens.get(token);
      if (!record) return { ok: false, reason: "invalid_token" };
      if (record.expiresAt < Date.now()) {
        resetTokens.delete(token);
        return { ok: false, reason: "expired_token" };
      }
      const account = accounts.find((a) => a.userId === record.userId);
      if (!account) return { ok: false, reason: "invalid_token" };
      account.password = password;
      // Single use. A reset link that still works after it has been used is a
      // link that works for whoever finds it next.
      resetTokens.delete(token);
      return { ok: true };
    }),

  changePassword: (userId, current, next) =>
    withLatency<AuthResult>(() => {
      const account = accounts.find((a) => a.userId === userId);
      if (!account || account.password !== current) {
        return { ok: false, reason: "invalid_credentials" };
      }
      account.password = next;
      return { ok: true, user: userFor(account) };
    }),

  userById: (id) =>
    withLatency<SessionUser | null>(() => {
      const account = accounts.find((a) => a.userId === id);
      if (!account) return null;
      // Read through the participant, so a profile edit is reflected in the
      // session's own name and language without a re-login.
      const person = getState().participants.find((p) => p.id === account.participantId);
      return person
        ? { ...userFor(account), name: person.name, email: person.email, uiLanguage: person.uiLanguage }
        : userFor(account);
    }),
};

/**
 * Editorial content.
 *
 * Reads the fixtures directly rather than the store: none of this is mutable
 * application state, and it should not be reachable through __dev.reset().
 */
/**
 * The public inboxes.
 *
 * Nothing is emailed and nothing leaves the browser: this is the seam the real
 * backend plugs into. A reference is minted so the confirmation has something
 * concrete in it, and the shape a rejection takes is the shape the real service
 * will take - `{ ok: false, reason }` rather than a thrown error, because a
 * full inbox is not an exception.
 */
let inboxCounter = 0;
function reference(prefix: string): string {
  inboxCounter += 1;
  return `${prefix}-${String(inboxCounter).padStart(4, "0")}`;
}

const inbox: GridlinersApi["inbox"] = {
  contact: (payload) =>
    withLatency(() =>
      payload.email.includes("@")
        ? ({ ok: true, reference: reference("MSG") } as const)
        : ({ ok: false, reason: "invalid-email" } as const),
    ),
  partner: (payload) =>
    withLatency(() =>
      payload.email.includes("@")
        ? ({ ok: true, reference: reference("PTR") } as const)
        : ({ ok: false, reason: "invalid-email" } as const),
    ),
};

const content: GridlinersApi["content"] = {
  announcement: (at = new Date()) =>
    withLatency(() => {
      const t = at.getTime();
      return (
        announcements.find(
          (a) =>
            Date.parse(a.startsAt) <= t && (a.endsAt === null || Date.parse(a.endsAt) > t),
        ) ?? null
      );
    }),
  posts: (filter = {}) =>
    withLatency(() => {
      const pageSize = Math.min(Math.max(filter.pageSize ?? 9, 1), 48);
      const matched = posts
        .filter((p) => (filter.kind ? p.kind === filter.kind : true))
        .filter((p) => (filter.categoryId ? p.categoryId === filter.categoryId : true));
      const pages = Math.max(1, Math.ceil(matched.length / pageSize));
      // A page beyond the end is clamped rather than served empty: a stale
      // bookmark or a filter change that shortens the list should land the
      // reader on the last real page, not on a blank one.
      const page = Math.min(Math.max(filter.page ?? 1, 1), pages);
      const start = (page - 1) * pageSize;
      return {
        items: matched.slice(start, start + pageSize),
        total: matched.length,
        page,
        pageSize,
        pages,
      };
    }),
  postBySlug: (slug) => withLatency(() => posts.find((p) => p.slug === slug) ?? null),
  relatedPosts: (slug, limit = 3) =>
    withLatency(() => {
      const post = posts.find((p) => p.slug === slug);
      if (!post) return [];
      const sameCategory = posts.filter(
        (p) => p.slug !== slug && p.categoryId === post.categoryId,
      );
      // Category first, then the rest of the archive, so a thinly populated
      // category still fills the row rather than showing one card and a gap.
      const rest = posts.filter(
        (p) => p.slug !== slug && p.categoryId !== post.categoryId,
      );
      const candidates = [...sameCategory, ...rest];
      const selected: NewsItem[] = [];
      const usedImages = new Set<string>();

      // Repeating the same cover twice in one three-card row makes separate
      // stories read like duplicates. Prefer a visually distinct set while
      // keeping category relevance as the primary order; only reuse a cover
      // when the archive does not contain enough unique images to fill the row.
      for (const candidate of candidates) {
        const image = candidate.imageUrl?.trim();
        if (image && usedImages.has(image)) continue;
        selected.push(candidate);
        if (image) usedImages.add(image);
        if (selected.length === limit) return selected;
      }

      for (const candidate of candidates) {
        if (selected.includes(candidate)) continue;
        selected.push(candidate);
        if (selected.length === limit) break;
      }

      return selected;
    }),
  postCategories: () => withLatency(() => postCategories),
  news: (filter = {}) =>
    withLatency(() => {
      const list = [...newsItems]
        .filter((n) => (filter.kind ? n.kind === filter.kind : true))
        // Events sort by when they happen, articles by when they ran. Sorting
        // an upcoming event by its publish date buries it behind older copy.
        .sort((a, b) => Date.parse(b.startsAt ?? b.publishedAt) - Date.parse(a.startsAt ?? a.publishedAt));
      return filter.limit ? list.slice(0, filter.limit) : list;
    }),
  partners: (filter = {}) =>
    withLatency(() =>
      partnerList.filter((p) => (filter.categoryId ? p.categoryId === filter.categoryId : true)),
    ),
  testimonials: () => withLatency(() => [...testimonialList]),
  // Sorted here rather than trusted from the fixture: `order` is the field the
  // admin reorders on, so the sort belongs with the read, not with the data.
  faqs: () =>
    withLatency(() => [...faqList].sort((a, b) => a.order - b.order)),
  team: () =>
    withLatency(() => [...teamList].sort((a, b) => a.order - b.order)),
  // Newest first: an About page reads the current edition before the archive.
  ceremonies: () =>
    withLatency(() => [...ceremonyList].sort((a, b) => b.year - a.year)),
};


/**
 * Not in the store: nothing reads this back, and a reset that dropped a mailing
 * list would be modelling something the real service does not do either.
 */
const newsletterSubscribers = new Set<string>();

const newsletter: GridlinersApi["newsletter"] = {
  subscribe: (email, locale) =>
    withLatency(() => {
      const address = email.trim().toLowerCase();
      // The shape only. The real check belongs to whatever sends the mail, and
      // a stricter pattern here would reject addresses that deliver fine.
      if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(address)) {
        return { ok: false, reason: "invalid" } as const;
      }
      const already = newsletterSubscribers.has(address);
      newsletterSubscribers.add(address);
      void locale;
      return { ok: true, already } as const;
    }),
};

export const mockApi: GridlinersApi = {
  newsletter,
  cycles,
  taxonomy,
  pricing,
  entries,
  results,
  votes,
  otp,
  jury,
  notifications,
  participants,
  content,
  inbox,
  payments,
  governance,
  auth,
};

export type { Cycle, Entry, GroupResult, Tier };
