"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The hero's foot: a readout of where the cycle currently stands.
 *
 * It replaces a two-column grid whose halves flew to opposite edges. On a wide
 * monitor that left a chasm of empty navy between a clock and four figures, and
 * gave the clock and the figures identical weight — a live deadline reading no
 * more urgently than the number of jurors.
 *
 * Three things fix that:
 *
 * The two groups each take half the width and distribute their own cells, so
 * eight cells sit on one even rhythm at any width instead of clumping at the
 * ends. Hairlines between them make the rhythm visible; the group boundary is
 * drawn a step heavier.
 *
 * And a gauge runs the full bleed of the band, filled to however much of the
 * current window has already gone. "Thirteen days" alone never says whether
 * that is most of the window or the last of it; the fill does, and it earns the
 * width the old layout was wasting.
 */

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// One figure size across the whole band. Setting the clock larger than the
// facts was meant as hierarchy, but the eight cells share a single row and a
// single rhythm, so the two sizes read as an inconsistency instead — and the
// smaller figures sat off the clock's baseline. An instrument cluster reads all
// its dials at one size; the labels say which is which.
//
// The size is set here rather than taken from the scale because the scale has a
// gap exactly where this band wants to sit: data-lg tops out at 48px, which is
// display weight for a strip at the foot of the screen, and the next step down
// is 20px, which is caption weight. This clamp lands between them and, unlike
// data-lg, barely grows on a wide monitor — the band should stay a readout, not
// become a headline, when the screen gets bigger.
const FIGURE =
  "font-data text-[clamp(1.25rem,1.35vw,1.75rem)] font-bold leading-none tracking-[-0.01em] text-cream-100";
const LABEL =
  // A quarter of a 390px viewport leaves 75px for a label, and the longest one
  // here wants 114 at the desktop size. It is set to the width of the word it
  // breaks to — "CATEGORIES", 73px at this size — so the second line lands
  // inside its own column instead of across the rule into the next one.
  // "SUB-CATEGORIES" still takes two lines there, which no size fixes: one line
  // would need 6.6px type. The alpha is lifted to carry the smaller size.
  "font-display text-[0.5625rem] uppercase leading-[1.35] tracking-[0.04em] text-cream-200/70 sm:text-coord sm:leading-none sm:text-cream-200/60";

/** The opening cell of a group has nothing to its start side to rule off from. */
type Lead = "none" | undefined;

function rule(lead: Lead) {
  return lead === "none" ? "ps-0" : "border-s border-cream-100/12 ps-3 sm:ps-4";
}

function ClockCell({ value, label, lead }: { value: string; label: string; lead?: Lead }) {
  return (
    <div className={cn("flex flex-col gap-1.5", rule(lead))}>
      <span className={FIGURE}>{value}</span>
      <span className={LABEL}>{label}</span>
    </div>
  );
}

function StatCell({ value, label, lead }: { value: string; label: string; lead?: Lead }) {
  // Label before figure in the DOM so the pair is a valid term/definition, then
  // reversed visually so the number still reads first.
  return (
    // justify-end packs to the top here: in a reversed column the main-axis end
    // is the top edge. Without it the cells pack upward from the bottom, and a
    // label that wraps to two lines lifts its own figure off the row.
    <div className={cn("flex flex-col-reverse justify-end gap-1.5", rule(lead))}>
      <dt className={LABEL}>{label}</dt>
      <dd className={FIGURE}>{value}</dd>
    </div>
  );
}

export function CycleReadout({
  target,
  since,
  label,
  stats,
}: {
  /** ISO instant the cycle is counting down to. */
  target: string | null;
  /** ISO instant the current window opened, for the gauge. */
  since: string | null;
  /** Lead-in for the clock, e.g. "Voting closes in". */
  label: string | null;
  stats: { value: number; labelKey: string }[];
}) {
  const t = useTranslations("countdown");
  const tStats = useTranslations("home.stats");
  const [now, setNow] = useState<number | null>(null);

  // Nothing time-dependent is rendered until after mount. A server-computed
  // "time remaining" would differ from the client's by the length of the
  // request and mismatch on hydration, every time.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const targetMs = target ? Date.parse(target) : null;
  const sinceMs = since ? Date.parse(since) : null;
  const remaining = now !== null && targetMs !== null ? targetMs - now : null;
  const ended = remaining !== null && remaining <= 0;
  const value = remaining !== null ? parts(remaining) : null;

  const span = targetMs !== null && sinceMs !== null ? targetMs - sinceMs : 0;
  const elapsed =
    now !== null && sinceMs !== null && span > 0
      ? Math.min(100, Math.max(0, ((now - sinceMs) / span) * 100))
      : 0;

  const units = [
    { key: "days", value: value?.days },
    { key: "hours", value: value?.hours },
    { key: "minutes", value: value?.minutes },
    { key: "seconds", value: value?.seconds },
  ] as const;

  return (
    // Glass rather than an opaque band: the key art runs on behind it, and
    // letting it through blurred keeps the hero one picture instead of a
    // picture with a panel bolted to the bottom. The tint is navy-950 rather
    // than the surrounding navy-900 so the figures keep their contrast whatever
    // the frame happens to be doing back there.
    //
    // Below md the band is not on the art at all — the phone hero is a swipe
    // track and the numbers follow it down the page — so there is nothing back
    // there but the white body, and glass over white came out a flat grey with
    // cream figures on it. There it is simply solid.
    <div className="relative z-10 bg-navy-950 backdrop-blur-2xl md:bg-navy-950/42">
      {/* The gauge doubles as the band's top rule, so it costs no extra height. */}
      <div
        className="relative h-px w-full bg-cream-100/12"
        role="progressbar"
        aria-valuenow={Math.round(elapsed)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("windowElapsed")}
      >
        <div
          className="absolute inset-y-0 start-0 bg-gold transition-[inline-size] duration-1000 ease-linear"
          style={{ inlineSize: `${elapsed}%` }}
        >
          {/* A brighter cap on the leading edge, so the fill reads as a
              position on the window rather than a coloured stripe. */}
          <span className="absolute inset-y-0 end-0 w-2 bg-cream-100" aria-hidden />
        </div>
      </div>

      <div className="page-shell flex flex-col gap-7 py-7 lg:flex-row lg:gap-0">
        {target ? (
          <section className="flex flex-1 flex-col gap-3.5">
            <span className="font-display text-coord uppercase text-cream-200/70">{label}</span>
            {ended ? (
              <span className={FIGURE}>{t("ended")}</span>
            ) : (
              <div className="grid grid-cols-4" role="timer" aria-live="off">
                {units.map((unit, i) => (
                  <ClockCell
                    key={unit.key}
                    lead={i === 0 ? "none" : undefined}
                    // Undefined until mounted, so SSR and first paint agree.
                    value={unit.value === undefined ? "––" : String(unit.value).padStart(2, "0")}
                    label={t(unit.key)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section
          className={cn(
            "flex flex-1 flex-col gap-3.5",
            // The seam between the two groups, a step heavier than the rules
            // inside them. Only once there is a seam to draw: stacked, the
            // groups are already separated by the row break.
            target && "lg:border-s lg:border-cream-100/25 lg:ps-10",
          )}
        >
          <span className="font-display text-coord uppercase text-cream-200/70">
            {tStats("heading")}
          </span>
          {/* Four up at every width, like the clock above it. Two up on a
              phone put the same eight cells on two rhythms in one band — a
              four-column clock over a two-column grid — and the band's whole
              job is to read as one instrument.
              The phone's columns are not equal, because these labels are not
              the clock's. DAYS/HOURS/MINUTES/SECONDS all fit a quarter of a
              390px screen; SUB-CATEGORIES wants 118px of one, and no legible
              size gets it under 88 — one line would need 6.6px type, and at 9px
              it broke at its own hyphen and put CATEGORIES across the rule into
              JURORS.
              So on a phone each column takes the width of what is in it and the
              slack is shared out between them: the three short labels lend the
              long one what they are not using. Content-sized rather than a
              hand-tuned ratio, because the ratio would be tuned to the English
              labels — Arabic's are half the length and would sit in columns
              built for words they do not have. minmax lets a track shrink under
              its content on a screen narrower than any of these, where the long
              label wraps again rather than overflowing.
              Equal columns return at sm, where every label fits one line. */}
          <dl
            data-stat-grid
            className="grid grid-cols-[repeat(4,minmax(0,auto))] justify-between sm:grid-cols-4 sm:justify-normal"
          >
            {stats.map((stat, i) => (
              <StatCell
                key={stat.labelKey}
                lead={i === 0 ? "none" : undefined}
                value={String(stat.value)}
                label={tStats(stat.labelKey)}
              />
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
