import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EnquiryForm } from "@/components/marketing/enquiry-form";
import { PageHeader } from "@/components/marketing/page-header";
import type { Locale } from "@/i18n/routing";

/**
 * Become a partner.
 *
 * The explanation and the form are **one system, side by side** inside one
 * enquiry plate: what a partnership includes sits opposite the fields that ask
 * for it, so nobody has to scroll back to remember what they are enquiring
 * about.
 *
 */

const OPPORTUNITIES = [
  { key: "reach", number: "01" },
  { key: "category", number: "02" },
  { key: "clinic", number: "03" },
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

      <section aria-labelledby="benefits-title" className="bg-mist text-navy-900">
        <div className="page-shell section-y">
          {/* One enquiry plate. The explanation and the form are two halves of
              the same decision, not a card beside a form floating on the page. */}
          <div className="border border-navy-900/15 bg-white">
            <div className="grid lg:grid-cols-12">
              <div className="p-7 sm:p-10 lg:col-span-5 lg:p-12">
                <h2
                  id="benefits-title"
                  className="flex items-center gap-4 font-display text-coord uppercase text-navy-600"
                >
                  <span aria-hidden className="h-px w-10 shrink-0 bg-blue-700" />
                  {t("benefitsTitle")}
                </h2>

                <ol className="mt-8 border-t border-navy-900/15">
                  {OPPORTUNITIES.map(({ key, number }) => (
                    <li
                      key={key}
                      className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 border-b border-navy-900/15 py-6 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-5"
                    >
                      <span
                        aria-hidden
                        className="font-data text-data-lg leading-none tabular-nums text-blue-700"
                      >
                        {number}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-h4 leading-snug">
                          {t(`benefits.${key}.title`)}
                        </h3>
                        <p className="mt-2 text-body-sm text-navy-600">
                          {t(`benefits.${key}.body`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-t border-navy-900/15 p-7 sm:p-10 lg:col-span-7 lg:border-s lg:border-t-0 lg:p-12">
                <div className="max-w-3xl">
                  <p className="font-display text-coord uppercase text-blue-700">
                    {t("formEyebrow")}
                  </p>
                  <h2 className="mt-3 text-h2 text-navy-950">{t("formTitle")}</h2>
                  <p className="mt-3 max-w-[58ch] text-body-md text-navy-600">
                    {t("formLead")}
                  </p>
                  <div className="mt-8">
                    <EnquiryForm variant="partner" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
