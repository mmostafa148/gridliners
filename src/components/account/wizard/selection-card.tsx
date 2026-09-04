"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * A choice between peers — the tier cards, and anything shaped like them.
 *
 * **Rebuilt after §49.** The tier cards carried a name and a price inside an
 * identical empty rectangle, and selection was a 1px border change. A
 * participant choosing a tier is committing to a price and to producing proof;
 * the card has to answer *who it is for*, *what it costs*, *what it needs* and
 * *what happens next*.
 *
 * **Selection is never colour alone.** A selected card inverts to navy, gains a
 * filled tick, and says "Selected" in words — three signals, one of which
 * survives a monochrome print and none of which needs hue to be read.
 */
export function SelectionCard({
  name,
  who,
  price,
  range,
  proof,
  note,
  selected,
  onSelect,
  inputName,
  value,
}: {
  name: string;
  who: string;
  price: string;
  range?: string;
  proof: string;
  note?: string;
  selected: boolean;
  onSelect: () => void;
  inputName: string;
  value: string;
}) {
  const t = useTranslations("wizard.s1");

  return (
    <label
      className={cn(
        "group relative flex h-full min-h-[17rem] cursor-pointer flex-col gap-4 overflow-hidden border p-5 transition-colors",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-700",
        selected
          ? "border-navy-900 bg-navy-900 text-cream-50"
          : "border-navy-900/12 bg-white text-navy-900 hover:border-blue-700/35 hover:bg-blue-700/[0.025]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1 transition-colors",
          selected ? "bg-gold" : "bg-navy-900/10 group-hover:bg-blue-700/45",
        )}
      />
      <input
        type="radio"
        name={inputName}
        data-field={inputName}
        value={value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              "font-display text-account-card",
              selected ? "text-cream-50" : "text-navy-900",
            )}
          >
            {name}
          </p>
          <p
            className={cn(
              "mt-1 text-body-sm",
              selected ? "text-cream-200/85" : "text-navy-700",
            )}
          >
            {who}
          </p>
        </div>
        {/* The selection mark: filled and ticked, or an empty square. */}
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center border-2 transition-colors",
            selected ? "border-cream-50 bg-cream-50" : "border-navy-900/30 group-hover:border-navy-900/60",
          )}
        >
          {selected ? <Check className="size-3.5 text-navy-900" strokeWidth={3} /> : null}
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            "font-data text-data-md tabular-nums",
            selected ? "text-cream-50" : "text-navy-900",
          )}
        >
          {price}
        </span>
        <span
          className={cn("text-caption", selected ? "text-cream-200/70" : "text-navy-600")}
        >
          {t("currentWindow")}
        </span>
      </div>

      <dl
        className={cn(
          "flex flex-col gap-3 border-t pt-4",
          selected ? "border-cream-100/20" : "border-navy-900/12",
        )}
      >
        {range ? (
          <div className="flex flex-col gap-0.5">
            <dt className={cn("text-caption", selected ? "text-cream-200/65" : "text-navy-600")}>
              {t("fullRange")}
            </dt>
            <dd className={cn("text-body-sm", selected ? "text-cream-100" : "text-navy-800")}>
              {range}
            </dd>
          </div>
        ) : null}
        <div className="flex flex-col gap-0.5">
          <dt className={cn("text-caption", selected ? "text-cream-200/65" : "text-navy-600")}>
            {t("proofNeeded")}
          </dt>
          <dd className={cn("text-body-sm", selected ? "text-cream-100" : "text-navy-800")}>
            {proof}
          </dd>
        </div>
      </dl>

      {note ? (
        <p className={cn("text-caption", selected ? "text-cream-200/70" : "text-navy-600")}>
          {note}
        </p>
      ) : null}

      {/* The word, not only the mark. */}
      <p
        className={cn(
          "mt-auto flex items-center gap-2 text-[0.8125rem] font-medium",
          selected ? "text-cream-50" : "text-navy-600",
        )}
      >
        {selected ? t("selected") : t("chooseThis")}
      </p>
    </label>
  );
}
