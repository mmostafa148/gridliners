import { getFormatter, getTranslations } from "next-intl/server";

import { EntryCover } from "@/components/account/entry-cover";
import { Figure, Meta, accountAction, accountRowAction } from "@/components/account/system";
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
 * A deadline gets the campaign edge and its date at figure scale, because in
 * this module a clock is the only thing that outranks the work.
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
      <div className="border-s-2 border-blue-700 ps-6">
        <p className="font-display text-account-card text-navy-900">{t("attentionNone")}</p>
        <p className="mt-2.5 max-w-[54ch] text-body-md text-navy-700">{t("attentionNoneBody")}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {open.map((action) => {
        const entry = entryById.get(action.entryId);
        const urgent = action.kind !== "resume_draft";
        return (
          <li
            key={`${action.kind}-${action.entryId}`}
            className={cn(
              "border-s-2 ps-6",
              urgent ? "border-campaign-orange" : "border-navy-900/25",
              "mb-5 last:mb-0",
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              {entry ? (
                <EntryCover
                  entry={entry}
                  parentId={parentOf.get(entry.baseSubCategoryId) ?? ""}
                  className="hidden size-14 shrink-0 sm:block"
                  sizes="56px"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-display text-overline uppercase",
                    urgent ? "text-destructive-ink" : "text-navy-600",
                  )}
                >
                  {t(`action.${action.kind}`)}
                </p>
                <p className="mt-1 font-display text-account-card text-navy-900">
                  {action.entryTitle}
                </p>
                <p className="mt-1 max-w-[64ch] text-body-sm text-navy-600">
                  {t(`why.${action.kind}`)}
                </p>
              </div>

              {action.amountUsd || action.deadline ? (
                <div className="flex shrink-0 flex-wrap items-baseline gap-x-7 gap-y-2 sm:w-44 sm:flex-col sm:items-end sm:gap-2">
                  {action.amountUsd ? (
                    <Figure size="md" className="text-navy-900">
                      ${action.amountUsd.toLocaleString("en-US")}
                    </Figure>
                  ) : null}
                  {action.deadline ? (
                    <Meta className="whitespace-nowrap">
                      {t("byWhen")}{" "}
                      <span className="font-data text-navy-800">
                        {format.dateTime(new Date(action.deadline), { dateStyle: "medium" })}
                      </span>
                    </Meta>
                  ) : null}
                </div>
              ) : null}

              <Link
                href={action.href}
                className={cn(
                  urgent ? accountAction.primary : accountRowAction.secondary,
                  "shrink-0",
                )}
              >
                {t(`actionDo.${action.kind}`)}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
