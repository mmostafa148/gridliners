import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClosingCta } from "@/components/marketing/closing-cta";
import { FinalistsYear } from "@/components/marketing/finalists-year";
import { PageHeader } from "@/components/marketing/page-header";
import { EmptyState } from "@/components/shared/status-patterns";
import { api } from "@/lib/api";
import { currentFinalistYear, yearShortlist } from "@/lib/finalists";

/**
 * Finalists, with no year named.
 *
 * **It opens the running cycle's shortlist.** It used to be an archive index -
 * a page whose entire job was to send a reader somewhere else - and the footer
 * has pointed at `/finalists` since Phase 1.1, so the site's own "Finalists"
 * link landed on a page with no finalists on it. The years grid was not
 * dropped, it moved: every year's page now ends with the other years (§1.6
 * `[map-update]`, 2026-08-24).
 *
 * The composition itself lives in `FinalistsYear`, rendered identically by
 * `/finalists/<year>`. One place, so the two cannot drift into two screens.
 *
 * **Canonical, not a redirect.** `/finalists` is a stable address meaning "the
 * current shortlist" and the footer should be able to point at it forever, so
 * it renders rather than bouncing through a 302. The duplicate-content question
 * is answered where it belongs, with a canonical link to the year's own URL.
 *
 * The empty state is real: a cycle can exist before anything has been
 * shortlisted, and then this route still has to answer.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const year = await currentFinalistYear();

  // The object form, and named apart from the page body's translator:
  // check-messages binds one namespace per variable name per file.
  const tMeta = await getTranslations({
    locale,
    namespace: year === null ? "finalists.archive.meta" : "finalists.meta",
  });

  return {
    title: year === null ? tMeta("title") : tMeta("title", { year: String(year) }),
    description:
      year === null ? tMeta("description") : tMeta("description", { year: String(year) }),
    // The year's own URL is the canonical address for this content; this route
    // is the convenience entry point to whichever year that currently is.
    alternates: year === null ? undefined : { canonical: `/${locale}/finalists/${year}` },
  };
}

export default async function FinalistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const year = await currentFinalistYear();
  const shortlist = year === null ? null : await yearShortlist(year);

  if (shortlist) return <FinalistsYear shortlist={shortlist} />;

  const [t, tClosing, cycle] = await Promise.all([
    getTranslations("finalists.archive"),
    getTranslations("finalists.closing"),
    api.cycles.getActive(),
  ]);

  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />

      <section className="bg-white text-navy-900">
        <div className="page-shell section-y">
          <EmptyState title={t("empty.title")} description={t("empty.description")} />
        </div>
      </section>

      {/* White here, not mist: this branch closes after the empty state's own
          white section rather than after `ArchiveYears`. */}
      <ClosingCta
        cycle={cycle}
        title={tClosing("title")}
        body={tClosing("body")}
        countdown={false}
        groundAbove="bg-white"
        selfHref="/finalists"
      />
    </>
  );
}
