import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { ProfileForm } from "@/components/account/profile-form";
import type { Locale } from "@/i18n/routing";
import { COUNTRY_CODES } from "@/lib/countries-list";
import { countryName } from "@/lib/display-names";
import { requireParticipant } from "@/lib/auth/guard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("title") };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { participant } = await requireParticipant();
  const [t, format] = await Promise.all([getTranslations("profile"), getFormatter()]);

  const countries = COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).sort(
    (a, b) => a.name.localeCompare(b.name, locale),
  );

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      <div className="account-shell pt-7 md:pt-9">
        <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{t("lead")}</p>
      </div>

      <ProfileForm
        participant={participant}
        countries={countries}
        facts={[
          { label: t("accountEmail"), value: participant.email },
          {
            label: t("memberSince"),
            value: format.dateTime(new Date(participant.createdAt), { dateStyle: "medium" }),
          },
        ]}
      />
    </AccountShell>
  );
}
