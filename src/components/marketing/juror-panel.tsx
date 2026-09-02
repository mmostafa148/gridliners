import { getLocale, getTranslations } from "next-intl/server";

import { JurorCard } from "@/components/marketing/juror-card";
import { EmptyState } from "@/components/shared/status-patterns";
import type { Locale } from "@/i18n/routing";
import type { Juror, ParentCategory } from "@/lib/api/types";

/**
 * The panel itself.
 *
 * Three across at `lg`, which gives a portrait, a paragraph and a scope line
 * room to be read rather than skimmed. Six at four-up would have made a
 * contact sheet, and a contact sheet is the gallery of headshots this page is
 * supposed not to be.
 *
 * Only active jurors are published. `Juror.active` exists because a panel
 * changes between cycles, and a retired juror is a record to keep rather than a
 * face to show.
 *
 * Every string on a card comes from the record: name, title, company, bio,
 * languages, country, assigned parents and handles. The only things this
 * component supplies are the labels, and they are passed down rather than read
 * inside the card so the card stays a pure view over one juror.
 */
export async function JurorPanel({
  jurors,
  parents,
}: {
  jurors: Juror[];
  /** Only so a juror's scope can be named rather than coded. */
  parents: ParentCategory[];
}) {
  // `getLocale` is resolved on its own. `check-messages` maps namespaces to
  // destructured names positionally, so a non-`getTranslations` member in the
  // same `Promise.all` shifts every binding after it by one and the keys then
  // resolve against the wrong namespace.
  const locale = (await getLocale()) as Locale;
  const [t, tEmpty] = await Promise.all([
    getTranslations("jury.panel"),
    getTranslations("jury.empty"),
  ]);

  const active = jurors.filter((juror) => juror.active);

  // The codes are compact enough for a plate on a portrait and mean nothing on
  // their own. Since the panel now leads the page, the block that names them
  // sits below it, so the card carries the names itself.
  const parentName = new Map(parents.map((p) => [p.id, p.name[locale]]));

  return (
    <section className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        <div className="grid gap-x-16 gap-y-5 lg:grid-cols-12 lg:items-end">
          <h2 className="text-h1 text-balance lg:col-span-5">{t("title")}</h2>
          <p className="max-w-[54ch] text-body-md text-navy-600 lg:col-span-6 lg:col-start-7">
            {t("description")}
          </p>
        </div>

        {active.length === 0 ? (
          /* The shared empty state, given this page's own words. Its defaults
             are written for a filtered project list and would tell a reader
             that no projects match filters they never set. */
          <EmptyState
            className="mt-12"
            title={tEmpty("title")}
            description={tEmpty("description")}
          />
        ) : (
          <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {active.map((juror) => (
              <li key={juror.id} className="flex">
                <JurorCard
                  juror={juror}
                  locale={locale}
                  className="w-full"
                  scopeNames={juror.assignedParentCategoryIds
                    .map((id) => parentName.get(id))
                    .filter((name): name is string => Boolean(name))}
                  labels={{
                    scope: t("scopeLabel"),
                    languages: t("languagesLabel"),
                    social: (name, platform) =>
                      t("socialLabel", { name, platform }),
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
