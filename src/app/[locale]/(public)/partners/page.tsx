import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/marketing/page-header";
import { PartnerWall } from "@/components/marketing/partner-wall";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Partners.
 *
 * **A logo wall is the primary treatment**, as the Sitemap and the client both
 * ask. Categories filter it through the URL, the same way the media centre
 * filters its archive, so a link to "the schools we work with" is a link.
 *
 * **It is not paginated, and that is a decision rather than an omission.**
 * Thirty marks is four rows on a laptop and fifteen on a phone; splitting that
 * across pages would hide partners behind a control to satisfy a checklist.
 * Pagination is added the day the wall stops being comfortable on one page.
 */

const CATEGORIES = [
  { slug: "tools", en: "Tools & software", ar: "الأدوات والبرمجيات" },
  { slug: "platforms", en: "Platforms & community", ar: "المنصات والمجتمع" },
  { slug: "districts", en: "Districts & venues", ar: "الأحياء والمقار" },
  { slug: "media", en: "Media & press", ar: "الإعلام والصحافة" },
  { slug: "production", en: "Print & production", ar: "الطباعة والإنتاج" },
  { slug: "education", en: "Education", ar: "التعليم" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partners" });
  return { title: t("title"), description: t("lead") };
}

export default async function PartnersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const category = CATEGORIES.find((c) => c.slug === raw);
  const t = await getTranslations("partners");
  const partners = await api.content.partners(
    category ? { categoryId: category.slug } : {},
  );

  const chip =
    "inline-flex h-10 items-center border px-5 font-display text-coord uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
  const on = "border-navy-900 bg-navy-900 text-cream-50";
  const off = "border-navy-900/20 bg-white text-navy-700 hover:border-navy-900/50";
  const href = (slug?: string) => (slug ? `/partners?category=${slug}` : "/partners");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <section aria-labelledby="wall-title" className="bg-mist text-navy-900">
        <div className="page-shell section-y">
          <h2 id="wall-title" className="sr-only">
            {t("title")}
          </h2>

          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href={href()}
                aria-current={!category ? "true" : undefined}
                className={cn(chip, !category ? on : off)}
              >
                {t("all")}
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={href(c.slug)}
                  aria-current={category?.slug === c.slug ? "true" : undefined}
                  className={cn(chip, category?.slug === c.slug ? on : off)}
                >
                  {locale === "ar" ? c.ar : c.en}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-display text-coord uppercase text-navy-600" aria-live="polite">
            {t("count", { count: partners.length })}
          </p>

          <div className="mt-8">
            {partners.length ? (
              <PartnerWall partners={partners} />
            ) : (
              <div className="border border-navy-900/15 bg-white p-10 text-center">
                <p className="text-h3">{t("noneInCategory")}</p>
                <Link
                  href={href()}
                  className="mt-6 inline-flex h-11 items-center border border-navy-900 px-6 font-display text-coord uppercase transition-colors hover:bg-navy-900 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  {t("all")}
                </Link>
              </div>
            )}
          </div>

          <p className="mt-10 max-w-[62ch] text-body-md text-navy-600">{t("independence")}</p>
        </div>
      </section>

      <section aria-labelledby="become-title" className="bg-blue-700 text-cream-50">
        <div className="page-shell section-y">
          <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2 id="become-title" className="text-h1 text-balance">
                {t("becomeTitle")}
              </h2>
              <p className="mt-4 max-w-[52ch] text-body-md text-cream-100/90">{t("becomeLead")}</p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <Link
                href="/partner"
                className="inline-flex h-12 items-center border border-cream-50 bg-cream-50 px-7 font-display text-data-sm uppercase tracking-[0.1em] text-navy-950 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
              >
                {t("becomeCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
