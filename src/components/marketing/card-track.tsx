"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A horizontal track of cards.
 *
 * Scroll-snap rather than a transform slider: the browser then owns the motion,
 * so a touch drag carries its own momentum, a trackpad swipe works, the cards
 * stay in the tab order and nothing has to be re-implemented for RTL. Paging is
 * a smooth scrollBy of exactly one card, which is why the buttons and a swipe
 * land in the same places.
 *
 * The cards are rendered on the server and handed in as children. Only the
 * track and its controls are client code, which is why this is shared rather
 * than copied: the RTL scroll arithmetic and the end-state logic are the parts
 * worth having in one place.
 *
 * `tone` is the ground the controls sit on, not the track's own.
 */
export function CardTrack({
  children,
  heading,
  prevLabel,
  nextLabel,
  action,
  tone = "light",
}: {
  children: React.ReactNode;
  /** The section's own heading block, laid out opposite the controls. */
  heading?: React.ReactNode;
  prevLabel: string;
  nextLabel: string;
  /** The section's own link, sitting with the arrows. */
  action?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    // In RTL, scrollLeft runs from 0 down to -max, so distance from each end is
    // read off the absolute value rather than the sign.
    const travelled = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(travelled < 2);
    setAtEnd(travelled >= max - 2);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    // Re-check on resize: how many cards fit changes, and so does whether the
    // track can move at all.
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  const page = useCallback((direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card
      ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0")
      : el.clientWidth;
    const rtl = getComputedStyle(el).direction === "rtl";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      // ScrollToOptions names its axes left/top and has no logical equivalent;
      // the direction is handled by flipping the sign.
      left: (rtl ? -1 : 1) * direction * step, // rtl-ok: DOM API, mirrored above
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  const button = (dir: 1 | -1, label: string, disabled: boolean) => (
    <button
      type="button"
      onClick={() => page(dir)}
      aria-label={label}
      disabled={disabled}
      className={cn(
        // size-12, matching the cta button beside it: at size-11 the squares
        // sat 4px short of it and the control line had two heights.
        "flex size-12 items-center justify-center border transition-colors",
        tone === "dark"
          ? disabled
            ? "cursor-default border-cream-100/20 text-cream-100/25"
            : "border-cream-100/40 text-cream-100 hover:bg-cream-100 hover:text-navy-900"
          : disabled
            ? "cursor-default border-navy-900/15 text-navy-900/25"
            : "border-navy-900/40 text-navy-900 hover:bg-navy-900 hover:text-cream-100",
      )}
    >
      {dir === -1 ? (
        <ArrowLeft className="size-4 rtl:-scale-x-100" strokeWidth={2} aria-hidden />
      ) : (
        <ArrowRight className="size-4 rtl:-scale-x-100" strokeWidth={2} aria-hidden />
      )}
    </button>
  );

  return (
    <div>
      {/* The heading and the controls on one line. They are the section's two
          fixed points: what this is, and everything you can do with it. */}
      <div
        data-motion-heading
        className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
      >
        {heading}
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          {action}
          <div className="flex items-center gap-2">
            {button(-1, prevLabel, atStart)}
            {button(1, nextLabel, atEnd)}
          </div>
        </div>
      </div>

      <ul
        ref={track}
        data-motion-track
        className={cn(
          "mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-1",
          "motion-reduce:scroll-auto",
          // The scrollbar is replaced by the buttons and the snap points.
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {children}
      </ul>

    </div>
  );
}
