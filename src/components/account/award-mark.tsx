import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The award itself, in the brand's own ribbon.
 *
 * **Why this is drawn rather than dropped in.** `resources/brand/` ships
 * `badge-gold|silver|bronze|blue|black.svg`, and every one of them has the year
 * **2026 baked into the artwork**. Qamar Studio's Gold is 2025 and the Maritime
 * Museum's is 2024, so placing the shipped file beside either award would state
 * a false year on the participant's own record. Logged in build-state §49 for
 * the brand team.
 *
 * What is drawn is the same artefact: the ribbon silhouette, the metal fill,
 * the reversed mark, and the year the award was actually given. The mark is the
 * production `logo-icon-reversed.svg` — never recoloured, only placed.
 *
 * `MedalBadge` stays what it is: the public listings' caption. This is the
 * award, on the one screen whose subject is the award.
 */
const METAL: Record<string, string> = {
  gold: "bg-gold",
  silver: "bg-silver",
  bronze: "bg-bronze",
  finalist: "bg-blue-700",
  honorary: "bg-[#111111]",
};

/** The brand ribbon: a rectangle notched from below. */
const RIBBON = "polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)";

/**
 * Gold measures 2.2:1 and silver 2.6:1 against white, so neither may carry
 * white type. Both take the navy the certificate uses; the dark metals take
 * the cream.
 */
const INK: Record<string, string> = {
  gold: "text-navy-950",
  silver: "text-navy-950",
  bronze: "text-white",
  finalist: "text-white",
  honorary: "text-white",
};

export function AwardMark({
  level,
  year,
  size = "lg",
  className,
}: {
  level: "gold" | "silver" | "bronze" | "finalist" | "honorary";
  /** The year this award was given. Omitted only where there is no cycle. */
  year?: number;
  size?: "xs" | "sm" | "lg";
  className?: string;
}) {
  const px = size === "lg" ? 60 : 26;
  return (
    <span
      aria-hidden
      style={{ clipPath: RIBBON }}
      className={cn(
        "flex shrink-0 flex-col items-center",
        METAL[level],
        size === "lg"
          ? "w-[5.5rem] gap-3 px-4 pb-9 pt-6"
          : size === "sm"
            ? "w-11 gap-1.5 px-2 pb-4 pt-2.5"
            : "w-8 gap-1 px-1.5 pb-3 pt-2",
        className,
      )}
    >
      <Image
        src="/brand/logo-icon-reversed.svg"
        alt=""
        width={px}
        height={px}
        className={size === "lg" ? "size-13" : size === "sm" ? "size-6" : "size-4"}
      />
      {year ? (
        <span
          className={cn(
            "font-display leading-none",
            INK[level],
            size === "lg" ? "text-[1.0625rem]" : size === "sm" ? "text-[0.6875rem]" : "text-[0.5625rem]",
          )}
        >
          {year}
        </span>
      ) : null}
    </span>
  );
}
