import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AboutStory } from "@/components/marketing/about-story";
import { CeremonyGallery } from "@/components/marketing/ceremony-gallery";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { MissionVision } from "@/components/marketing/mission-vision";
import { PageHeader } from "@/components/marketing/page-header";
import { TeamGrid } from "@/components/marketing/team-grid";
import { api } from "@/lib/api";

/**
 * About.
 *
 * Content-map §1.2, in its order: brand statement, the story and the
 * association, mission and vision, the team, the ceremony, the questions, and
 * the ask.
 *
 * The map's fourth bullet — the award timetable and the previous-editions
 * calendar — was cut on the client's instruction and is flagged for a map
 * update in build-state §9. Everything it read is still in the fixtures.
 *
 * A server component calling `api.*` directly, like every other Phase 1 page:
 * SEO-critical, so the dates and records are in the HTML rather than fetched
 * after hydration.
 *
 * It is the first screen the mock layer could not already answer. The team,
 * the FAQ list and the ceremony record are new types on `ContentService`; the
 * timetable and the editions come from cycles that already existed.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Named apart from the page's translator: check-messages binds one namespace
  // per variable name per file, not per scope.
  const tMeta = await getTranslations({ locale, namespace: "about.meta" });

  return {
    title: tMeta("title"),
    description: tMeta("description"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tClosing, cycle, team, ceremonies, faqs] = await Promise.all([
    getTranslations("about.header"),
    getTranslations("about.closing"),
    api.cycles.getActive(),
    api.content.team(),
    api.content.ceremonies(),
    api.content.faqs(),
  ]);

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <AboutStory />

      <MissionVision />

      {/* Content-map §1.2's fourth bullet — the award timetable and the
          previous-editions calendar — is deliberately not rendered. Removed on
          the client's instruction on 2026-08-13, after five compositions; see
          the map-update flag in build-state §9. The cycle's dates and the
          edition years are untouched in the fixtures and `about.timetable.*`
          keeps its keys in both locales, so restoring the bullet is a matter
          of putting a component back, not of recovering content. */}

      <TeamGrid members={team} />

      <CeremonyGallery editions={ceremonies} />

      <FaqAccordion items={faqs} />

      {/* The map's bullet is "enter the awards / contact". The primary stays
          the cycle's own action, from the map the header and the menu read;
          the second slot is this page's, and it is contact. No countdown:
          About is not the page a deadline belongs on.
          `culmination` gives the band the page's own scale rather than the
          one it shares with two other closing bands, so the wall ends on a
          statement instead of a coloured rectangle with type in a corner. */}
      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        culmination
        groundAbove="bg-mist"
        secondary={{ href: "/contact", label: tClosing("contact") }}
      />
    </>
  );
}
