import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ResetForm } from "@/components/account/reset-form";
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
  return { title: t("resetTitle") };
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const raw = sp.token;
  const token = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  return (
    <AuthScreen
      eyebrow={t("eyebrow")}
      title={t("resetTitle")}
      lead={t("resetLead")}
      aside={t("tierNote")}
      formPanelClassName="bg-[#f3f3f9]"
    >
      <div className="flex flex-col gap-7">
      <ResetForm token={token} />

      <p className="border-t border-navy-900/10 pt-6 text-body-sm text-navy-600">
        <Link
          href="/login"
          className="font-medium text-blue-700 underline decoration-blue-700/35 underline-offset-4 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {t("backToSignIn")}
        </Link>
      </p>
      </div>
    </AuthScreen>
  );
}
