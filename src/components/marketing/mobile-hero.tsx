"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The hero, on a phone.
 *
 * A separate composition rather than the desktop hero bent into shape. That one
 * is a scrubbed ScrollTrigger over a 240vh runway: it pins a stage, flies the
 * dotted mark into the navigation rail and hands the screen over to the
 * photography — choreography that wants room and a pointer. On a 390 screen it
 * spent a screen and a half of scrolling arriving somewhere a swipe reaches at
 * once, and the rail sat at the foot of the window for the whole of it.
 *
 * So on a phone the mark is simply the first frame of the slider. Four panels,
 * swiped or tapped: the identity, then the three photographs.
 *
 * Scroll-snap rather than a transform track. The browser owns the motion, so a
 * drag carries its own momentum and rubber-bands at the ends, the panels stay in
 * the tab order, and RTL needs no second implementation. The active panel is
 * read back off scroll position rather than tracked alongside it, so a swipe and
 * a tap can never disagree about which one is showing.
 *
 * The copy is one fixed layer over the track, not a block inside each panel.
 * Two panels share the cycle's copy — the mark and the frame it dissolves into,
 * which is exactly the pair the desktop sequence treats as one beat — and copy
 * that travelled with the panels would slide that shared block out and an
 * identical one in.
 *
 * Bottom, and flush to the start edge: the thumb is at the foot of a phone and
 * the eye starts at the edge. The desktop hero centres its copy and is left
 * alone.
 */
export function MobileHero({
  className,
  panels,
  copies,
}: {
  className?: string;
  /** `copy` indexes into `copies`; repeat an index to hold a block across panels. */
  panels: { art: React.ReactNode; copy: number }[];
  copies: React.ReactNode[];
}) {
  // The controls read the same namespace the desktop slider's do, so the two
  // sets of arrows are never labelled differently.
  const t = useTranslations("home.slider");
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  // Read the panel back off the scroll offset. Under dir=rtl scrollLeft runs
  // from 0 down to -max, so the distance travelled is its magnitude.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const sync = () =>
      setIndex(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
    el.addEventListener("scroll", sync, { passive: true });
    return () => el.removeEventListener("scroll", sync);
  }, []);

  const goTo = useCallback((n: number) => {
    const el = track.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollTo({
      // ScrollToOptions names its axis `left` and has no logical form; the
      // mirroring is the sign, above.
      left: (rtl ? -1 : 1) * n * el.clientWidth, // rtl-ok: DOM API, mirrored above
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  const active = panels[index]?.copy ?? 0;

  return (
    <section
      data-mobile-hero
      className={cn(
        "relative h-dvh overflow-hidden bg-navy-900 text-cream-100",
        className,
      )}
    >
      <ul
        ref={track}
        className={cn(
          "flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain",
          // The scrollbar is furniture on a desktop browser narrow enough to
          // hit this breakpoint, and it would sit across the bottom of the art.
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {panels.map((panel, i) => (
          <li
            key={i}
            className="relative h-full w-full shrink-0 snap-center snap-always"
            aria-hidden={i !== index}
          >
            {panel.art}
          </li>
        ))}
      </ul>

      {/* The copy needs a ground on a photograph and none on the dot field, and
          a gradient is the one treatment that is both. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-navy-950 via-navy-950/85 to-transparent"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-7">
        <div className="relative">
          {copies.map((copy, i) => (
            <div
              key={i}
              data-hero-copy
              // Stacked rather than swapped, so the block that is arriving is
              // measured in the same place the one leaving occupied and the
              // controls below never move.
              className={cn(
                "flex flex-col items-start gap-5 text-start transition-opacity duration-500",
                i === active
                  ? "pointer-events-auto relative opacity-100"
                  : "pointer-events-none absolute inset-x-0 bottom-0 opacity-0",
              )}
              aria-hidden={i !== active}
              // A block at opacity 0 is still focusable, and tabbing into copy
              // that is not on screen is how a keyboard user gets lost here.
              inert={i !== active}
            >
              {copy}
            </div>
          ))}
        </div>

        <div className="pointer-events-auto mt-7 flex items-center justify-between">
          <ul className="flex items-center gap-2">
            {panels.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={t("goTo", { n: i + 1 })}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    // A tap target the size of the dot would be 10px; the box
                    // is 40 and the dot is drawn inside it.
                    "grid size-10 place-items-center",
                    "before:block before:size-2.5 before:transition-colors before:content-['']",
                    i === index
                      ? "before:bg-gold"
                      : "before:bg-cream-100/35",
                  )}
                />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {[
              { d: -1, label: "previous", Icon: ChevronLeft },
              { d: 1, label: "next", Icon: ChevronRight },
            ].map(({ d, label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  goTo(Math.min(panels.length - 1, Math.max(0, index + d)))
                }
                aria-label={t(label)}
                className={cn(
                  "grid size-10 place-items-center border border-cream-100/25 text-cream-100",
                  "bg-navy-950/60 backdrop-blur-md transition-colors",
                  "active:bg-cream-100 active:text-navy-900",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                )}
              >
                <Icon className="size-4 rtl:-scale-x-100" strokeWidth={2} aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
