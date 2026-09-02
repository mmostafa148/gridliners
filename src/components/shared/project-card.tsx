"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";

import { WinnerFrame, type MedalLevel } from "@/components/brand/brand-assets";
import { MedalBadge } from "@/components/shared/medal-badge";
import { StateChip } from "@/components/shared/state-chip";
import { Link } from "@/i18n/navigation";
import type { AwardLevel, Entry, SubCategory, Tier } from "@/lib/api/types";
import { groupName } from "@/lib/coordinates";
import { countryName } from "@/lib/display-names";
import { cn } from "@/lib/utils";

/**
 * Project card — public listings, the participant dashboard and results.
 *
 * Three decisions worth stating:
 *
 *  - The group sits at the top as the card's eyebrow, named in full, because it
 *    is the key of the result record rather than decoration: a medal only means
 *    something in a named group. It was `VI·02 / CORP` until the codes were
 *    retired (§1.3 `[map-update]`, 2026-08-25).
 *  - Entry-authored content is rendered as submitted and never translated
 *    (§3.8), so the title/description block carries its own `lang` and `dir`.
 *    An Arabic project reads correctly on an English page and vice versa.
 *  - Winning cards carry the pennant notch on their metal bar — the badge's own
 *    silhouette, reserved for surfaces where something is conferred.
 */

export type ProjectCardVariant = "public" | "dashboard" | "result";

const METAL_BAR: Record<string, string> = {
  gold: "bg-gold text-navy-900",
  silver: "bg-silver text-navy-900",
  bronze: "bg-bronze text-white",
  finalist: "bg-finalist text-white",
  honorary: "bg-honorary text-white",
  did_not_place: "bg-navy-100 text-navy-700",
};

export function ProjectCard({
  entry,
  subCategory,
  variant = "public",
  votes,
  participant,
  level,
  withheld,
  tier,
  href,
  className,
}: {
  entry: Entry;
  subCategory?: SubCategory;
  variant?: ProjectCardVariant;
  votes?: number;
  /**
   * The maker's name, resolved by the caller from `api.participants`.
   *
   * Passed in rather than fetched, because an entry holds a `participantId` and
   * a card is a view over one entry — the listing already has the roster.
   * Optional: the dashboard shows a participant their own work, where naming
   * them back to themselves says nothing.
   */
  participant?: string;
  level?: AwardLevel | "finalist" | "honorary";
  withheld?: boolean;
  tier?: Tier;
  href?: string;
  className?: string;
}) {
  const t = useTranslations("project");
  const tVote = useTranslations("vote");
  const tTier = useTranslations("tier");
  const format = useFormatter();

  const target =
    href ?? (variant === "dashboard" ? `/entries/${entry.id}` : `/projects/${entry.slug}`);
  const contentDir = entry.contentLanguage === "ar" ? "rtl" : "ltr";
  const effectiveTier = tier ?? entry.declaredTier;
  const locale = useLocale() as "en" | "ar";
  const coordinate = subCategory
    ? groupName(subCategory, locale, tTier(effectiveTier))
    : null;

  const isAwarded = Boolean(level) && level !== "did_not_place" && !withheld;
  // Metal levels have foil plates and winner frames; finalist and honorary do not.
  const isMedal =
    level === "gold" || level === "silver" || level === "bronze";

  return (
    <article
      className={cn(
        "group flex flex-col border border-border bg-card transition-colors",
        "hover:border-navy-400",
        className,
      )}
    >
      <Link href={target} className="block focus-visible:outline-none">
        {/* Real photography comes from the client. Until it lands, a winning
            card carries its Winner Frame — the brand's own award artwork —
            rather than a placeholder, and the frame is replaced by the cover
            image when one exists. */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-navy-900 p-6">
          {isMedal ? (
            <WinnerFrame
              level={level as MedalLevel}
              height={190}
              alt=""
              className="opacity-95"
            />
          ) : (
            <span
              className="font-display text-display-lg leading-none text-cream-200/25"
              aria-hidden
            >
              {subCategory ? subCategory.name[locale] : entry.country}
            </span>
          )}
          <span className="absolute top-4 start-5 font-display text-coord uppercase text-cream-200/50">
            {t("viewProject")}
          </span>
        </div>
      </Link>

      {/* Award bar: flat metal and the badge silhouette. The deck's foil plates
          are print artwork — on screen they read as a cheap gradient, so the
          metal stays flat and they are kept for the certificate. */}
      {level ? (
        <div
          className={cn(
            "flex items-center justify-center px-3 py-2",
            METAL_BAR[level],
            isAwarded && "notch-pennant",
            withheld && "opacity-60",
          )}
        >
          <MedalBadge level={level} withheld={withheld} bare />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4">
        {coordinate ? (
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-coord uppercase text-blue-700">{coordinate}</span>
            {typeof votes === "number" ? (
              <span className="font-data text-data-sm text-navy-600">
                <span className="sr-only">{tVote("votes", { count: votes })}</span>
                <span aria-hidden>{format.number(votes)}</span>
              </span>
            ) : null}
          </div>
        ) : null}

        <div lang={entry.contentLanguage} dir={contentDir} className="space-y-1.5">
          <h3 className="text-h4 leading-snug">
            <Link href={target} className="hover:underline">
              {entry.title}
            </Link>
          </h3>
          {/* Under the title, which is where the live winners page has carried
              the maker's name since 2023. Inside the entry's own `lang`/`dir`
              block with the title: a name is written in the same script as the
              work it belongs to, and reads wrong mirrored away from it. */}
          {participant ? (
            <p className="font-display text-coord uppercase text-navy-600">
              {t("by", { name: participant })}
            </p>
          ) : null}
          <p className="line-clamp-2 text-body-sm text-muted-foreground">{entry.description}</p>
        </div>

        {/* The readable sub-category name is deliberately absent: it belongs on
            the listing's group heading (winners and finalists are grouped by
            Sub-category × Tier), and repeating it here would make the
            coordinate above pure decoration. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          {/* navy-600, not navy-500. navy-500 measures 3.45:1 on white and
              3.37:1 on mist, both under AA for text at this size — the same
              defect corrected on the jury scorecards. */}
          <span className="font-display text-coord uppercase text-navy-600">
            {countryName(entry.country, locale)}
          </span>
          {variant === "dashboard" ? <StateChip state={entry.state} /> : null}
        </div>
      </div>
    </article>
  );
}
