"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { TABLE_CELL, TABLE_ROW } from "@/components/account/system";
import { cn } from "@/lib/utils";

/**
 * One payment, with its frozen quote folded underneath.
 *
 * **The disclosure is a row, not a link inside a cell.** `Show the pricing` used
 * to sit in the description cell, which gave every row a third line and made
 * the table's rhythm depend on how long an entry's title was. A chevron in its
 * own column keeps every row one line tall, and the snapshot opens as a
 * full-width row beneath — which is where a detail about a row belongs, and
 * gives the quote the whole measure instead of a third of it.
 *
 * `SnapshotDetails` is an async server component, so it is rendered on the
 * server and passed in as `children`; this holds nothing but the open state.
 */
export function PaymentRow({
  cells,
  snapshot,
  columns,
  edgeEnd,
}: {
  /** The row's own cells, already rendered. */
  cells: React.ReactNode;
  /** The frozen quote, server-rendered. */
  snapshot: React.ReactNode;
  /** How many columns the expanded row must span. */
  columns: number;
  edgeEnd: string;
}) {
  const t = useTranslations("billing");
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <>
      <tr className={cn(TABLE_ROW, open && "bg-mist")}>
        {cells}
        <td className={cn(TABLE_CELL, edgeEnd, "text-end")}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={id}
            className={cn(
              "inline-flex size-8 items-center justify-center border border-transparent text-navy-600",
              "transition-colors hover:border-navy-900/20 hover:bg-white hover:text-navy-900",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
            )}
          >
            <span className="sr-only">{open ? t("hideSnapshot") : t("showSnapshot")}</span>
            <ChevronDown
              aria-hidden
              strokeWidth={2}
              className={cn(
                "size-4 transition-transform duration-150 motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </button>
        </td>
      </tr>
      {open ? (
        /* A distinct ground, so an open quote is visibly not another payment
           row — and two open at once do not run together. */
        <tr id={id} className="border-b border-navy-900/12 bg-mist">
          <td colSpan={columns} className="px-5 py-5 sm:px-7">
            {snapshot}
          </td>
        </tr>
      ) : null}
    </>
  );
}
