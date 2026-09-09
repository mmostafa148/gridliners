import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { ProjectStory } from "@/lib/fixtures/project-stories";
import type { ContentLanguage } from "@/lib/api/types";

/**
 * The story: brief, concept, execution, outcome.
 *
 * **A one-line description is not storytelling**, and one line is all the entry
 * model carries. The Sitemap asks for pages "fostering storytelling and visual
 * appeal", so the page carries four short movements that answer the questions a
 * reader of design work actually has: what was asked, what the idea was, how it
 * was made, and what happened.
 *
 * **All of this copy is provisional and is labelled as such.** It is written
 * per project - each brief has its
 * own constraint and each outcome its own measure - because one story with the
 * names changed is worse than no story.
 *
 * **Two languages, two jobs.** The entry's own `description` is authored text
 * and keeps its `lang`/`dir` whatever locale the page is in (§3.8). These four
 * movements are the page's editorial voice, not the entrant's, so they follow
 * the reader's locale like every other interface string.
 */
export async function ProjectNarrative({
  description,
  contentLanguage,
  contentDir,
  story,
  locale,
}: {
  description: string;
  contentLanguage: ContentLanguage;
  contentDir: "ltr" | "rtl";
  story: ProjectStory | null;
  locale: Locale;
}) {
  const t = await getTranslations("project");

  const movements = story
    ? ([
        ["brief", story.brief[locale]],
        ["concept", story.concept[locale]],
        ["execution", story.execution[locale]],
        ["outcome", story.outcome[locale]],
      ] as const)
    : [];

  return (
    <section aria-labelledby="narrative-title">
      {/* The label is hung on a short accent rule rather than floating above
          the lead on its own. It is the one place the identity's blue appears
          in this band, and it marks where the section starts. */}
      <h2
        id="narrative-title"
        className="flex items-center gap-4 font-display text-coord uppercase text-navy-600"
      >
        <span aria-hidden className="h-px w-10 shrink-0 bg-blue-700" />
        {t("description")}
      </h2>
      <p className="mt-7 max-w-[24ch] text-display-md leading-[1.06] text-balance sm:max-w-[30ch] lg:max-w-[36ch]">
        <bdi lang={contentLanguage} dir={contentDir}>
          {description}
        </bdi>
      </p>

      {/**
        * Four movements, numbered, on a ruled grid.
        *
        * **The numbers earn their place.** Brief, concept, execution, outcome
        * is a sequence - what was asked, what the idea was, how it was made,
        * what happened - so counting them states something true rather than
        * decorating them. On anything that is not ordered, they would be
        * ornament.
        *
        * The rules between the columns are what turn four paragraphs sitting
        * near each other into one grid. They are logical borders, so the run
        * reads right to left in Arabic without a second rule appearing on the
        * wrong edge.
        */}
      {movements.length ? (
        <div className="mt-16 grid gap-x-10 gap-y-12 border-t border-navy-900/15 pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:[&>*+*]:border-s lg:[&>*+*]:border-navy-900/12 lg:[&>*+*]:ps-10">
          {movements.map(([key, body], i) => (
            <div key={key}>
              <p aria-hidden className="font-data text-data-sm tabular-nums text-navy-900/65">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-coord uppercase text-blue-700">
                {t(`narrative.${key}`)}
              </h3>
              <p className="mt-4 text-body-md text-navy-600">{body}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
