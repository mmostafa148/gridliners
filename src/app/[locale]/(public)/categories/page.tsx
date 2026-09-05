import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CategoryGroups } from "@/components/marketing/category-groups";
import { CategoryIndex } from "@/components/marketing/category-index";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { HonoraryAwards } from "@/components/marketing/honorary-awards";
import { PageHeader } from "@/components/marketing/page-header";
import { api } from "@/lib/api";

/**
 * Categories.
 *
 * The reference page: where does my work belong, what else may I add to it,
 * what does each addition cost, and which awards can I not enter at all. Four
 * questions, answered in that order, all of them out of `api.taxonomy` rather
 * than out of copy.
 *
 * A server component calling `api.*` directly, like the other public screens:
 * Phase 1 is SEO-critical, so the taxonomy and its fees have to be in the HTML
 * rather than fetched after hydration.
 *
 * Nothing here filters, searches or tabs. Twenty three sub-categories across
 * seven parents is a page you read, and the index at the top is a set of
 * anchors that work with no script at all. Interaction would be invented
 * product behaviour, and the map does not ask for it.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // The object form, and named apart from the page body's translator:
  // check-messages binds one namespace per variable name per file, so a second
  // `t` here would resolve the body's keys against this namespace.
  const tMeta = await getTranslations({ locale, namespace: "categories.meta" });

  return {
    title: tMeta("title"),
    description: tMeta("description"),
  };
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tClosing, tCta, cycle, parents, subCategories, honoraryOptions] =
    await Promise.all([
      getTranslations("categories.header"),
      getTranslations("categories.closing"),
      // The site's own wording for this destination, so the button says what
      // the rail and the phone menu say rather than a fourth phrasing of it.
      getTranslations("home.cta"),
      api.cycles.getActive(),
      api.taxonomy.parentCategories(),
      api.taxonomy.subCategories(),
      api.taxonomy.honoraryOptions(),
    ]);

  const orderedParents = [...parents].sort((a, b) => a.order - b.order);
  const categoryGroupCount = orderedParents.filter((parent) =>
    subCategories.some((subCategory) => subCategory.parentId === parent.id),
  ).length;
  const categoryGroupsGround =
    categoryGroupCount > 0 && categoryGroupCount % 2 === 0
      ? "bg-mist"
      : "bg-white";

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      {/* The four composition rules and the code key, together: the last rule
          is "additions must share your parent", and the key is how a reader
          tells which those are. */}
      <CategoryIndex parents={orderedParents} subCategories={subCategories} />

      <CategoryGroups
        parents={orderedParents}
        subCategories={subCategories}
      />

      <HonoraryAwards options={honoraryOptions} />

      {/* The map asks for How to Enter specifically, so the second action is
          set rather than left to the phase. `phasePresentation` offers it in
          only three of the seven phases, and this page's reader has just
          decided where they belong and needs the windows and prices next. */}
      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        groundAbove={
          honoraryOptions.length ? "bg-navy-950" : categoryGroupsGround
        }
        secondary={{ href: "/how-to-enter", label: tCta("howToEnter") }}
      />
    </>
  );
}
