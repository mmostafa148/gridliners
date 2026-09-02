import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/account/register-form";
import { AuthScreen } from "@/components/account/auth-screen";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("registerTitle") };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (session?.role === "participant") redirect(`/${locale}/dashboard`);

  const t = await getTranslations("auth");

  return (
    <AuthScreen
      eyebrow={t("eyebrow")}
      title={t("registerTitle")}
      lead={t("registerLead")}
      aside={t("tierNote")}
      formPanelClassName="bg-[#f3f3f9]"
    >
      <div className="flex flex-col gap-8">
      <RegisterForm locale={locale} />

      <p className="text-body-sm text-navy-600">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {t("signIn")}
        </Link>
      </p>
      </div>
    </AuthScreen>
  );
}
