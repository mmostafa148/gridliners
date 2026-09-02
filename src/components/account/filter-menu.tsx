"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * One filter, as a multi-select menu.
 *
 * **Checkboxes inside a real GET form, not a client-side store.** The whole
 * filter row is one `<form>`; this menu contributes `<input type="checkbox">`
 * elements with the same `name`, so submitting produces `?state=draft&
 * state=submitted` and the server reads an array. That is why it still works
 * with JavaScript off: the menu is a `<details>`, the boxes are boxes, and the
 * form's own submit applies them.
 *
 * **Every menu clears itself.** `Clear` unchecks this filter's boxes and
 * submits, so a participant can drop one filter without touching the others or
 * hunting for a global reset. The row keeps a `Clear all` as well.
 *
 * The panel closes on Escape and on a click outside, and returns focus to the
 * control that opened it — the same behaviour the account navigation uses.
 */
export function FilterMenu({
  name,
  label,
  options,
  selected,
}: {
  /** The query parameter these checkboxes write to. */
  name: string;
  label: string;
  options: { value: string; label: string; mark?: React.ReactNode }[];
  selected: string[];
}) {
  const t = useTranslations("accountFilters");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const count = selected.length;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "flex h-10 min-w-[9rem] items-center gap-2 border px-3.5 text-[0.875rem] transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
          count
            ? "border-navy-900 bg-navy-900 text-cream-50"
            : "border-navy-900/25 bg-white text-navy-800 hover:border-navy-900/55",
        )}
      >
        <span className="font-medium">{label}</span>
        <span className={cn("truncate", count ? "text-cream-200/80" : "text-navy-600")}>
          {count ? t("anyOf", { n: count }) : t("allOf")}
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={2}
          className={cn(
            "ms-auto size-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Always in the DOM so the form submits what is checked even when the
          menu is shut; hidden rather than unmounted. */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute z-30 mt-1 min-w-[15rem] border-2 border-navy-900 bg-white p-1.5"
      >
        <ul className="flex max-h-72 flex-col overflow-y-auto">
          {options.map((option) => {
            const on = selected.includes(option.value);
            return (
              <li key={option.value}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2.5 text-body-sm text-navy-800",
                    "transition-colors hover:bg-mist",
                    "focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-blue-700",
                  )}
                >
                  <input
                    type="checkbox"
                    name={name}
                    value={option.value}
                    defaultChecked={on}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-4 shrink-0 place-items-center border",
                      on ? "border-navy-900 bg-navy-900" : "border-navy-900/35 bg-white",
                    )}
                  >
                    {on ? <Check className="size-3 text-cream-50" strokeWidth={3} /> : null}
                  </span>
                  {option.mark}
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="mt-1 flex items-center justify-between gap-3 border-t border-navy-900/10 px-3 pb-1 pt-2.5">
          {/* Clears this filter only. A submit button with no value for `name`
              is what makes the parameter absent from the next URL. */}
          <button
            type="submit"
            name={`clear-${name}`}
            value="1"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-blue-700 underline underline-offset-4 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <X aria-hidden className="size-3.5" />
            {t("clearThis")}
          </button>
          <button
            type="submit"
            className="inline-flex h-8 items-center bg-navy-900 px-3.5 text-[0.8125rem] font-medium text-cream-50 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {t("apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
