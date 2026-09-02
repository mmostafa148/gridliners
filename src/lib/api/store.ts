import { cycles } from "@/lib/fixtures/cycles";
import { entries } from "@/lib/fixtures/entries";
import { auditLog, disqualifications } from "@/lib/fixtures/governance";
import { juryCohorts, jurors, scores } from "@/lib/fixtures/jury";
import { notificationTemplates } from "@/lib/fixtures/notifications";
import {
  scenarioCredits,
  scenarioEntries,
  scenarioPayments,
  scenarioVoteEmails,
  scenarioVotes,
} from "@/lib/fixtures/participant-scenarios";
import { participants } from "@/lib/fixtures/participants";
import { payments } from "@/lib/fixtures/payments";
import { credits, pricingConfigs } from "@/lib/fixtures/pricing";
import { groupResults, honoraryDesignations } from "@/lib/fixtures/results";
import {
  criteria,
  honoraryOptions,
  parentCategories,
  subCategories,
} from "@/lib/fixtures/taxonomy";
import { otpChallenges, votes } from "@/lib/fixtures/votes";
import type {
  AuditLogEntry,
  Credit,
  Criterion,
  Cycle,
  DisqualificationRecord,
  Entry,
  GroupResult,
  HonoraryDesignation,
  HonoraryDesignationOption,
  JuryCohort,
  Juror,
  NotificationTemplate,
  OtpChallenge,
  Participant,
  ParentCategory,
  Payment,
  PricingConfig,
  Score,
  SessionUser,
  SubCategory,
  Vote,
} from "./types";

/**
 * In-memory mock store, seeded from the typed fixtures.
 *
 * Writes go through the service interfaces in `@/lib/api`, never directly from
 * screens, so swapping in the real backend is a single-file change. State is
 * per-process on the server and per-tab in the browser.
 *
 * Dev knobs (all optional):
 *   NEXT_PUBLIC_MOCK_PERSIST=1     persist writes to localStorage
 *   NEXT_PUBLIC_MOCK_LATENCY=400   simulate network latency, in ms
 *   NEXT_PUBLIC_MOCK_ERROR_RATE    0–1, fraction of reads that throw
 */

export interface MockState {
  cycles: Cycle[];
  parentCategories: ParentCategory[];
  subCategories: SubCategory[];
  criteria: Criterion[];
  honoraryOptions: HonoraryDesignationOption[];
  pricingConfigs: PricingConfig[];
  credits: Credit[];
  participants: Participant[];
  entries: Entry[];
  payments: Payment[];
  jurors: Juror[];
  juryCohorts: JuryCohort[];
  scores: Score[];
  votes: Vote[];
  otpChallenges: OtpChallenge[];
  groupResults: GroupResult[];
  honoraryDesignations: HonoraryDesignation[];
  notificationTemplates: NotificationTemplate[];
  disqualifications: DisqualificationRecord[];
  auditLog: AuditLogEntry[];
  session: SessionUser | null;
}

const PERSIST_KEY = "gridliners.mock.v1";

/**
 * The same normalized hash `mock.ts` votes with.
 *
 * Duplicated here rather than imported: `mock.ts` imports this file, and
 * reaching back the other way for one pure function would make the two
 * modules circular. Eight lines is cheaper than that, and the pair is checked
 * by `verify-participant.mjs` rather than trusted to stay in step.
 */
function seedEmailHash(email: string): string {
  const [local, domain = ""] = email.trim().toLowerCase().split("@");
  const normalized = `${local.split("+")[0]}@${domain}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
  }
  return `h:${(hash >>> 0).toString(16)}`;
}

function seed(): MockState {
  // The participant module's lifecycle data, hashed at seed time so the vote
  // rows match what `votes.forEmail` looks for. None of these entries is
  // `shortlisted`, so no public screen reads any of them.
  const scenarioVotesHashed = scenarioVotes.map((vote) => ({
    ...vote,
    emailHash: seedEmailHash(scenarioVoteEmails[vote.id] ?? ""),
  }));

  // Deep clone so mutations never write back into the fixture modules.
  return structuredClone({
    cycles,
    parentCategories,
    subCategories,
    criteria,
    honoraryOptions,
    pricingConfigs,
    credits: [...credits, ...scenarioCredits],
    participants,
    entries: [...entries, ...scenarioEntries],
    payments: [...payments, ...scenarioPayments],
    jurors,
    juryCohorts,
    scores,
    votes: [...votes, ...scenarioVotesHashed],
    otpChallenges,
    groupResults,
    honoraryDesignations,
    notificationTemplates,
    disqualifications,
    auditLog,
    /**
     * **Signed out.** This used to seed `sessionUsers.participant`, which meant
     * the app had no logged-out state to build 2.1 against and every visitor
     * shared one identity. Who is signed in is a per-request cookie now
     * (`lib/auth/session.ts`); this field is what `signInAs` writes for the
     * kitchen sink and is read by nothing else.
     */
    session: null as SessionUser | null,
  });
}

export const mockConfig = {
  persist: process.env.NEXT_PUBLIC_MOCK_PERSIST === "1",
  latencyMs: Number(process.env.NEXT_PUBLIC_MOCK_LATENCY ?? 0),
  errorRate: Number(process.env.NEXT_PUBLIC_MOCK_ERROR_RATE ?? 0),
};

/**
 * One store per process, pinned to `globalThis`.
 *
 * **A module-level `let` is not one store.** Next bundles Server Actions and
 * RSC rendering separately, so `store.ts` is instantiated more than once in the
 * same process and each copy gets its own `state`: the wizard's save wrote a
 * draft into the action's copy and My Entries read the page's copy, which had
 * never heard of it. The entry existed, was returned by the action, and then
 * 404'd on the very next request.
 *
 * `globalThis` is shared across those module instances, so there is exactly one
 * store however many times this file is evaluated. It is also what survives a
 * hot reload, which is the same reason a database client is pinned this way.
 *
 * The symbol keeps it out of the way of anything else on the global object.
 */
const STORE_KEY = Symbol.for("gridliners.mock.store.v2");

interface StoreHolder {
  [STORE_KEY]?: { state: MockState };
}

function holder(): { state: MockState } {
  const g = globalThis as StoreHolder;
  g[STORE_KEY] ??= { state: loadInitialState() };
  return g[STORE_KEY];
}

function loadInitialState(): MockState {
  if (mockConfig.persist && typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(PERSIST_KEY);
      if (raw) return JSON.parse(raw) as MockState;
    } catch {
      // Corrupt or unavailable storage falls back to a clean seed.
    }
  }
  return seed();
}

function persist() {
  if (!mockConfig.persist || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(holder().state));
  } catch {
    // Quota or private-mode failures are non-fatal for a mock layer.
  }
}

export function getState(): MockState {
  return holder().state;
}

/** Applies a mutation and persists it when persistence is enabled. */
export function mutate<T>(fn: (draft: MockState) => T): T {
  const outcome = fn(holder().state);
  persist();
  return outcome;
}

/** Simulated latency + optional error injection, driving loading/error UI. */
export async function withLatency<T>(value: T | (() => T)): Promise<T> {
  if (mockConfig.latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, mockConfig.latencyMs));
  }
  if (mockConfig.errorRate > 0 && deterministicChance() < mockConfig.errorRate) {
    throw new Error("Mock API error (NEXT_PUBLIC_MOCK_ERROR_RATE)");
  }
  return typeof value === "function" ? (value as () => T)() : value;
}

// Counter-based rather than Math.random, so a given error rate produces a
// predictable, reproducible failure pattern instead of flaky screenshots.
let callCounter = 0;
function deterministicChance() {
  callCounter += 1;
  return ((callCounter * 2654435761) % 1000) / 1000;
}

export const devTools = {
  /** Reseed from fixtures, discarding every in-session write. */
  reset() {
    holder().state = seed();
    if (mockConfig.persist && typeof window !== "undefined") {
      window.localStorage.removeItem(PERSIST_KEY);
    }
    return holder().state;
  },
  /** Read-only snapshot, for the kitchen sink's fixture-coverage panel. */
  snapshot() {
    return holder().state;
  },
  config: mockConfig,
};
