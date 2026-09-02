import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AccountShell } from "@/components/account/account-shell";
import { SectionTitle, accountAction } from "@/components/account/system";
import { EntryWizard } from "@/components/account/wizard/entry-wizard";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { draftFromEntry } from "@/lib/account/wizard";
import { wizardData } from "@/lib/account/wizard-data";
import { requireOwnEntry, requireParticipant } from "@/lib/auth/guard";
import { canEdit } from "@/lib/account/entry-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wizard" });
  return { title: t("editTitle") };
}

/**
 * 2.4 — editing a draft.
 *
 * **The route decision, recorded.** `/entries/[id]/edit` — the screen map says
 * "the entry wizard `/entries/new` (and edit while Draft)" and names no route
 * for the second half, so this follows the App Router convention the rest of
 * the build uses: the resource, then the verb. Nothing in the repository
 * contradicted it.
 *
 * **After submission the same URL refuses to mutate.** It does not 404 — the
 * entry exists and belongs to the reader — and it does not redirect silently,
 * because a URL that quietly becomes a different page is how somebody loses
 * track of what they were doing. It says the entry is a record now and offers
 * the record. The server action refuses the same write independently, so a
 * stale tab cannot post around this page.
 */
export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { participant } = await requireParticipant();
  const entry = await requireOwnEntry(id, participant.id);
  const t = await getTranslations("wizard");

  if (!canEdit(entry)) {
    return (
      <AccountShell participantId={participant.id} locale={locale}>
        <div className="account-shell account-y">
          <div className="max-w-[62ch] border-s-2 border-navy-900/30 ps-6">
            <SectionTitle>{t("lockedTitle")}</SectionTitle>
            <p className="mt-3 text-body-lg text-navy-700">{t("lockedBody")}</p>
            <Link href={`/entries/${entry.id}`} className={`${accountAction.primary} mt-8`}>
              {t("openEntry")}
            </Link>
          </div>
        </div>
      </AccountShell>
    );
  }

  const data = await wizardData(participant.id, locale);

  return (
    <AccountShell participantId={participant.id} locale={locale}>
      <div className="account-shell pt-7 md:pt-9">
        <h1 className="font-display text-account-title text-navy-900">{t("editTitle")}</h1>
        <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">
          {entry.title}
        </p>
      </div>
      <div className="account-shell pb-[var(--account-y)] pt-6">
        <div className="border border-navy-900/10 bg-white p-5 sm:p-7">
        <EntryWizard
          entryId={entry.id}
          initial={draftFromEntry(entry, data.parentOf)}
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
