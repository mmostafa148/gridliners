import { getTranslations } from "next-intl/server";

/**
 * How the panel is run.
 *
 * The rules an entrant cannot see but is entitled to know: who is allowed to
 * score their entry, when a result is actually final, what the panel is bound
 * by, and the one circumstance in which their entry can move.
 *
 * All four are governance rather than presentation, and all four come from the
 * documents rather than from copywriting. Assignment at parent level with
 * sub-categories inherited, and the rule that a result stays pending until every
 * assigned juror has scored (with the awards team entering a missing score on a
 * juror's behalf), are consolidated-decisions §2. The NDA is the same section.
 * The re-categorization window is addendum §1.3: during Tier Verification only,
 * before jury scoring opens, with the participant notified, and nothing moving
 * afterwards.
 *
 * On navy, because this is a different kind of statement from the framework
 * above it: that section is what an entrant is measured by, this one is how the
 * measuring is governed.
 */
export async function SelectionProcess() {
  const t = await getTranslations("jury.process");

  const rules = ["assignment", "complete", "nda", "recat"] as const;

  return (
    <section className="relative overflow-hidden bg-navy-950 text-cream-100">
      <div className="page-shell section-y relative">
        <h2 className="text-h1 text-balance text-cream-50">{t("title")}</h2>

        <dl className="mt-12 grid gap-x-14 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {rules.map((rule) => (
            <div key={rule}>
              <dt className="text-h4 text-balance text-cream-50">
                {t(`${rule}Title`)}
              </dt>
              <dd className="mt-3 max-w-[38ch] text-body-sm text-cream-200/80">
                {t(`${rule}Body`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
