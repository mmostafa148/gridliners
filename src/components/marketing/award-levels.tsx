import { getTranslations } from "next-intl/server";

import { AwardBadge } from "@/components/brand/brand-assets";
import { SectionHeading } from "@/components/marketing/section-heading";
import { api } from "@/lib/api";
import { TIERS } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The three medal levels as one ranking plate.
 *
 * Full-bleed metal bands made three short definitions feel like the page's
 * main event and isolated every badge in a separate navy rail. The hierarchy
 * stays explicit here, but the metals return to accents: one quiet plate,
 * three comparable rows, and each badge inside the row it belongs to.
 */

const LEVELS = [
  { level: "gold", rank: "01", accent: "bg-gold" },
  { level: "silver", rank: "02", accent: "bg-silver" },
  { level: "bronze", rank: "03", accent: "bg-bronze" },
] as const;

export async function AwardLevels() {
  const [t, subCategories] = await Promise.all([
    getTranslations("home.awards"),
    api.taxonomy.subCategories(),
  ]);

  const subs = subCategories.length;
  const groups = subs * TIERS.length;

  return (
    <section className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        <div className="max-w-3xl">
          <SectionHeading title={t("title")} description={t("description")} />
        </div>

        {/* One comparison surface, not three unrelated colour fields. The
            repeated columns make the levels readable in one scan, while each
            metal remains a semantic accent. */}
        <ol className="mt-12 border border-navy-900/15 bg-white lg:mt-16">
          {LEVELS.map(({ level, rank, accent }) => (
            <li
              key={level}
              className={cn(
                "relative grid grid-cols-[auto_1fr_auto] gap-x-5 gap-y-2 px-6 py-7",
                "border-b border-navy-900/15 last:border-b-0 sm:px-8",
                "md:grid-cols-[4rem_minmax(9rem,0.65fr)_minmax(16rem,1fr)_4.5rem] md:items-center md:gap-x-8",
                "lg:px-10 lg:py-8",
              )}
            >
              <span
                aria-hidden
                className={cn("absolute inset-y-0 start-0 w-1.5", accent)}
              />

              {/* Decorative coordinate; the heading says the level in words. */}
              <span
                aria-hidden
                className="font-data text-[clamp(1.5rem,2.2vw,2rem)] leading-none tabular-nums text-navy-500"
              >
                {rank}
              </span>

              <h3 className="text-h2 uppercase leading-none text-navy-950">
                {t(`${level}.name`)}
              </h3>

              <p className="col-start-2 max-w-[36rem] text-body-md text-navy-600 md:col-start-auto">
                {t(`${level}.body`)}
              </p>

              {/* The artwork now sits on a neutral surface, so it no longer
                  needs a separate navy cap to remain visible. */}
              <AwardBadge
                colorway={level}
                height={78}
                alt=""
                className="col-start-3 row-span-2 row-start-1 self-center justify-self-end md:col-start-auto md:row-span-1 md:row-start-auto"
              />
            </li>
          ))}
        </ol>

        {/* The count is useful context, but it is supporting information rather
            than a second visualisation. One brand square is enough to anchor
            it without rebuilding every group as a pixel matrix. */}
        <div className="mt-8 flex max-w-3xl items-start gap-4 lg:mt-10">
          <span aria-hidden className="mt-[0.55rem] size-2 shrink-0 bg-gold-deep" />
          <p className="text-body-sm text-navy-600">
            {t("matrix", { groups, subs, tiers: TIERS.length })}
          </p>
        </div>
      </div>
    </section>
  );
}
