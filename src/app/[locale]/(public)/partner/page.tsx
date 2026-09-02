import type { Metadata } from "next";
import { Handshake, Layers, Presentation, Scale } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EnquiryForm } from "@/components/marketing/enquiry-form";
import { PageHeader } from "@/components/marketing/page-header";
import type { Locale } from "@/i18n/routing";

/**
 * Become a partner.
 *
 * The explanation and the form are **one system, side by side**: what a
 * partnership includes sits opposite the fields that ask for it, so nobody has
 * to scroll back to remember what they are enquiring about.
 *
 * The fourth benefit is the independence clause, and it is not buried. A
 * partner reading this page should learn the condition here rather than in a
 * contract, and an entrant who wanders onto it should see the same sentence.
 */

const BENEFITS = [
  { key: "reach", Icon: Handshake },
  { key: "category", Icon: Layers },
  { key: "clinic", Icon: Presentation },
  { key: "independence", Icon: Scale },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partnerForm" });
  return { title: t("title"), description: t("lead") };
}

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("partnerForm");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <section aria-labelledby="benefits-title" className="bg-white text-navy-900">
        <div className="page-shell section-y">
          <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2
                id="benefits-title"
                className="flex items-center gap-4 font-display text-coord uppercase text-navy-600"
              >
                <span aria-hidden className="h-px w-10 shrink-0 bg-blue-700" />
                {t("benefitsTitle")}
              </h2>

              <ul className="mt-8 grid gap-px border border-navy-900/12 bg-navy-900/12">
                {BENEFITS.map(({ key, Icon }) => (
                  <li key={key} className="bg-mist p-7">
                    <Icon aria-hidden className="size-5 text-blue-700" strokeWidth={1.75} />
                    <h3 className="mt-4 text-h4 leading-snug">{t(`benefits.${key}.title`)}</h3>
                    <p className="mt-2 text-body-md text-navy-600">{t(`benefits.${key}.body`)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <h2 className="sr-only">{t("title")}</h2>
              <EnquiryForm variant="partner" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
