import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Fragment } from "react";

import { Logo } from "@/components/brand/brand-assets";
import { PixelField } from "@/components/brand/pixel-field";
import { PixelOverlay } from "@/components/brand/pixel-overlay";
import { CycleReadout } from "@/components/marketing/cycle-readout";
import {
  HeroSliderArt,
  HeroSliderControls,
  HeroSliderCopy,
  HeroSliderCopyGround,
  HeroSliderProvider,
} from "@/components/marketing/hero-slider";
import { HeroStage } from "@/components/marketing/hero-stage";
import { MobileHero } from "@/components/marketing/mobile-hero";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Cycle } from "@/lib/api/types";
import { phasePresentation } from "@/lib/cycle-phase";
import { DOTTED_LOGO } from "@/lib/dotted-logo";
import { heroSlides } from "@/lib/media";

/**
 * Hero: the mark, full height, on solid navy.
 *
 * No photograph. The mark carries the screen instead, masked over a dot field
 * so it stays the real letterform at any size while reading as the pixel motif
 * the identity is built on. Everything else is centred beneath it, over a
 * readout of where the cycle stands.
 *
 * From md up the navigation sits at the foot of the screen rather than the
 * head, so the mark opens the page with nothing above it, and scrolling flies
 * it up into the rail.
 *
 * A phone gets a different hero, not a squeezed one. The scroll sequence is the
 * whole of the desktop composition and it costs a screen and a half of runway
 * to play; on a phone that runway was spent arriving at a picture, with the
 * rail sitting across the thumb the entire time. So below md the mark is simply
 * the first of four panels in a swipe track — MobileHero — the rail docks under
 * the announcement bar from the first paint, and the copy moves to the foot of
 * the screen, flush to the start edge.
 *
 * Two compositions, one set of parts: both are built from the same lockup,
 * photography and phase copy, and only one of them is ever in the layout.
 */
export async function CycleHero({
  cycle,
  stats,
}: {
  cycle: Cycle;
  stats: { value: number; labelKey: string }[];
}) {
  // The readout resolves its own stat labels client-side, so the hero no longer
  // needs that namespace here.
  const [locale, t, tCta, tCountdown, tPhase, tSlide] = await Promise.all([
    getLocale(),
    getTranslations("home.hero"),
    getTranslations("home.cta"),
    getTranslations("home.countdown"),
    getTranslations("cyclePhase"),
    getTranslations("home.slides"),
  ]);

  const presentation = phasePresentation(cycle);

  const lockup = (
    <div
      role="img"
      aria-label="Gridliners"
      style={{ aspectRatio: DOTTED_LOGO.ratio }}
      // 94vw leaves 11px of gutter at 390, which reads as the mark being
      // cropped rather than placed. The wider gutter is phone-only.
      className="dotted-logo mx-auto w-[86vw] text-cream-100 sm:w-[min(94vw,72rem)] [@media(max-height:820px)]:w-[min(82vw,54rem)]"
    />
  );

  /* /85: at /65 this label was the hero's contrast floor on every slide, and no
     amount of field behind it could lift it. */
  const editionLabel = (
    <span className="text-nav uppercase text-cream-200/85">
      {cycle.label[locale as "en" | "ar"]}
    </span>
  );

  const phaseChip = (
    <span className="inline-flex items-center gap-2 border border-cream-200/30 px-3 py-1.5 text-nav uppercase">
      {/* The dot marks a live phase, so the chip keeps it under reduced motion
          and drops only the movement — the position `tile-breathe` takes. Pulse
          runs opacity 1 → .5 → 1, so with the animation off it rests at full
          strength, which is the stronger of its two states. */}
      <span
        className="size-1.5 animate-pulse bg-campaign-lime motion-reduce:animate-none"
        aria-hidden
      />
      {tPhase(cycle.phase)}
    </span>
  );

  const headline = (
    <>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {editionLabel}
        {phaseChip}
      </div>

      {/* Not the h1 — that is rendered once, below, outside both compositions.
          This is the same words drawn for the eye, so it is hidden from the
          accessibility tree rather than announced a second time.

          `font-display` is not optional here. The base layer applies it to
          h1-h6 (globals.css), so dropping the heading tag without it silently
          takes the English headline from Presicav to Inter. Measured: with the
          class, family, size, leading, tracking, weight and text-wrap are
          identical to the h1 this replaced, in both locales. */}
      <p
        aria-hidden
        className="max-w-[15ch] font-display text-display-md text-balance [@media(max-height:780px)]:text-h1"
      >
        {t(`${cycle.phase}.title`)}
      </p>

      {/* /85 rather than /75: on the pixel field the paragraph was the
          floor at 4.3:1, and the field cannot lift it — the shortfall is the
          text's own alpha, not what is behind it. */}
      <p className="max-w-xl text-body-lg text-cream-100/85">{t(`${cycle.phase}.body`)}</p>

      {/* Stacked full width on a phone: at auto width the two buttons came out
          different sizes on their own rows, and the primary reads as a floating
          gold block because `award` is navy on a navy stage. Cream fill under
          sm only, so the desktop treatment is untouched. */}
      <div className="mt-1 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <Button
          asChild
          variant="award"
          size="cta"
          className="w-full justify-between bg-cream-100 text-navy-900 sm:w-auto sm:justify-center sm:bg-navy-900 sm:text-cream-100"
        >
          <Link href={presentation.primary.href}>
            {tCta(presentation.primary.labelKey)}
          </Link>
        </Button>
        {presentation.secondary ? (
          <Button
            asChild
            variant="outline"
            size="cta"
            className="w-full border-cream-100/35 bg-transparent text-cream-100 hover:bg-cream-100/10 hover:text-cream-50 sm:w-auto"
          >
            <Link href={presentation.secondary.href}>
              {tCta(presentation.secondary.labelKey)}
            </Link>
          </Button>
        ) : null}
      </div>
    </>
  );

  // --- The phone composition ------------------------------------------------
  //
  // Three panels: the photography, and nothing before it. The mark had its own
  // opening panel here — the desktop sequence's first beat, kept as a frame you
  // swiped past — but on a phone it was a screen standing between the reader
  // and the pictures, and the mark is already in the rail docked above it.
  //
  // Which copy block belongs to which panel. The first frame carries the
  // cycle's own copy, which is what it carries on the desktop stage too; the
  // other two brought their own.
  const COPY_SLOT = { jury: 1, community: 2 } as const;

  const slideCopy = (key: "jury" | "community", href: string) => (
    <Fragment key={key}>
      <h2 className="text-display-md text-balance">{tSlide(`${key}.title`)}</h2>
      <p className="text-body-md text-cream-100/85">{tSlide(`${key}.body`)}</p>
      <Button
        asChild
        variant="award"
        size="cta"
        className="w-full justify-between bg-cream-100 text-navy-900"
      >
        <Link href={href}>{tSlide(`${key}.cta`)}</Link>
      </Button>
    </Fragment>
  );

  const mobileCopies = [
    <Fragment key="cycle">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {editionLabel}
        {phaseChip}
      </div>
      {/* Same as the desktop composition's: the words, not the heading. */}
      <p aria-hidden className="font-display text-display-md text-balance">
        {t(`${cycle.phase}.title`)}
      </p>
      <p className="text-body-md text-cream-100/85">{t(`${cycle.phase}.body`)}</p>
      {/* Full width and stacked. At auto width the two came out different
          sizes on their own rows, and `award` is navy on a navy stage, so the
          primary takes the cream fill here. */}
      <div className="flex w-full flex-col items-stretch gap-2.5">
        <Button
          asChild
          variant="award"
          size="cta"
          className="w-full justify-between bg-cream-100 text-navy-900"
        >
          <Link href={presentation.primary.href}>
            {tCta(presentation.primary.labelKey)}
          </Link>
        </Button>
        {presentation.secondary ? (
          <Button
            asChild
            variant="outline"
            size="cta"
            className="w-full border-cream-100/35 bg-transparent text-cream-100"
          >
            <Link href={presentation.secondary.href}>
              {tCta(presentation.secondary.labelKey)}
            </Link>
          </Button>
        ) : null}
      </div>
    </Fragment>,
    slideCopy("jury", "/jury-panel"),
    slideCopy("community", "/how-to-enter"),
  ];

  const mobilePanels = heroSlides.map((slide, i) => ({
    art: (
      <>
        <Image
          src={slide.portrait.src}
          alt=""
          fill
          sizes="100vw"
          // The first frame is now the first thing on the page on a phone, so
          // it is the LCP element and is fetched at the highest priority the
          // browser will give it. The other two wait until they are swiped to.
          priority={i === 0}
          loading={i === 0 ? "eager" : "lazy"}
          className="object-cover object-[50%_12%]"
        />
        <PixelOverlay cells={slide.pixels.portrait} />
      </>
    ),
    copy: slide.copy ? COPY_SLOT[slide.copy] : 0,
  }));

  return (
    // The provider wraps the stage so the art and the controls, which the
    // stage renders in two different places, still read one state.
    // -mt-10 gives back the clearance the layout adds for the
    // announcement bar: the hero is full bleed and runs under it.
    <HeroSliderProvider slides={heroSlides}>
      {/* The document's one h1, and the reason it is here rather than in either
          composition.

          The two heroes are swapped with display:none, which takes a subtree
          out of the accessibility tree as well as out of the layout. So a
          heading inside either one disappears at the other breakpoint, and the
          page loses its title for exactly the readers who depend on it. They
          cannot share a single element either: the stage is sticky and the
          phone hero is its own overflow context, and no amount of CSS moves one
          element between them (the same constraint the readout hits in
          hero-stage.tsx).

          So the heading lives out here, once, always in the tree, and each
          composition draws the same words for the eye with aria-hidden. It is
          the shape category-marquee already uses: the real semantics sr-only,
          the visual treatment beside it.

          The wrapper is positioned on purpose. sr-only is position:absolute
          with no insets, so it resolves against the nearest positioned
          ancestor — and an unwrapped one has already, in jury-highlights,
          escaped its clipping context and put 367px of horizontal scroll on the
          document. This div is zero-height and costs no layout. */}
      <div className="relative">
        <h1 className="sr-only">{t(`${cycle.phase}.title`)}</h1>
      </div>

      {/* -mt-28 is the phone's version of the same opt-out: below md the layout
          clears the announcement bar *and* the rail docked under it, and the
          hero runs under both. */}
      <MobileHero
        className="-mt-28 md:hidden"
        panels={mobilePanels}
        copies={mobileCopies}
      />

      <HeroStage
      className="-mt-10"
      logo={lockup}
      solidLogo={<Logo variant="horizontal" tone="reversed" height={32} />}
      headline={headline}
      field={<PixelField seed={cycle.year} />}
      backdrop={
        // Straight, not graded. The duotone exists to pull mixed stage lighting
        // into the palette; these frames are already art-directed, and grading
        // them to navy would flatten the accents that carry them.
        //
        // Full bleed, hung from the top, running the whole height of the area
        // above the readout. The box is the content column, so `inset-0` lands
        // the frame's bottom edge exactly on the band with nothing between.
        <div className="absolute inset-0 overflow-hidden">
          <HeroSliderArt />
        </div>
      }
      controls={<HeroSliderControls />}
      copyGround={<HeroSliderCopyGround />}
      slideCopy={<HeroSliderCopy />}
    >
      <CycleReadout
        target={presentation.countdown?.target ?? null}
        since={presentation.countdown?.since ?? null}
        label={presentation.countdown ? tCountdown(presentation.countdown.labelKey) : null}
        stats={stats}
      />
      </HeroStage>
    </HeroSliderProvider>
  );
}
