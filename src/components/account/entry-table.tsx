import { getFormatter, getTranslations } from "next-intl/server";

import { EntryCover } from "@/components/account/entry-cover";
import { EntryStatus } from "@/components/account/entry-status";
import {
  Figure,
  Meta,
  PANEL_X,
  TABLE_CELL,
  TABLE_HEAD,
  TABLE_NUM,
  TABLE_ROW,
  accountRowAction,
} from "@/components/account/system";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Entry, SubCategory } from "@/lib/api/types";
import { effectiveTier } from "@/lib/api/types";
import { entryAction } from "@/lib/account/entry-actions";
import { cn } from "@/lib/utils";

/**
 * The entries in one awards calendar, as a table.
 *
 * **A table, because this is tabular.** Fifteen entries compared on the same
 * six facts is the definition of it, and a real `<table>` gives a screen reader
 * the column with the cell and a sighted reader a column to run down. The
 * sitemap's own fields lead: Project Image, Project Title, Entry-ID, then the
 * CTA.
 *
 * **Below `lg` it becomes blocks, and nothing is dropped.** Every column
 * survives as a labelled line; the phone gets the same six facts in a shape a
 * 390px screen can hold.
 */
export async function EntryTable({
  entries,
  subCategories,
  paidFor,
  finalized,
  locale,
}: {
  entries: Entry[];
  subCategories: SubCategory[];
  paidFor: Map<string, number>;
  finalized: Set<string>;
  locale: Locale;
}) {
  const [t, tTier, format] = await Promise.all([
    getTranslations("entries"),
    getTranslations("tier"),
    getFormatter(),
  ]);

  const subById = new Map(subCategories.map((s) => [s.id, s]));
  const head = TABLE_HEAD;
  const cell = TABLE_CELL;
  // A table's own padding does not reach its cells, so the edge columns carry
  // the panel's inset and the rows line up with the panel header above them.
  const EDGE_START = "ps-5 sm:ps-7";
  const EDGE_END = "pe-5 sm:pe-7";

  const facts = (entry: Entry) => {
    const base = subById.get(entry.baseSubCategoryId);
    const addOns = entry.additionalSubCategoryIds.length;
    const tier = effectiveTier(entry);
    return {
      base,
      addOns,
      tier,
      corrected: tier !== entry.declaredTier,
      moved: entry.submittedAt ?? entry.checkoutCompletedAt ?? entry.createdAt,
      action: entryAction(entry, finalized.has(entry.id)),
      paid: paidFor.get(entry.id),
    };
  };

  return (
    <>
      <table className="hidden w-full border-collapse text-start lg:table">
        <caption className="sr-only">{t("title")}</caption>
        <thead>
          <tr className="border-b border-navy-900/15">
            <th scope="col" className={cn(head, "w-14", EDGE_START)}>
              <span className="sr-only">{t("colEntry")}</span>
            </th>
            <th scope="col" className={cn(head, "pe-5")}>{t("colEntry")}</th>
            <th scope="col" className={cn(head, "w-44 pe-4")}>{t("colCategories")}</th>
            <th scope="col" className={cn(head, "w-48 pe-4")}>{t("colTier")}</th>
            <th scope="col" className={cn(head, "w-36 pe-4")}>{t("colState")}</th>
            <th scope="col" className={cn(head, "w-24 pe-4 text-end")}>{t("colPaid")}</th>
            <th scope="col" className={cn(head, "w-28 pe-4")}>{t("colUpdated")}</th>
            <th scope="col" className={cn(head, "w-44", EDGE_END)}>
              <span className="sr-only">{t("colState")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const f = facts(entry);
            return (
              <tr key={entry.id} className={TABLE_ROW}>
                <td className={cn(cell, "pe-4", EDGE_START)}>
                  <Link
                    href={f.action.href}
                    tabIndex={-1}
                    aria-hidden
                    className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <EntryCover
                      entry={entry}
                      parentId={f.base?.parentId ?? ""}
                      className="size-11 ring-1 ring-navy-900/10"
                      sizes="44px"
                    />
                  </Link>
                </td>
                <td className={cn(cell, "pe-5")}>
                  <Link
                    href={f.action.href}
                    className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <span className="block text-body-sm font-medium text-navy-900 transition-colors hover:text-blue-700">
                      {entry.title}
                    </span>
                  </Link>
                  <Figure size="sm" className="mt-0.5 block text-navy-600">
                    {entry.id}
                  </Figure>
                </td>
                <td className={cn(cell, "pe-4")}>
                  <span className="block text-body-sm text-navy-800">{f.base?.name[locale]}</span>
                  {f.addOns ? (
                    <Meta className="mt-0.5 block">
                      {f.addOns === 1 ? t("addOns", { n: 1 }) : t("addOnsPlural", { n: f.addOns })}
                    </Meta>
                  ) : null}
                </td>
                <td className={cn(cell, "pe-4")}>
                  <span className="block text-body-sm text-navy-800">{tTier(f.tier)}</span>
                  {f.corrected ? (
                    <Meta className="mt-0.5 block text-balance">
                      {t("declaredAs", { tier: tTier(entry.declaredTier) })}
                    </Meta>
                  ) : null}
                </td>
                <td className={cn(cell, "pe-4")}>
                  <EntryStatus state={entry.state} chip />
                </td>
                <td className={cn(cell, TABLE_NUM, "pe-4 text-end")}>
                  {f.paid ? (
                    <span className="text-body-sm font-semibold text-navy-900">
                      ${f.paid.toLocaleString("en-US")}
                    </span>
                  ) : (
                    <Meta>{t("unpaid")}</Meta>
                  )}
                </td>
                <td className={cn(cell, "pe-4")}>
                  <Figure size="sm" className="whitespace-nowrap text-navy-700">
                    {format.dateTime(new Date(f.moved), { dateStyle: "medium" })}
                  </Figure>
                </td>
                <td className={cn(cell, EDGE_END)}>
                  <span className="flex justify-end">
                    <Link
                      href={f.action.href}
                      className={
                        f.action.primary ? accountRowAction.primary : accountRowAction.secondary
                      }
                    >
                      {t(`act.${f.action.key}`)}
                    </Link>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Phone and tablet: a block per entry. Every column survives. */}
      <ul className="flex flex-col lg:hidden">
        {entries.map((entry) => {
          const f = facts(entry);
          return (
            <li
              key={entry.id}
              className={cn("border-b border-navy-900/8 py-4 last:border-b-0", PANEL_X)}
            >
              <div className="flex gap-4">
                <EntryCover
                  entry={entry}
                  parentId={f.base?.parentId ?? ""}
                  className="size-14 shrink-0"
                  sizes="56px"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={f.action.href}
                    className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <span className="block text-body-md font-medium text-navy-900">
                      {entry.title}
                    </span>
                  </Link>
                  <Figure size="sm" className="mt-0.5 block text-navy-600">
                    {entry.id}
                  </Figure>
                  <EntryStatus state={entry.state} chip className="mt-2" />
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="min-w-0">
                  <dt className="text-caption text-navy-600">{t("colCategories")}</dt>
                  <dd className="mt-0.5 text-body-sm text-navy-800">
                    {f.base?.name[locale]}
                    {f.addOns
                      ? ` · ${f.addOns === 1 ? t("addOns", { n: 1 }) : t("addOnsPlural", { n: f.addOns })}`
                      : ""}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-caption text-navy-600">{t("colTier")}</dt>
                  <dd className="mt-0.5 text-body-sm text-navy-800">
                    {tTier(f.tier)}
                    {f.corrected ? ` · ${t("declaredAs", { tier: tTier(entry.declaredTier) })}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-navy-600">{t("colPaid")}</dt>
                  <dd className="mt-0.5">
                    {f.paid ? (
                      <Figure size="sm" className="text-navy-800">
                        ${f.paid.toLocaleString("en-US")}
                      </Figure>
                    ) : (
                      <Meta>{t("unpaid")}</Meta>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-navy-600">{t("colUpdated")}</dt>
                  <dd className="mt-0.5">
                    <Figure size="sm" className="text-navy-700">
                      {format.dateTime(new Date(f.moved), { dateStyle: "medium" })}
                    </Figure>
                  </dd>
                </div>
              </dl>

              <Link
                href={f.action.href}
                className={cn(
                  f.action.primary ? accountRowAction.primary : accountRowAction.secondary,
                  "mt-4 w-full",
                )}
              >
                {t(`act.${f.action.key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
