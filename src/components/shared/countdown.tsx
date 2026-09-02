"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Countdown to a cycle deadline.
 *
 * Hydration-safe: the server renders nothing but the placeholder, and the
 * live clock starts after mount. Rendering a server-computed "time remaining"
 * would guarantee a mismatch, because the two clocks differ by the request.
 */

function parts(msRemaining: number) {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function Countdown({
  target,
  label,
  tone = "paper",
  size = "default",
  className,
}: {
  /** ISO timestamp to count down to. */
  target: string;
  /** Optional lead-in, e.g. "Voting ends in". */
  label?: string;
  /** `ceremonial` for navy surfaces, where muted-foreground is invisible. */
  tone?: "paper" | "ceremonial";
  /** `hero` sets the figures at display scale; `inline` matches the data
   * figures it sits beside. */
  size?: "default" | "hero" | "inline";
  className?: string;
}) {
  const t = useTranslations("countdown");
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const targetMs = Date.parse(target);
    const tick = () => setRemaining(targetMs - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const value = remaining === null ? null : parts(remaining);
  const ended = remaining !== null && remaining <= 0;

  const units = [
    { key: "days", value: value?.days },
    { key: "hours", value: value?.hours },
    { key: "minutes", value: value?.minutes },
    { key: "seconds", value: value?.seconds },
  ] as const;

  const ceremonial = tone === "ceremonial";
  const hero = size === "hero";
  const inline = size === "inline";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label ? (
        <span
          className={cn(
            "font-display text-coord uppercase",
            ceremonial ? "text-cream-200/70" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      ) : null}

      {ended ? (
        <span className={cn("font-display text-data-lg", ceremonial && "text-cream-100")}>
          {t("ended")}
        </span>
      ) : (
        <div
          className={cn(
            // A grid, not a flex row: at 390px the four units overflowed and
            // clipped the last label.
            "grid w-fit grid-cols-4 items-start",
            hero ? "gap-x-6 sm:gap-x-10" : inline ? "gap-x-7 sm:gap-x-9" : "gap-x-3 sm:gap-x-4",
          )}
          role="timer"
          aria-live="off"
        >
          {units.map((unit) => (
            <div
              key={unit.key}
              className={cn("flex flex-col", hero ? "gap-1.5" : "gap-1")}
            >
              <span
                className={cn(
                  "font-data",
                  hero ? "text-display-lg leading-none" : inline ? "text-data-md" : "text-data-lg",
                  ceremonial && "text-cream-100",
                )}
              >
                {/* null until mounted, so SSR and the first client paint agree */}
                {unit.value === undefined ? "––" : String(unit.value).padStart(2, "0")}
              </span>
              {/* "SECONDS" at coordinate tracking is wider than a quarter of a
                  390px viewport, so the wide tracking is dropped at mobile and
                  restored once there is room for it. */}
              <span
                className={cn(
                  "font-display text-[0.625rem] uppercase leading-none tracking-[0.02em]",
                  "sm:text-coord",
                  // /75, not /60. The ceremonial tone was written for navy,
                  // where /60 is comfortable; on the identity's blue it
                  // measured 4.04:1, which is under AA for text this size.
                  // /75 clears it on both and costs the navy nothing.
                  ceremonial ? "text-cream-200/75" : "text-muted-foreground",
                )}
              >
                {t(unit.key)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
