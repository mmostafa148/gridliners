import { getFormatter, getTranslations } from "next-intl/server";

import { EntryCover } from "@/components/account/entry-cover";
import { Figure, Meta, accountAction } from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Entry, SubCategory } from "@/lib/api/types";
import type { NextAction } from "@/lib/account/next-actions";
import { cn } from "@/lib/utils";

/**
 * Everything open on this account, in one list.
 *
 * **One section, not three.** The previous Overview split the same idea across
 * "Needs you now", "Waiting on you" and "Good news", so a participant had to
 * read three headings to learn what to do. Every open action is here in
 * urgency order — `nextActions` already sorts them — and the two that are
 * *news* rather than *work* (a shortlisting to share, a result to read) are not
 * in this list at all: they belong to the record below, where the work is.
 *
 * The first action is the desk's lead story: work, reason, clock and one clear
 * next move. Anything else stays visible as a quieter queue underneath. This
 * is deliberately not a set of equal rows — equal weight was the reason the
 * old dashboard felt like an admin report instead of a participant's desk.
 */
export async function Obligations({
  actions,
  entries,
  subCategories,
}: {
  actions: NextAction[];
  entries: Entry[];
  subCategories: SubCategory[];
}) {
  const [t, format] = await Promise.all([getTranslations("dashboard"), getFormatter()]);

  const open = actions.filter(
    (a) => a.kind === "cash_expiring" || a.kind === "settlement_due" || a.kind === "resume_draft",
  );
  const entryById = new Map(entries.map((e) => [e.id, e]));
  const parentOf = new Map(subCategories.map((s) => [s.id, s.parentId]));

  if (!open.length) {
    return (
      <div className="border-s-2 border-cream-100/45 py-2 ps-6">
        <p className="font-display text-account-card text-cream-50">{t("attentionNone")}</p>
        <p className="mt-2.5 max-w-[54ch] text-body-md text-cream-200/80">
          {t("attentionNoneBody")}
        </p>
      </div>
    );
  }

  const [lead, ...remaining] = open;
  const leadEntry = entryById.get(lead.entryId);

  return (
    <div>
      <div className="grid gap-7 lg:grid-cols-[minmax(12rem,0.72fr)_minmax(18rem,1.15fr)_minmax(11rem,0.55fr)] lg:items-stretch">
        {leadEntry ? (
          <EntryCover
            entry={leadEntry}
            parentId={parentOf.get(leadEntry.baseSubCategoryId) ?? ""}
            className="aspect-[4/3] w-full sm:aspect-[16/9] lg:h-full lg:min-h-56"
            sizes="(max-width: 1024px) 90vw, 30vw"
            priority
          />
        ) : null}

        <div className="flex min-w-0 flex-col justify-center">
          <p className="font-display text-overline uppercase text-campaign-yellow">
            {t(`action.${lead.kind}`)}
          </p>
          <h3 className="mt-3 font-display text-[clamp(1.65rem,3vw,2.65rem)] leading-[1.02] text-cream-50">
            {lead.entryTitle}
          </h3>
          <p className="mt-4 max-w-[58ch] text-body-md leading-relaxed text-cream-200/80">
            {t(`why.${lead.kind}`)}
          </p>
        </div>

        <div className="flex flex-col justify-between border-t border-cream-50/18 pt-5 lg:border-s lg:border-t-0 lg:py-2 lg:ps-7">
          <div className="space-y-5">
            {lead.deadline ? (
              <div>
                <Meta className="text-cream-200/65">{t("byWhen")}</Meta>
                <Figure
                  size="lg"
                  className="mt-1 block text-[clamp(1.35rem,2.2vw,2rem)] text-cream-50"
                >
                  {format.dateTime(new Date(lead.deadline), { dateStyle: "medium" })}
                </Figure>
              </div>
            ) : null}
            {lead.amountUsd ? (
              <div>
                <Meta className="text-cream-200/65">{t("amountDue")}</Meta>
                <Figure size="lg" className="mt-1 block text-cream-50">
                  ${lead.amountUsd.toLocaleString("en-US")}
                </Figure>
              </div>
            ) : null}
          </div>
          <Link href={lead.href} className={cn(accountAction.onNavy, "mt-7 w-full")}>
            {t(`actionDo.${lead.kind}`)}
          </Link>
        </div>
      </div>

      {remaining.length ? (
        <div className="mt-7 border-t border-cream-50/18 pt-2">
          <p className="py-4 font-display text-overline uppercase text-cream-200/60">
            {t("alsoWaiting", { count: remaining.length })}
          </p>
          <ul>
            {remaining.map((action) => {
              const entry = entryById.get(action.entryId);
              return (
                <li
                  key={`${action.kind}-${action.entryId}`}
                  className="grid gap-4 border-t border-cream-50/12 py-4 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center"
                >
                  {entry ? (
                    <EntryCover
                      entry={entry}
                      parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                      className="hidden size-14 sm:block"
                      sizes="56px"
                    />
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  <div className="min-w-0">
                    <p className="text-caption text-cream-200/65">
                      {t(`action.${action.kind}`)}
                    </p>
                    <p className="mt-0.5 font-display text-body-md text-cream-50">
                      {action.entryTitle}
                    </p>
                  </div>
                  <Link href={action.href} className={accountAction.onNavyQuiet}>
                    {t(`actionDo.${action.kind}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
