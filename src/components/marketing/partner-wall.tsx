import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { PartnerMark } from "@/components/brand/drawn-marks";
import type { Partner } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The logo wall.
 *
 * **Every mark is shown at one weight.** The client asked for equal treatment
 * and it is the right call anyway: a wall that scales its logos by what each
 * partner paid is a medal table wearing a different hat, and it tells a visitor
 * something about invoices rather than about the programme.
 *
 * **The cell is fixed and the mark is contained inside it.** Normalising logos
 * by their bounding box is the thing that makes a wall look uneven - a wordmark
 * capped at the same height as a bare symbol carries far more ink - so each
 * mark sits in an identical cell with generous padding and its own optical
 * scale, which is set by eye and only by eye.
 *
 * Marks the client has not supplied are **drawn**, not typeset into an empty
 * box: a wall of name-in-a-rectangle placeholders is not a logo wall.
 *
 * **The wall closes its last row.** The grid draws its rules as a `gap-px` over
 * a tinted ground, so a short final row left that ground showing as a grey slab
 * with two logos stranded beside it - a hole, not a wall. The remainder is
 * filled instead, and because the count depends on the column count the fillers
 * are switched per breakpoint rather than guessed at one width.
 */

/** How many cells a row of `cols` is short, given `n` marks. */
function remainder(n: number, cols: number) {
  return (cols - (n % cols)) % cols;
}
export async function PartnerWall({ partners }: { partners: Partner[] }) {
  const t = await getTranslations("partners");
  // One per column count the grid actually uses: 2, then 3, then 4.
  const [need2, need3, need4] = [2, 3, 4].map((cols) => remainder(partners.length, cols));

  return (
    <ul className="grid grid-cols-2 gap-px border border-navy-900/12 bg-navy-900/12 sm:grid-cols-3 lg:grid-cols-4">
      {partners.map((partner) => (
        <li key={partner.id} className="bg-white">
          <a
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("visit", { name: partner.name })}
            className="group flex h-40 flex-col items-center justify-center gap-3 px-6 transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700 lg:h-44"
          >
            <span className="flex h-16 w-full items-center justify-center">
              {partner.logoUrl ? (
                <Image
                  src={partner.logoUrl}
                  alt=""
                  width={180}
                  height={60}
                  style={{ transform: `scale(${partner.logoScale ?? 1})` }}
                  className="max-h-14 w-auto max-w-[11rem] object-contain opacity-85 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <PartnerMark
                  name={partner.name}
                  seed={partner.id.length * 977 + partner.name.charCodeAt(0)}
                  className="h-12 w-auto max-w-[12rem] text-navy-900 opacity-85 transition-opacity group-hover:opacity-100"
                />
              )}
            </span>
            {/* Named as text as well as drawn: a logo is not an accessible name,
                and a reader who does not recognise a mark still needs to know
                whose it is. */}
            <span className="text-center font-display text-coord uppercase text-navy-600">
              {partner.name}
            </span>
          </a>
        </li>
      ))}

      {/* Blank cells, sharing the tiles' ground so the wall stays a rectangle.
          `aria-hidden` and empty: there is nothing here to announce. */}
      {Array.from({ length: Math.max(need2, need3, need4) }, (_, i) => (
        <li
          key={`fill-${i}`}
          aria-hidden
          className={cn(
            "bg-white",
            i < need2 ? "block" : "hidden",
            i < need3 ? "sm:block" : "sm:hidden",
            i < need4 ? "lg:block" : "lg:hidden",
          )}
        />
      ))}
    </ul>
  );
}
