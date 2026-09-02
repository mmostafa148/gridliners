import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalDocument } from "@/components/marketing/legal-document";
import { PageHeader } from "@/components/marketing/page-header";
import type { Locale } from "@/i18n/routing";
import { PRIVACY } from "@/lib/fixtures/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("privacy.title"), description: t("privacy.lead") };
}

export default async function PrivacyPage({
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
        eyebrow={t("privacy.eyebrow")}
        title={t("privacy.title")}
        lead={t("privacy.lead")}
      />
      <LegalDocument doc={PRIVACY} locale={locale} />
    </>
  );
}
