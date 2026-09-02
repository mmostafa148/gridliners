import type { EntryFilter } from "@/lib/api/services";
import type { Tier } from "@/lib/api/types";

/**
 * Typed query-key factory. Screens use these rather than string literals so
 * invalidation stays consistent as more phases land.
 */
export const queryKeys = {
  cycles: {
    all: ["cycles"] as const,
    active: ["cycles", "active"] as const,
    byId: (id: string) => ["cycles", id] as const,
    byYear: (year: number) => ["cycles", "year", year] as const,
  },
  taxonomy: {
    parents: ["taxonomy", "parents"] as const,
    subs: (parentId?: string) => ["taxonomy", "subs", parentId ?? "all"] as const,
    criteria: (parentId: string) => ["taxonomy", "criteria", parentId] as const,
    honorary: ["taxonomy", "honorary"] as const,
  },
  pricing: {
    config: (cycleId: string) => ["pricing", "config", cycleId] as const,
    credits: (participantId: string) => ["pricing", "credits", participantId] as const,
  },
  entries: {
    list: (filter: EntryFilter = {}) => ["entries", "list", filter] as const,
    byId: (id: string) => ["entries", id] as const,
    bySlug: (slug: string) => ["entries", "slug", slug] as const,
  },
  results: {
    published: (cycleId: string) => ["results", "published", cycleId] as const,
    all: (cycleId: string) => ["results", "all", cycleId] as const,
    forEntry: (entryId: string) => ["results", "entry", entryId] as const,
    group: (cycleId: string, subCategoryId: string, tier: Tier) =>
      ["results", "group", cycleId, subCategoryId, tier] as const,
    winnerSummary: (entryId: string) => ["results", "winner", entryId] as const,
    honorary: (cycleId: string) => ["results", "honorary", cycleId] as const,
  },
  votes: {
    count: (entryId: string) => ["votes", "count", entryId] as const,
    list: (cycleId: string) => ["votes", "list", cycleId] as const,
  },
  jury: {
    all: ["jury", "jurors"] as const,
    juror: (id: string) => ["jury", "juror", id] as const,
    cohorts: (cycleId: string) => ["jury", "cohorts", cycleId] as const,
    queue: (jurorId: string, cycleId: string) => ["jury", "queue", jurorId, cycleId] as const,
    scores: (entryId: string) => ["jury", "scores", entryId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    byId: (id: string) => ["notifications", id] as const,
  },
  participants: {
    all: ["participants"] as const,
    byId: (id: string) => ["participants", id] as const,
  },
  payments: {
    forEntry: (entryId: string) => ["payments", "entry", entryId] as const,
    forParticipant: (participantId: string) => ["payments", "participant", participantId] as const,
  },
  governance: {
    audit: ["governance", "audit"] as const,
    disqualifications: ["governance", "disqualifications"] as const,
  },
  auth: {
    session: ["auth", "session"] as const,
  },
} as const;
