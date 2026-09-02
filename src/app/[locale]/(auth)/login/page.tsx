import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/account/login-form";
import { AuthScreen } from "@/components/account/auth-screen";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSession, safeReturnTo } from "@/lib/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signInTitle") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const raw = sp.returnTo;
  const returnTo = safeReturnTo(Array.isArray(raw) ? raw[0] : raw);

  // Already signed in: this screen has nothing to offer, and rendering it
  // invites somebody to sign in a second time as themselves.
  const session = await getSession();
  if (session?.role === "participant") redirect(`/${locale}${returnTo}`);

  const t = await getTranslations("auth");

  return (
    <AuthScreen
      eyebrow={t("eyebrow")}
      title={t("signInTitle")}
      lead={t("signInLead")}
      aside={t("tierNote")}
      formPanelClassName="bg-[#f3f3f9]"
      fullDesktopHeight
    >
      <div className="flex flex-col gap-7">
      <LoginForm returnTo={returnTo} />

      <p className="border-t border-navy-900/10 pt-6 text-body-sm text-navy-600">
        {t("noAccount")}{" "}
        <Link
          href={`/register${returnTo !== "/dashboard" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-medium text-blue-700 underline decoration-blue-700/35 underline-offset-4 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {t("register")}
        </Link>
      </p>
      </div>
    </AuthScreen>
  );
}
