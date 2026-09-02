import { getTranslations } from "next-intl/server";

import { PartnerMark } from "@/components/brand/drawn-marks";
import type { Partner, PartnerTier } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Partners & Sponsors, as a logo grid.
 *
 * Separators only, no frame. The lines are the 1px gaps in the grid showing a
 * tinted ground through, which draws every interior rule exactly once and
 * nothing at all around the outside — a boxed-in grid reads as a table, and
 * these rules are meant to separate the marks rather than contain them. They sit
 * at 8% navy, faint enough to be structure rather than drawing.
 *
 * One uniform grid, no tier bands. Tier is carried by reading order and by a
 * light touch of scale: principals first and a shade larger, supporters last and
 * a shade smaller. Captioned bands said it a third time and turned one grid into
 * three.
 *
 * Short rows are padded out. That tinted ground is only meant to show as
 * hairlines, and a row the marks do not fill would show it as a block instead.
 * The three column counts leave three different remainders, so the fillers are
 * computed per breakpoint and each hides itself in the layouts that came out
 * even.
 *
 * ── The marks ──────────────────────────────────────────────────────────────
 *
 * Navy at rest, the partner's real artwork under the cursor. A grid that lets
 * fourteen logos each keep their own colour is a grid of arguments, so it takes
 * one ink and lets the pointer ask for the exception. Neither state alters the
 * file.
 *
 * The ink is a mask rather than a filter because the set is mixed: a filter
 * chain that lands on navy from Adobe's red does not land on navy from a black
 * SVG or a transparent PNG. A mask ignores colour and reads only alpha, so
 * anything resolves to the same navy.
 *
 * Marks are scaled against a shared cap height rather than fitted to their
 * cells. Bounding boxes are what make a logo grid look uneven: a wordmark capped
 * at the same height as a bare symbol carries several times the ink, so the
 * symbol reads small and the wordmark shouts. Partner.logoScale is the per-mark
 * correction and it is set by eye, because there is no other way to set it.
 */

/** Columns at each breakpoint, and the tier order the grid reads in. */
const COLS = { base: 2, sm: 3, lg: 5 } as const;
const TIER_ORDER: PartnerTier[] = ["principal", "partner", "supporter"];

/** Cap height in px before Partner.logoScale, and the tier's share of it. */
const CAP = 44;
const TIER_CAP: Record<PartnerTier, number> = {
  principal: 1.15,
  partner: 1,
  supporter: 0.9,
};

/** Static, because Tailwind reads class names it can see and not ones we build. */
const SHOW = { base: "", sm: "sm:block", lg: "lg:block" };
const HIDE = { base: "hidden", sm: "sm:hidden", lg: "lg:hidden" };

function Mark({ partner }: { partner: Partner }) {
  const height = Math.round(CAP * TIER_CAP[partner.tier] * (partner.logoScale ?? 1));

  if (!partner.logoUrl) {
    return (
      <PartnerMark
        name={partner.name}
        seed={partner.id.length * 977 + partner.name.charCodeAt(0)}
        className={cn(
          "h-auto w-full max-w-[11rem] grayscale",
          "opacity-75 transition-[filter,opacity] duration-300",
          "group-hover:grayscale-0 group-hover:opacity-100",
          "group-focus-visible:grayscale-0 group-focus-visible:opacity-100",
        )}
      />
    );
  }

  return (
    // relative, because the masked layer is positioned against this box — an
    // absolute child with no positioned ancestor escapes the nearest clip and
    // can drag the page sideways.
    <span className="relative block max-w-full">
      <span
        aria-hidden
        style={{
          maskImage: `url("${partner.logoUrl}")`,
          WebkitMaskImage: `url("${partner.logoUrl}")`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
        className={cn(
          "absolute inset-0 bg-navy-900 opacity-80 transition-opacity duration-300",
          "group-hover:opacity-0 group-focus-visible:opacity-0",
        )}
      />
      {/* Carries the accessible name and, at zero opacity, the box the masked
          layer above is measured from — only the file knows its proportion. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partner.logoUrl}
        alt={partner.name}
        loading="lazy"
        decoding="async"
        style={{ height }}
        className={cn(
          "block w-auto max-w-full object-contain opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
        )}
      />
    </span>
  );
}

export async function PartnersStrip({ partners }: { partners: Partner[] }) {
  const t = await getTranslations("home.partners");
  if (!partners.length) return null;

  const ordered = TIER_ORDER.flatMap((tier) => partners.filter((p) => p.tier === tier));

  // How many cells each layout leaves empty in its last row. One filler per
  // missing cell, each visible only in the layouts that are actually short.
  const gaps = {
    base: (COLS.base - (ordered.length % COLS.base)) % COLS.base,
    sm: (COLS.sm - (ordered.length % COLS.sm)) % COLS.sm,
    lg: (COLS.lg - (ordered.length % COLS.lg)) % COLS.lg,
  };
  const fillers = Math.max(gaps.base, gaps.sm, gaps.lg);

  return (
    <section className="bg-white text-navy-900">
      <div className="page-shell section-y">
        <div className="max-w-2xl">
          <h2 className="text-h1">{t("title")}</h2>
          <p className="mt-4 text-body-md text-navy-600">{t("description")}</p>
        </div>

        {/* gap-px over a tinted ground: the gaps are the rules. No border, so
            the grid has separators and no frame. */}
        <div className="mt-14 grid grid-cols-2 gap-px bg-navy-900/[0.08] sm:grid-cols-3 lg:grid-cols-5">
          {ordered.map((partner) => (
            <a
              key={partner.id}
              href={partner.url}
              target="_blank"
              rel="noreferrer noopener"
              className={cn(
                "group flex min-h-[8.5rem] items-center justify-center bg-white p-5",
                "sm:min-h-[9.5rem] sm:p-7",
                "outline-none transition-colors duration-300",
                "hover:bg-navy-900/[0.02] focus-visible:bg-navy-900/[0.02]",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy-900",
              )}
            >
              <Mark partner={partner} />
            </a>
          ))}

          {Array.from({ length: fillers }, (_, i) => (
            <div
              key={`filler-${i}`}
              aria-hidden
              className={cn(
                "bg-white",
                i < gaps.base ? SHOW.base : HIDE.base,
                i < gaps.sm ? SHOW.sm : HIDE.sm,
                i < gaps.lg ? SHOW.lg : HIDE.lg,
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
