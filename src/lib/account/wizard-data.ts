import "server-only";

import { api } from "@/lib/api";
import type { Locale } from "@/i18n/routing";
import { countryName } from "@/lib/display-names";
import { COUNTRY_CODES } from "@/lib/countries-list";

/** Everything both wizard routes load, in one place so they cannot diverge. */
export async function wizardData(participantId: string, locale: Locale) {
  const [cycles, parents, subCategories, credits] = await Promise.all([
    api.cycles.list(),
    api.taxonomy.parentCategories(),
    api.taxonomy.subCategories(),
    api.pricing.creditsForParticipant(participantId),
  ]);
  const cycle = cycles.find((c) => c.status === "active") ?? cycles[0];
  const pricing = await api.pricing.config(cycle.id);

  const countries = COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).sort(
    (a, b) => a.name.localeCompare(b.name, locale),
  );

  return {
    cycle,
    parents,
    subCategories,
    pricing,
    credits: credits.filter((c) => c.validForCycleId === cycle.id),
    countries,
    parentOf: new Map(subCategories.map((s) => [s.id, s.parentId])),
  };
}
