"use client";

import { useId } from "react";

import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Square flags, drawn rather than set as emoji.
 *
 * Emoji flags are rounded rectangles whose shape and palette are the platform's
 * to decide, and Windows ships no flag emoji font at all — a regional indicator
 * pair renders there as the bare letters "GB". Drawn, they are square like every
 * other mark in this identity, they are the same two colours on every machine,
 * and they cost no font.
 *
 * Worth knowing what these assert: a language is not a country. English has no
 * country here, and Arabic is the language of every entrant, so a flag beside it
 * names one of them. These are wayfinding for a two-item menu, not a claim about
 * who the programme is for — and both are one component to swap.
 */

/** Union Flag, square. */
function UnionFlag({ className }: { className?: string }) {
  const clip = useId();
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      {/* Four triangles, one per quadrant, alternating which side of the
          diagonal they take — this is what counterchanges the red saltire so it
          trails the white rather than sitting centred on it. */}
      <clipPath id={clip}>
        <path d="M30,30 h30 v30 z v30 h-30 z h-30 v-30 z v-30 h30 z" />
      </clipPath>
      <path fill="#00247d" d="M0 0h60v60H0z" />
      <path stroke="#fff" strokeWidth="12" d="M0,0 L60,60 M60,0 L0,60" />
      <path
        stroke="#cf142b"
        strokeWidth="8"
        clipPath={`url(#${clip})`}
        d="M0,0 L60,60 M60,0 L0,60"
      />
      <path stroke="#fff" strokeWidth="20" d="M30,0 v60 M0,30 h60" />
      <path stroke="#cf142b" strokeWidth="12" d="M30,0 v60 M0,30 h60" />
    </svg>
  );
}

/** Flag of the United Arab Emirates, square. */
function EmiratesFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <path fill="#00732f" d="M0 0h60v20H0z" />
      <path fill="#fff" d="M0 20h60v20H0z" />
      <path d="M0 40h60v20H0z" />
      {/* The hoist stays at the start of the box in both directions. A flag is
          an image of a thing, not a line of text, so it is not mirrored. */}
      <path fill="#f00" d="M0 0h15v60H0z" />
    </svg>
  );
}

const FLAGS: Record<Locale, (props: { className?: string }) => React.ReactElement> = {
  en: UnionFlag,
  ar: EmiratesFlag,
};

export function LocaleFlag({ locale, className }: { locale: Locale; className?: string }) {
  const Flag = FLAGS[locale];
  // The hairline is not decoration: both flags carry white to their own edge,
  // and on a white panel they would otherwise bleed into it and lose their shape.
  return <Flag className={cn("size-5 shrink-0 ring-1 ring-navy-900/20", className)} />;
}
