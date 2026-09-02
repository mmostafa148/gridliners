import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ProjectArt } from "@/components/marketing/project-art";
import { HeroVoteAction, HeroVoteCount } from "@/components/marketing/project-vote";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { AwardLevel, ContentLanguage, SubCategory, Tier } from "@/lib/api/types";
import { heroFilmFor } from "@/lib/hero-media";
import type { ProjectImage } from "@/lib/project-media";
import { cn } from "@/lib/utils";

/**
 * The work, full bleed, with the page's words and its one action over it.
 *
 * **One treatment for every project.** The backdrop is a film where a film
 * exists and the cover where it does not, and both are covered to the same
 * frame - so a reader moving between projects meets the same page, which is
 * what an awards site owes its finalists.
 *
 * **The still is not left still.** A frame behind a hero reads as a poster; the
 * same frame drifting reads as footage, and the drift is `motion-safe` so a
 * reader who asked for stillness gets it.
 *
 * The scrim is heavy at the foot, where the type sits, and light at the head,
 * where the work is. A flat wash would either drown the work or lose the words.
 */
const METAL: Record<"gold" | "silver" | "bronze", string> = {
  gold: "bg-gold text-navy-900",
  silver: "bg-silver text-navy-900",
  bronze: "bg-bronze text-white",
};

export async function ProjectHero({
  slug,
  cover,
  title,
  contentLanguage,
  contentDir,
  year,
  maker,
  country,
  tier,
  subCategories,
  medals,
  externalUrl,
  locale,
}: {
  slug: string;
  cover: ProjectImage | null;
  title: string;
  contentLanguage: ContentLanguage;
  contentDir: "ltr" | "rtl";
  year: number;
  maker: string | null;
  country: string;
  tier: Tier;
  subCategories: SubCategory[];
  /** Awarded medals, so a finished project still opens on something to see. */
  medals: Exclude<AwardLevel, "did_not_place">[];
  /** The entrant's own address for the work, if they published one. */
  externalUrl: string | null;
  locale: Locale;
}) {
  const [t, tTier, tLevel] = await Promise.all([
    getTranslations("project"),
    getTranslations("tier"),
    getTranslations("winners.level"),
  ]);

  const film = heroFilmFor(slug);
  const poster = cover?.kind === "file" ? cover.src : undefined;

  return (
    <section
      data-project-cover
      /**
       * One screen, less what the shell already spent.
       *
       * `app-shell` pads `<main>` by 7rem on a phone and 2.5rem from `md` up,
       * to clear the fixed announcement bar and header. A plain `min-h-svh`
       * here is therefore a screen *plus* that padding, so the hero ran past
       * the fold by exactly the shell's offset and took the vote with it.
       *
       * `svh`, not `vh`: on a phone the browser chrome makes `100vh` taller
       * than the screen, which would put it back.
       */
      className="relative isolate flex min-h-[calc(100svh-var(--chrome-h))] flex-col justify-end overflow-hidden bg-navy-950 text-cream-50 md:min-h-[calc(100svh-var(--announce-h))]"
    >
      <div aria-hidden className="absolute inset-0 -z-20">
        {film ? (
          /* Silent, looping and inert: a hero backdrop is scenery, so it never
             asks to be controlled and never plays sound at a reader. */
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
            className="size-full object-cover"
          >
            <source src={film} type="video/mp4" />
          </video>
        ) : cover?.kind === "file" ? (
          <Image
            src={cover.src}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover motion-safe:animate-[hero-drift_26s_ease-in-out_infinite_alternate]"
          />
        ) : cover ? (
          /* Drawn at the shape it is shown in, and stripped of its lettering:
             the artwork's own wordmark would be a second headline beside the
             page's. */
          <ProjectArt
            spec={cover.spec}
            ratio={2.2}
            caption={false}
            plain
            className="size-full motion-safe:animate-[hero-drift_26s_ease-in-out_infinite_alternate] [&_text]:opacity-25"
          />
        ) : null}
      </div>

      {/* Weighted low and released fast. A flat-ish wash drowned a dark film:
          the lower half of the hero was effectively solid navy and the work
          behind it could not be seen. The stops are placed so the scrim is
          only dense in the band the type occupies, and the measured contrast
          is what decided how far it could be released - including against the
          brightest frame of a moving backdrop, not just one sampled still. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 from-38% via-navy-950/72 via-64% to-navy-950/8"
      />
      {/* A second, shallow wash at the head. The way back sits at the top of
          the hero now, where the first scrim is deliberately at its thinnest so
          the film can be seen - and a pale frame took that link down to 2:1.
          This covers the top quarter only, so the film is untouched below it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/92 from-0% to-transparent to-30%"
      />

      <div
        /* The shell's own padding already clears the fixed chrome on a phone;
           from `md` it clears only 2.5rem of a 113px bar, so the rest is made
           up here rather than counted twice.

           `flex-1` with `justify-between` is what lets the way back sit at the
           top of the hero while everything else stays at the foot of it. */
        className="page-shell flex flex-1 flex-col justify-between gap-8 pb-8 pt-6 md:pt-[calc(var(--chrome-h)-var(--announce-h)+1.5rem)] lg:pb-20 lg:pt-[calc(var(--chrome-h)-var(--announce-h)+3rem)]"
      >
        <p className="font-display text-coord uppercase">
          <Link
            href={`/finalists/${year}`}
            className="inline-flex items-center gap-2 text-cream-200/85 underline underline-offset-4 transition-colors hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
          >
            <ArrowLeft aria-hidden className="size-3.5 rtl:-scale-x-100" strokeWidth={2.5} />
            {t("breadcrumbLabel")}
          </Link>
        </p>

        <div className="flex flex-col gap-6 lg:gap-8">
          {/* The medals sit opposite the title, above the rule: what the work
              won belongs with what the work is, not in the row of things a
              reader can press. */}
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <div className="max-w-[52rem]">
              <p className="font-display text-coord uppercase text-cream-200/80">
                {t("breadcrumb", { year })}
              </p>
              {/* Entry content, never translated, so it carries its own
                  direction inside a header that keeps the page's. */}
              <h1 className="mt-3 text-display-lg leading-[1.02] text-balance lg:mt-4 lg:text-display-xl">
                <bdi lang={contentLanguage} dir={contentDir}>
                  {title}
                </bdi>
              </h1>
              <p className="mt-3 text-body-lg text-cream-100/90 lg:mt-6">
                {[maker && t("by", { name: maker }), country].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-display text-coord uppercase text-cream-200/80 lg:mt-3 lg:gap-y-2">
                <span>{tTier(tier)}</span>
                {subCategories.map((sub) => (
                  <span key={sub.id} className="flex items-center gap-x-3">
                    <span aria-hidden className="text-cream-200/70">·</span>
                    {sub.name[locale]}
                  </span>
                ))}
              </p>
            </div>

            {medals.length ? (
              <div className="flex flex-wrap items-center gap-3">
                {medals.map((medal) => (
                  <span
                    key={medal}
                    className={cn("px-5 py-2 font-display text-coord uppercase", METAL[medal])}
                  >
                    {tLevel(medal)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* The count at the start, everything a reader can press at the end.
              The rule runs the full width beneath both, so the band reads as one
              line rather than two clusters that happen to share a row. */}
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-cream-100/25 pt-4 lg:gap-y-5 lg:pt-8">
            <HeroVoteCount />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <HeroVoteAction />

              {/* The work's own address, beside the vote rather than at the
                  foot of the page. Outlined rather than cream-filled, because
                  it is the second thing a reader might do here and the vote is
                  the first - but on its **own solid ground**, not on the film.
                  A translucent control over a moving backdrop is only as
                  legible as the frame behind it, and a pale frame took this to
                  1.08:1. */}
              {externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-11 items-center gap-2.5 border border-cream-100/45 bg-navy-950 px-6 font-display text-coord uppercase text-cream-100 transition-colors hover:border-cream-50 hover:bg-cream-50 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                >
                  {t("viewProject")}
                  <ArrowUpRight
                    aria-hidden
                    strokeWidth={2.5}
                    className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                  />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
