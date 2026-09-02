import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ForgotForm } from "@/components/account/forgot-form";
import { AuthScreen } from "@/components/account/auth-screen";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("forgotTitle") };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <AuthScreen
      eyebrow={t("eyebrow")}
      title={t("forgotTitle")}
      lead={t("forgotLead")}
      aside={t("tierNote")}
      formPanelClassName="bg-[#f3f3f9]"
    >
      <div className="flex flex-col gap-8">
      <ForgotForm />

      <p className="text-body-sm text-navy-600">
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {t("backToSignIn")}
        </Link>
      </p>
      </div>
    </AuthScreen>
  );
}
