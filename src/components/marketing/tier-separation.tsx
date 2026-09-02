import { getTranslations } from "next-intl/server";

import type { Cycle } from "@/lib/api/types";
import { TIERS } from "@/lib/api/types";

/**
 * Judged through the same frame.
 *
 * The map used to call for "the three metal frames visual". Metals are award
 * levels, and the three things this section is about are participation tiers, so
 * drawing one with the other would say that a company is gold and a student is
 * bronze. That is the opposite of the section's own argument, and the map was
 * amended before this was built (see the `[map-update]` note in
 * gridliners-content-map.md §1.5).
 *
 * So there is no device here at all, and the absence is the argument. Three
 * columns, identical in every respect: same width, same type, same weight, same
 * ground, no ordering, no ornament, nothing that could be read as a ladder. The
 * only thing that differs between them is the number, and the copy beside it
 * says why that is not a ranking either: each tier is measured inside itself, so
 * each has its own bar.
 *
 * Written in the source order the tiers are declared in (`TIERS`), which is the
 * model's own order and not a judgement.
 */
export async function TierSeparation({ cycle }: { cycle: Cycle }) {
  const [t, tTier] = await Promise.all([
    getTranslations("jury.fairness"),
    getTranslations("tier"),
  ]);

  return (
    <section className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-end">
          <h2 className="text-h1 text-balance lg:col-span-5">{t("title")}</h2>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-[54ch] text-body-md text-navy-600">
              {t("body")}
            </p>
            <p className="mt-4 max-w-[54ch] text-body-sm text-navy-600">
              {t("note")}
            </p>
          </div>
        </div>

        {/* Three equal columns. Equality is the whole statement, so nothing may
            distinguish them: no metal, no order, no size difference, no accent
            on one of them. */}
        <ul className="mt-12 grid gap-6 sm:grid-cols-3 lg:mt-16">
          {TIERS.map((tier) => (
            <li key={tier} className="bg-white px-7 py-8 sm:px-8 sm:py-9">
              <h3 className="min-h-[2.6em] text-h3 text-balance">
                {tTier(tier)}
              </h3>
              <dl className="mt-6 border-t border-navy-900/12 pt-5">
                <dt className="font-display text-coord uppercase text-navy-600">
                  {t("thresholdLabel")}
                </dt>
                <dd className="mt-2 font-data text-h2 leading-none tabular-nums text-navy-900">
                  {cycle.shortlistThresholds[tier]}
                </dd>
              </dl>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-[60ch] text-body-sm text-navy-600">
          {t("reasoning")}
        </p>
      </div>
    </section>
  );
}
