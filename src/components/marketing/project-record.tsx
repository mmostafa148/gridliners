import { Building2, MapPin, Tags, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { ContentLanguage, SubCategory } from "@/lib/api/types";

/**
 * What the entrant wrote, and what they attached to it.
 *
 * **The description is rendered exactly as submitted** - never translated
 * (§3.8) - and carries its own `lang` and `dir`, so an Arabic submission stays
 * right-to-left on the English page and an English one stays left-to-right on
 * the Arabic page. `<bdi>` inside a block that keeps the page's own direction
 * is the pattern 1.6 and 1.7 already use for entry content: the paragraph stays
 * aligned to the page while the sentence inside it reads correctly.
 *
 * **The two outbound actions have left this component.** The project's own
 * address moved into the hero, beside the vote, and the film became a plate of
 * its own (`ProjectFilm`) - a line of small caps was never going to say what a
 * film is worth. What is left is the record: the facts, and the credits when
 * the entrant supplied any.
 */
export async function ProjectRecord({
  contentLanguage,
  contentDir,
  credits,
  client,
  owner,
  country,
  subCategories,
  locale,
}: {
  contentLanguage: ContentLanguage;
  contentDir: "ltr" | "rtl";
  credits: string[];
  /**
   * The Sitemap distinguishes **Project Client** from **Project Owner**. The
   * owner is the participant who entered; the client is who the work was made
   * for, which the entry model has no field for and which arrives here as
   * provisional story data registered for replacement.
   */
  client: string | null;
  owner: string | null;
  country: string;
  subCategories: SubCategory[];
  locale: Locale;
}) {
  const t = await getTranslations("project");
  /**
   * Each fact carries its own mark.
   *
   * The icons are **`aria-hidden` and carry nothing** - the label beside each
   * one already names the field, so a reader who cannot see them loses nothing.
   * They are there to make four blocks of small type scannable at a glance,
   * which is the only job they have.
   *
   * None of the four mirrors: a pin, a person, a building and a pair of tags
   * mean the same thing in either direction, so there is no `-scale-x-100` here
   * the way there is on an arrow.
   */
  const facts: { label: string; value: string; Icon: LucideIcon }[] = [
    ...(client ? [{ label: t("record.client"), value: client, Icon: Building2 }] : []),
    ...(owner ? [{ label: t("record.owner"), value: owner, Icon: User }] : []),
    { label: t("record.country"), value: country, Icon: MapPin },
    {
      label: t("record.categories"),
      value: subCategories.map((sub) => sub.name[locale]).join(", "),
      Icon: Tags,
    },
  ];

  return (
    /* A strip, not a column. Four facts across the measure, with the credits
       and the entrant's own links on the row beneath - so the record closes the
       section it belongs to instead of standing alone in a band of its own. */
    <section aria-labelledby="record-title" className="text-navy-900">
      <h2 id="record-title" className="sr-only">
        {t("record.title")}
      </h2>

      {/* Cards, not a strip of loose columns. Four facts sitting on the bare
          ground read as a caption run under the story; boxed, they read as the
          record they are, and each one holds its own measure however long the
          value is. */}
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(({ label, value, Icon }) => (
          /* A tinted block with its own mark. The ground alone gives the four
             facts weight; the rule that used to sit on the leading edge is
             gone, and the icon does the marking instead. */
          <div key={label} className="bg-mist p-6 lg:p-7">
            <Icon aria-hidden className="size-5 text-blue-700" strokeWidth={1.75} />
            <dt className="mt-4 font-display text-coord uppercase text-navy-600">{label}</dt>
            <dd className="mt-2 text-body-lg leading-snug text-navy-900">{value}</dd>
          </div>
        ))}
      </dl>

      {credits.length > 0 ? (
        <div className="mt-12 border-t border-navy-900/15 pt-10">
          <h3 className="font-display text-coord uppercase text-navy-600">
            {t("credits")}
          </h3>
          {/* Credits are authored by the entrant in their own language,
              so each line carries the entry's direction. */}
          <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {credits.map((line) => (
              <li key={line} className="text-body-md text-navy-600">
                <bdi lang={contentLanguage} dir={contentDir}>
                  {line}
                </bdi>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

    </section>
  );
}
