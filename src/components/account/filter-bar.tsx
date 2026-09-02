"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Search and filters, on one line.
 *
 * They were three stacked rows — a search field, a row of state chips, a row of
 * cycle chips — which is roughly 200px of chrome standing between a participant
 * and their work. One row: the field, the menus, and the resets.
 *
 * **The whole bar is a single GET form**, so filtering is still URL state, the
 * back button still works, and none of it needs JavaScript. `FilterMenu`
 * contributes checkboxes; this contributes the query and the clears.
 *
 * Each control clears itself — the field has an × that empties and submits,
 * every menu has its own Clear — and `Clear all` is a plain link to the bare
 * route, which is the one reset that cannot get out of step with the form.
 */
export function FilterBar({
  action,
  placeholder,
  query,
  hasAny,
  clearAllHref,
  children,
}: {
  /** Where the GET form submits: the listing's own route. */
  action: string;
  placeholder: string;
  query: string;
  /** Whether anything is filtering right now, so `Clear all` can be honest. */
  hasAny: boolean;
  clearAllHref: string;
  /** The `FilterMenu`s this listing offers. */
  children: React.ReactNode;
}) {
  const t = useTranslations("accountFilters");
  const id = useId();
  const fieldRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(query);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <div className="relative flex min-w-[14rem] flex-1 items-center">
        <Search
          aria-hidden
          className="pointer-events-none absolute start-3 size-4 shrink-0 text-navy-500"
          strokeWidth={2}
        />
        <label htmlFor={id} className="sr-only">
          {placeholder}
        </label>
        <input
          ref={fieldRef}
          id={id}
          name="query"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-10 w-full border border-navy-900/25 bg-white ps-9 text-body-sm text-navy-900",
            value ? "pe-9" : "pe-3",
            "placeholder:text-navy-600 hover:border-navy-900/45",
            "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-700",
            // Safari draws its own clear affordance on `type=search`; ours is
            // the one that submits, so the native one is suppressed.
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
        />
        {value ? (
          <button
            type="submit"
            name="query"
            value=""
            onClick={() => setValue("")}
            aria-label={t("clearSearch")}
            className="absolute end-1 grid size-8 place-items-center text-navy-600 transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
      </div>

      {children}

      <button
        type="submit"
        className={cn(
          "inline-flex h-10 items-center border border-navy-900/25 bg-white px-4",
          "text-[0.875rem] font-medium text-navy-900 transition-colors",
          "hover:border-navy-900/55 hover:bg-navy-50",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
        )}
      >
        {t("apply")}
      </button>

      {hasAny ? (
        <a
          href={clearAllHref}
          className="inline-flex h-10 items-center gap-1.5 text-[0.875rem] font-medium text-blue-700 underline underline-offset-4 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <X aria-hidden className="size-3.5" />
          {t("clearAll")}
        </a>
      ) : null}
    </form>
  );
}
