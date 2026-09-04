import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClosingCta } from "@/components/marketing/closing-cta";
import { JudgingFrame } from "@/components/marketing/judging-frame";
import { ScoreSheets } from "@/components/marketing/score-sheets";
import { JurorPanel } from "@/components/marketing/juror-panel";
import { PageHeader } from "@/components/marketing/page-header";
import { SelectionProcess } from "@/components/marketing/selection-process";
import { TierSeparation } from "@/components/marketing/tier-separation";
import { api } from "@/lib/api";

/**
 * Jury Panel.
 *
 * Four questions, in the order an entrant asks them: what am I measured by, is
 * it fair, who is doing the measuring, and how is that governed. All four are
 * answered from `api.*` rather than from copy: the criteria and their weights,
 * the shortlist thresholds, the panel and the categories each juror is assigned
 * to are records, not page text.
 *
 * A server component calling `api.*` directly, like the other public screens:
 * Phase 1 is SEO-critical, so the panel and the published framework belong in
 * the HTML rather than arriving after hydration.
 *
 * This route closes four dangling links. The header, the footer, Home's
 * quick-nav and `phasePresentation`'s `jury_scoring` action have all pointed at
 * `/jury-panel` since Phase 1.1, and until now it resolved to the localized 404.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // The object form, and named apart from the page body's translator:
  // check-messages binds one namespace per variable name per file.
  const tMeta = await getTranslations({ locale, namespace: "jury.meta" });

  return { title: tMeta("title"), description: tMeta("description") };
}

export default async function JuryPanelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tClosing, cycle, parents, jurors] = await Promise.all([
    getTranslations("jury.header"),
    getTranslations("jury.closing"),
    api.cycles.getActive(),
    api.taxonomy.parentCategories(),
    api.jury.jurors(),
  ]);

  const orderedParents = [...parents].sort((a, b) => a.order - b.order);

  // One call per parent, because `criteria()` is keyed by parent — which is the
  // model telling the truth: a criterion belongs to a category, and an entry is
  // only ever scored against its own set.
  const criteria = (
    await Promise.all(
      orderedParents.map((parent) => api.taxonomy.criteria(parent.id)),
    )
  ).flat();

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      {/* Mapped section 1 continues here: the header opens the page and this
          carries the intro it introduces. */}
      <JudgingFrame />

      {/* The panel leads. The screen is called Jury Panel and is reached from a
          nav item called Jury, so a reader meets the jury rather than scrolling
          past the framework to find it, and the panel is this screen's
          credibility — which its closing band already claims. Reordered in the
          map first (§1.5 `[map-update]`, 2026-08-23).

          It takes the parents so a juror's scope can be **named**, not only
          coded: leading with the panel means `VI` would otherwise be the first
          thing a reader meets, and the block that names the codes now sits
          below it. */}
      <JurorPanel jurors={jurors} parents={orderedParents} />

      <ScoreSheets parents={orderedParents} criteria={criteria} />

      <TierSeparation cycle={cycle} />

      <SelectionProcess />

      {/* `selfHref`, because `phasePresentation` makes /jury-panel its own
          primary action during jury_scoring and its second action during
          verification. Without it the band could end in a button back to the
          top of the page the reader is already on. */}
      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        groundAbove="bg-navy-950"
        selfHref="/jury-panel"
      />
    </>
  );
}
