import "server-only";

import { api } from "@/lib/api";
import type { Entry, GroupResult, SubCategory } from "@/lib/api/types";
import type { Locale as AppLocale } from "@/i18n/routing";
import { winningResults } from "@/lib/account/next-actions";

/**
 * What a participant is entitled to download, resolved from the record.
 *
 * **A deliverable belongs to a group result, not to an entry.** One project can
 * take Gold in one group and Bronze in another - `e-101` does exactly that -
 * and each of those is its own certificate, its own badge and its own package.
 * Attaching them to the entry would produce one certificate for two awards.
 *
 * **Everything here is scoped to the caller.** Resolving a deliverable answers
 * "does this participant hold this result", so a guessed result id in a URL
 * cannot produce somebody else's certificate.
 */

export interface Deliverable {
  resultId: string;
  entryId: string;
  entryTitle: string;
  entrySlug: string;
  participantName: string;
  group: string;
  tier: string;
  level: "gold" | "silver" | "bronze";
  cycleYear: number;
}

export async function deliverablesFor(
  participantId: string,
  locale: AppLocale,
): Promise<Deliverable[]> {
  const [entries, subCategories, cycles, participant] = await Promise.all([
    api.entries.list({ participantId }),
    api.taxonomy.subCategories(),
    api.cycles.list(),
    api.participants.getById(participantId),
  ]);

  const results = await winningResults(participantId, entries);
  const entryById = new Map(entries.map((e) => [e.id, e]));
  const subById = new Map(subCategories.map((s) => [s.id, s]));
  const yearById = new Map(cycles.map((c) => [c.id, c.year]));

  return results
    .map((result) => build(result, entryById, subById, yearById, participant?.name ?? "", locale))
    .filter((d): d is Deliverable => Boolean(d));
}

function build(
  result: GroupResult,
  entryById: Map<string, Entry>,
  subById: Map<string, SubCategory>,
  yearById: Map<string, number>,
  participantName: string,
  locale: AppLocale,
): Deliverable | null {
  const entry = entryById.get(result.entryId);
  if (!entry) return null;
  if (result.level === "did_not_place") return null;
  return {
    resultId: result.id,
    entryId: entry.id,
    entryTitle: entry.title,
    entrySlug: entry.slug,
    participantName,
    group: subById.get(result.subCategoryId)?.name[locale] ?? result.subCategoryId,
    tier: result.tier,
    level: result.level,
    cycleYear: yearById.get(entry.cycleId) ?? 0,
  };
}

/** One deliverable by result id, or null when it is not this participant's. */
export async function deliverableById(
  participantId: string,
  resultId: string,
  locale: AppLocale,
): Promise<Deliverable | null> {
  const all = await deliverablesFor(participantId, locale);
  return all.find((d) => d.resultId === resultId) ?? null;
}
