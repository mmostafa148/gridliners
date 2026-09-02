"use client";

import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PixelCopyGround, PixelOverlay } from "@/components/brand/pixel-overlay";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { HeroSlide } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * The hero's rotating key art.
 *
 * The transition is a column curtain rather than a crossfade or a push. The
 * incoming frame is cut into vertical bands that arrive one after another,
 * alternating up and down — which is the identity's own grid doing the work,
 * and it reads as the picture being set rather than swapped. The outgoing frame
 * drifts back a fraction while that happens, so the two are never simply
 * stacked at the same depth.
 *
 * Only the wide frame gets the curtain. Below lg the art is a portrait staging
 * and the box is small enough that a band per column would be a few pixels
 * wide, so there it crossfades and the bands are not rendered at all — which
 * also keeps a phone from laying out six copies of an image.
 */

/** Bands in the curtain. Odd, so the middle band leads and the edges close. */
const COLUMNS = 7;
const STEP = 0.055; // stagger between bands, seconds

/**
 * `eager` is set on the first slide only. Everything here is lazy because a
 * slide that has not been reached should not be fetched, but the first one is
 * the page's LCP element and lazy-loading it means the browser cannot start the
 * fetch until layout has run.
 */
function WideArt({ slide, eager = false }: { slide: HeroSlide; eager?: boolean }) {
  return (
    <>
      <Image
        src={slide.wide.src}
        alt=""
        fill
        // The two variants are swapped with display, so both are in the markup
        // at every width and both get preloaded by priority. Pinning the
        // off-breakpoint size to 1px leaves the browser to fetch the smallest
        // candidate for the one that is currently hidden instead of a second
        // full-width picture.
        sizes="(min-width: 1024px) 100vw, 1px"
        priority={eager}
        loading={eager ? "eager" : "lazy"}
        style={{ objectPosition: slide.focus }}
        className="object-cover rtl:-scale-x-100"
      />
      {/* Inside the frame, not over the stage, so the curtain reveals the
          squares band by band along with the picture they belong to. */}
      <PixelOverlay cells={slide.pixels.wide} />
    </>
  );
}

function PortraitArt({ slide, eager = false }: { slide: HeroSlide; eager?: boolean }) {
  return (
    <>
      <Image
        src={slide.portrait.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 1px, 100vw"
        priority={eager}
        loading={eager ? "eager" : "lazy"}
        className="object-cover object-[50%_12%]"
      />
      <PixelOverlay cells={slide.pixels.portrait} />
    </>
  );
}

interface SliderApi {
  slides: HeroSlide[];
  index: number;
  /** True once the scroll sequence has handed the screen to the picture. */
  live: boolean;
  incoming: { to: number; dir: 1 | -1 } | null;
  go: (to: number, dir: 1 | -1) => void;
  step: (dir: 1 | -1) => void;
  bands: React.RefObject<(HTMLDivElement | null)[]>;
  fade: React.RefObject<HTMLDivElement | null>;
  base: React.RefObject<HTMLDivElement | null>;
}

/**
 * The art sits at stage level so the glass readout has something to refract,
 * while the controls belong to the column above that band. They cannot be one
 * element, so they share one state through here instead.
 */
const SliderContext = createContext<SliderApi | null>(null);

function useSlider() {
  const api = useContext(SliderContext);
  if (!api) throw new Error("Hero slider parts must be rendered inside HeroSliderProvider");
  return api;
}

export function HeroSliderProvider({
  slides,
  children,
}: {
  slides: HeroSlide[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [incoming, setIncoming] = useState<{ to: number; dir: 1 | -1 } | null>(null);
  const [live, setLive] = useState(false);

  const bands = useRef<(HTMLDivElement | null)[]>([]);
  const fade = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const go = useCallback(
    (to: number, dir: 1 | -1) => {
      if (busy.current || to === index || slides.length < 2) return;
      busy.current = true;
      setIncoming({ to, dir });

      // The layer is mounted by the state change above, so the tween is built
      // on the next frame, once the bands exist to be measured and moved.
      requestAnimationFrame(() => {
        const settle = () => {
          setIndex(to);
          setIncoming(null);
          busy.current = false;
          if (base.current) gsap.set(base.current, { scale: 1, opacity: 1 });
        };

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          settle();
          return;
        }

        const tl = gsap.timeline({ onComplete: settle });

        const cols = bands.current.filter(Boolean) as HTMLDivElement[];
        if (cols.length) {
          tl.fromTo(
            cols,
            // Alternating entry is what stops the curtain reading as a wipe.
            { yPercent: (i) => (i % 2 ? -100 : 100) },
            {
              yPercent: 0,
              duration: 0.85,
              ease: "power3.inOut",
              // from the middle out, so the frame closes rather than sweeps
              stagger: { each: STEP, from: "center" },
            },
            0,
          );
        }
        if (fade.current) {
          tl.fromTo(fade.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0);
        }
        // The outgoing frame gives ground rather than sitting flat behind the
        // incoming one; without it the two read as one image flickering.
        if (base.current) {
          tl.to(base.current, { scale: 1.05, opacity: 0.55, duration: 0.9, ease: "power3.inOut" }, 0);
        }
      });
    },
    [index, slides.length],
  );

  // The scroll sequence is choreographed around the cycle's own headline —
  // it splits it into lines and flies them to the gutter. Reversing the scroll
  // while a later slide is up would play that choreography against copy it
  // never measured, so leaving the settled state returns to the first slide.
  useEffect(() => {
    const stage = document.querySelector("[data-hero-stage]");
    if (!stage) return;
    const read = () => {
      const on = (stage as HTMLElement).dataset.heroLive !== undefined;
      setLive(on);
      if (!on && !busy.current) setIndex(0);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(stage, { attributes: true, attributeFilter: ["data-hero-live"] });
    return () => obs.disconnect();
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => go((index + dir + slides.length) % slides.length, dir),
    [go, index, slides.length],
  );

  const api = useMemo<SliderApi>(
    () => ({ slides, index, live, incoming, go, step, bands, fade, base }),
    [slides, index, live, incoming, go, step],
  );

  return <SliderContext.Provider value={api}>{children}</SliderContext.Provider>;
}

export function HeroSliderArt() {
  const { slides, index, incoming, base, fade, bands } = useSlider();

  // Published on the stage so the animated headline can be retired in CSS,
  // rather than threading a ref up through the layout to hide it.
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>("[data-hero-stage]");
    if (stage) stage.dataset.heroSlide = String(index + 1);
  }, [index]);
  const shown = slides[index];
  const next = incoming ? slides[incoming.to] : null;

  return (
    <>
      <div ref={base} className="absolute inset-0 will-change-transform">
        <div className="absolute inset-0 lg:hidden">
          <PortraitArt slide={shown} eager={index === 0} />
        </div>
        <div className="absolute inset-0 hidden lg:block">
          <WideArt slide={shown} eager={index === 0} />
        </div>
      </div>

      {next ? (
        <>
          {/* Below lg the bands would be a few pixels wide, so this crossfades. */}
          <div ref={fade} className="absolute inset-0 lg:hidden">
            <PortraitArt slide={next} />
          </div>

          <div className="absolute inset-0 hidden lg:block" aria-hidden>
            {Array.from({ length: COLUMNS }, (_, i) => (
              <div
                key={i}
                className="absolute inset-0"
                // The clip stays put while the art inside it travels. Clipping
                // the moving element instead would drag the band with it and
                // there would be nothing to reveal.
                style={{
                  clipPath: `inset(0 ${((COLUMNS - i - 1) / COLUMNS) * 100}% 0 ${(i / COLUMNS) * 100}%)`,
                }}
              >
                <div
                  ref={(el) => {
                    bands.current[i] = el;
                  }}
                  className="absolute inset-0 will-change-transform"
                >
                  <WideArt slide={next} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

    </>
  );
}

export function HeroSliderControls() {
  const { slides, index, go, step } = useSlider();
  const t = useTranslations("home.slider");

  return (
    <div
        className={cn(
          "hero-controls absolute bottom-7 z-20 flex items-center gap-5",
          "end-[var(--gutter)]",
        )}
      >
        <div className="flex items-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.wide.src}
              type="button"
              onClick={() => go(i, i > index ? 1 : -1)}
              aria-label={t("goTo", { n: i + 1 })}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                // Same box as the arrows, so the row reads as one control
                // rather than two sets of furniture at different scales. The
                // current slide is marked by fill, not by size — sizing it up
                // would break the match the moment it became active.
                "grid size-9 place-items-center border transition-colors duration-300",
                // Set in the data face, like every other number on the page.
                "font-data text-[0.6875rem] leading-none",
                // Its own ground, because the slides carry no overlay and a
                // control cannot depend on what the picture happens to be doing
                // underneath it — cream figures on the neon frame measured
                // 1.02:1. Glass rather than a solid fill, so it belongs to the
                // same family as the readout below.
                i === index
                  ? "border-gold bg-gold text-navy-900"
                  : "border-cream-100/25 bg-navy-950/60 text-cream-100 backdrop-blur-md hover:border-cream-100/70 hover:bg-navy-950/80",
              )}
            >
              {/* aria-label above carries the accessible name, so the figure
                  itself is decoration as far as a screen reader is concerned. */}
              <span aria-hidden>{i + 1}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { dir: -1 as const, label: "previous", Icon: ChevronLeft },
              { dir: 1 as const, label: "next", Icon: ChevronRight },
            ]
          ).map(({ dir, label, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => step(dir)}
              aria-label={t(label)}
              className={cn(
                "grid size-9 place-items-center border border-cream-100/25 text-cream-100",
                "bg-navy-950/60 backdrop-blur-md transition-colors",
                "hover:border-cream-100/70 hover:bg-navy-950/80",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
              )}
            >
              <Icon className="size-4 rtl:-scale-x-100" strokeWidth={2} aria-hidden />
            </button>
          ))}
        </div>
    </div>
  );
}

/** The copy's field, in the copy's own column. Follows the active slide. */
export function HeroSliderCopyGround() {
  const { slides, index, live } = useSlider();
  // Reassembles when the sequence hands over, and again on every slide, since
  // each slide's field is a different arrangement arriving in its own right.
  return (
    <PixelCopyGround
      cells={slides[index].copyCluster}
      reveal={live ? index + 1 : 0}
    />
  );
}

/**
 * Copy for the slides that are not the cycle's own.
 *
 * A separate block rather than a swap inside the animated one. That block is
 * split into lines and flown to the gutter by the scroll sequence; replacing
 * its text would leave the split holding elements that no longer exist. This
 * one is static, and it only ever appears where that block has already come to
 * rest — same gutter, same measure — so the two are interchangeable on screen
 * without being the same machinery.
 */
export function HeroSliderCopy() {
  const { slides, index } = useSlider();
  // Named apart from the controls' translator: both live in this file, and the
  // message checker resolves a `t` to one namespace per file.
  const tSlide = useTranslations("home.slides");
  const key = slides[index].copy;

  return (
    <div
      data-slide-copy
      className={cn(
        "page-shell pointer-events-none absolute inset-0 z-10 flex flex-col justify-center",
        "transition-opacity duration-500",
        key ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!key}
    >
      {key ? (
        <div className="flex max-w-xl flex-col items-start gap-5 text-start sm:gap-6">
          <h2 className="text-display-md text-balance text-cream-100 [@media(max-height:780px)]:text-h1">
            {tSlide(`${key}.title`)}
          </h2>
          <p className="text-body-lg text-cream-100/85">{tSlide(`${key}.body`)}</p>
          <Button asChild variant="award" size="cta" className="pointer-events-auto mt-1">
            <Link href={key === "jury" ? "/jury-panel" : "/how-to-enter"}>
              {tSlide(`${key}.cta`)}
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
