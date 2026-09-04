import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";

import { EntryWizard } from "@/components/account/wizard/entry-wizard";
import type { Locale } from "@/i18n/routing";
import { emptyDraft } from "@/lib/account/wizard";
import { wizardData } from "@/lib/account/wizard-data";
import { requireParticipant } from "@/lib/auth/guard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wizard" });
  return { title: t("title") };
}

/**
 * 2.4 — a new entry.
 *
 * The draft entry is not created until the first save, so opening this screen
 * and closing it again does not litter My Entries with empty rows.
 */
export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { participant } = await requireParticipant();
  const t = await getTranslations("wizard");
  const data = await wizardData(participant.id, locale);

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      <div className="account-shell pt-7 md:pt-9">
        <h1 className="font-display text-account-title text-navy-900">{t("title")}</h1>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">
          {t("newLead")}
        </p>
      </div>
      <div className="account-shell pb-[var(--account-y)] pt-6">
        <div className="relative border border-navy-900/10 bg-white p-4 pt-5 shadow-[0_20px_55px_rgba(3,24,61,0.06)] sm:p-6 sm:pt-7">
          <span aria-hidden className="absolute inset-x-0 top-0 flex h-1">
            <span className="w-32 bg-blue-700" />
            <span className="w-12 bg-gold" />
          </span>
          <EntryWizard
            entryId={null}
            initial={emptyDraft({
              country: participant.country || "",
              contentLanguage: participant.uiLanguage,
            })}
            parents={data.parents}
            subCategories={data.subCategories}
            pricing={data.pricing}
            windows={data.cycle.submissionWindows}
            cashExpiryDays={data.cycle.cashExpiryDays}
            credits={data.credits}
            countries={data.countries}
          />
        </div>
      </div>
    </AccountShell>
  );
}
