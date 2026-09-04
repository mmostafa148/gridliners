"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * The six steps of a submission, named.
 *
 * **Rebuilt after §49.** It was six numbers sitting over a rule — a progress
 * bar wearing a wizard's clothes. A participant preparing an entry needs to
 * know what is still ahead of them, and "04" does not say "Assets".
 *
 * Each step carries its number *and* its name, and the three states are
 * distinguishable without colour: a **completed** step has a tick and is
 * clickable, the **current** one is filled navy, and a **future** one is quiet
 * and disabled. On a phone six names do not fit, so it becomes the current step
 * named, with the count and a rule showing how far along it is.
 */
export function WizardProgress({
  step,
  furthest,
  onGo,
}: {
  step: number;
  /** The furthest step reached; anything up to it may be revisited. */
  furthest: number;
  onGo: (step: number) => void;
}) {
  const t = useTranslations("wizard");
  const steps = [1, 2, 3, 4, 5, 6];

  return (
    <div>
      {/* Desktop: all six, named. */}
      <ol className="hidden gap-px border border-navy-900/10 bg-navy-900/10 p-1 md:flex">
        {steps.map((n) => {
          const done = n < furthest || (n < step && n <= furthest);
          const current = n === step;
          const reachable = n <= furthest;
          return (
            <li key={n} className="relative min-w-0 flex-1">
              {current ? (
                <span aria-hidden className="absolute inset-x-0 top-0 z-10 flex h-1">
                  <span className="w-3/4 bg-blue-700" />
                  <span className="flex-1 bg-gold" />
                </span>
              ) : null}
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onGo(n)}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex min-h-16 w-full flex-col justify-center gap-1.5 px-3 py-3 text-start transition-colors",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700",
                  current && "bg-navy-900 text-cream-50",
                  !current && done && "bg-white text-navy-900 hover:bg-blue-700/6",
                  !current && !done && "bg-white/75 text-navy-600",
                  !reachable && "cursor-not-allowed",
                )}
              >
                <span className="flex items-center gap-2">
                  {done && !current ? (
                    <Check aria-hidden className="size-3.5 shrink-0 text-blue-700" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        "font-data text-[0.75rem] tabular-nums",
                        current ? "text-cream-200/70" : "text-navy-500",
                      )}
                    >
                      {String(n).padStart(2, "0")}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "truncate text-[0.875rem] font-medium",
                    current ? "text-cream-50" : done ? "text-navy-900" : "text-navy-600",
                  )}
                >
                  {t(`step.${n}`)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Phone: the current step named, with how far along it is. */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-body-lg font-medium text-navy-900">{t(`step.${step}`)}</p>
          <p className="shrink-0 font-data text-[0.8125rem] tabular-nums text-navy-600">
            {t("stepOf", { step, total: 6 })}
          </p>
        </div>
        <ol className="mt-3 flex gap-1" aria-label={t("stepOf", { step, total: 6 })}>
          {steps.map((n) => (
            <li
              key={n}
              aria-current={n === step ? "step" : undefined}
              className={cn(
                "h-1 flex-1",
                n < step ? "bg-blue-700" : n === step ? "bg-navy-900" : "bg-navy-900/15",
              )}
            >
              <span className="sr-only">{t(`step.${n}`)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
