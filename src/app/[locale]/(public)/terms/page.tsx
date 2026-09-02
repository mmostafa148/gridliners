import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalDocument } from "@/components/marketing/legal-document";
import { PageHeader } from "@/components/marketing/page-header";
import type { Locale } from "@/i18n/routing";
import { TERMS } from "@/lib/fixtures/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("terms.title"), description: t("terms.lead") };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <>
      <PageHeader
        eyebrow={t("terms.eyebrow")}
        title={t("terms.title")}
        lead={t("terms.lead")}
      />
      <LegalDocument doc={TERMS} locale={locale} />
    </>
  );
}
