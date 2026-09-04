import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClosingCta } from "@/components/marketing/closing-cta";
import { CycleRoute } from "@/components/marketing/cycle-route";
import { PageHeader } from "@/components/marketing/page-header";
import { EntryCost } from "@/components/marketing/entry-cost";
import { SubmissionGuidelines } from "@/components/marketing/submission-guidelines";
import { api } from "@/lib/api";

/**
 * How to Enter.
 *
 * The most-linked route on the site: the footer's Participate column, the
 * first Home quick-nav block, the hero's community slide, and four branches of
 * `phasePresentation` all point here, including the one where it is the
 * header's primary action. It answers four questions in order, and each of
 * them from the mock API rather than from copy: can I enter, what does it
 * cost, when does anything happen, and what do I get.
 *
 * A server component calling `api.*` directly, like Home: Phase 1 is
 * SEO-critical, so the prices and dates have to be in the HTML rather than
 * fetched after hydration.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // The object form, not the bare one: this runs before `setRequestLocale` and
  // has no request locale to read.
  //
  // Named apart from the page's own translator even though they are in
  // different scopes: check-messages binds one namespace per variable name per
  // file, so a second `t` here silently resolves the page body's keys against
  // this namespace and fails them all.
  const tMeta = await getTranslations({ locale, namespace: "enter.meta" });

  return {
    // A plain string, so the layout's `%s · Gridliners Awards` template
    // applies. Only Home overrides it, and only because it would otherwise
    // print the site name twice.
    title: tMeta("title"),
    description: tMeta("description"),
  };
}

export default async function HowToEnterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tClosing, cycle, subCategories] = await Promise.all([
    getTranslations("enter.header"),
    getTranslations("enter.closing"),
    api.cycles.getActive(),
    api.taxonomy.subCategories(),
  ]);
  // Sequenced after the cycle rather than beside it: the pricing config is
  // keyed by cycle id, so there is nothing to fetch until that resolves.
  const pricing = await api.pricing.config(cycle.id);

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      {/* Relocated from Home, finally landed. One section, not two: it already
          merges the six phase cards and the dated timeline, because four of the
          six were the same item under two names. */}
      <CycleRoute cycle={cycle} />

      {/* One section, not four. Eligibility, the price matrix, the add-on fee
          and the fees explainer were one answer to one question broken into
          four headings — the tier names stated twice, every "entry from" floor
          a number already in the matrix beneath it, and the add-on fee sitting
          a section away from the loyalty discount that modifies the same
          number. Rebuilt in three movements: the price, what changes it, what
          does not come back. Flagged [map-update] in build-state — the map
          lists these as three separate §1.4 bullets. */}
      <EntryCost
        cycle={cycle}
        basePrices={pricing.basePrices}
        loyaltyRules={pricing.loyaltyRules}
        subCategories={subCategories}
      />

      <SubmissionGuidelines />

      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        groundAbove="bg-navy-950"
        selfHref="/how-to-enter"
      />
    </>
  );
}
