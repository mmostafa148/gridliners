"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Scroll-driven hero sequence.
 *
 * The stage is sticky inside a taller runway rather than pinned by
 * ScrollTrigger. Pinning inserts a spacer into the document, which would push
 * the navigation rail below the fold and break the one thing that has to stay
 * put: the rail sitting on the foot of the hero from the very first paint.
 * Sticky keeps the document height honest and leaves the rail addressable.
 *
 * Everything is driven by scrub, so the sequence is a function of scroll
 * position with no easing of its own. Scrubbed timelines that also ease fight
 * the user's input.
 *
 * The rail is queried by data attribute rather than passed a ref. It lives in
 * the shared public layout, several levels above this component, and threading
 * a ref through the layout to animate one route's hero would put hero concerns
 * into every public page.
 */

const RAIL = 72; // px, must match the rail's own height

export function HeroStage({
  className,
  children,
  logo,
  solidLogo,
  headline,
  backdrop,
  field,
  controls,
  copyGround,
  slideCopy,
}: {
  /** Applied to the runway, so a page can offset the whole hero. */
  className?: string;
  children: React.ReactNode;
  logo: React.ReactNode;
  /** The solid lockup the dotted one resolves into when it lands. */
  solidLogo: React.ReactNode;
  headline: React.ReactNode;
  backdrop: React.ReactNode;
  field: React.ReactNode;
  /** Anything belonging to the art rather than the copy: sits at the foot of
   *  the column, which is the readout's top edge. */
  controls?: React.ReactNode;
  /** Sits behind the copy, inside the copy's own box. */
  copyGround?: React.ReactNode;
  /** Copy belonging to a slide rather than to the cycle. */
  slideCopy?: React.ReactNode;
}) {
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const solidRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  // Bumped when the breakpoint is crossed, which is the only thing that makes
  // the effect below need to run a second time.
  const [pass, setPass] = useState(0);

  useLayoutEffect(() => {
    // Below md this whole sequence is replaced by MobileHero and the runway is
    // display:none, so there is nothing here to animate and the rail is already
    // docked at the top by its own stylesheet. Read synchronously rather than
    // from state, so the desktop timeline is still built before the first paint.
    const wide = window.matchMedia("(min-width: 768px)");
    const onCross = () => setPass((n) => n + 1);
    wide.addEventListener("change", onCross);
    const stopWatching = () => wide.removeEventListener("change", onCross);

    if (!wide.matches) return stopWatching;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return stopWatching;

    const ctx = gsap.context(() => {
      const rail = document.querySelector<HTMLElement>("[data-site-rail]");
      const railLogo = document.querySelector<HTMLElement>("[data-rail-logo]");

      const rtl = document.documentElement.dir === "rtl";

      // The announcement bar owns the top of the window, so anything whose
      // journey ends at the top of the page ends below it rather than at 0.
      // Measured rather than constant: the bar renders nothing when no
      // announcement is live.
      const barH = () =>
        document.querySelector<HTMLElement>("[data-announce-bar]")
          ?.offsetHeight ?? 0;

      // The rail's logo already sits on the page gutter, so it doubles as the
      // measurement for where anything flush to the start edge belongs.
      const gutter = () => {
        const r = railLogo?.getBoundingClientRect();
        if (!r) return rtl ? window.innerWidth - 58 : 58;
        return rtl ? r.right : r.left;
      };

      // How far the headline has to travel for its start edge to meet that
      // gutter. getBoundingClientRect reports the box as currently transformed,
      // so the live x is subtracted back out to recover the resting edge —
      // otherwise every refresh would measure against the previous answer and
      // the block would walk further off-screen each time.
      const headlineShift = () => {
        const el = headlineRef.current;
        if (!el) return 0;
        const x = Number(gsap.getProperty(el, "x")) || 0;
        const r = el.getBoundingClientRect();
        return rtl ? gutter() - (r.right - x) : gutter() - (r.left - x);
      };

      // Where the flying lockup has to land: exactly on top of the rail's own
      // logo, measured rather than guessed, so the swap is invisible.
      const landing = () => {
        const el = logoRef.current;
        const target = railLogo;
        if (!el || !target) return null;
        const from = el.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        return {
          scale: to.height / from.height,
          x: to.left + to.width / 2 - (from.left + from.width / 2),
          // The rail is at the foot now but lands at the top, so the target is
          // the rail's eventual top position, not its current one — and that
          // top is under the announcement bar. Without barH the mark flew to
          // where the rail used to land before the bar existed, finishing a
          // bar's height too high and reading as a mis-hit landing.
          y: barH() + RAIL / 2 - (from.top + from.height / 2),
        };
      };

      // The stand-in is `fixed top-0` in the stylesheet, from before the
      // announcement bar existed. Left there it holds the corner a bar's height
      // above the rail it is standing in for, so the mark appears to land, jump
      // up, and then be replaced — which is the whole of the reported fault.
      // Measured on every refresh, so it follows a resize and a bar that is not
      // rendered at all.
      const placeStandIn = () => gsap.set(solidRef.current, { top: barH() });
      placeStandIn();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: runway.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefresh: placeStandIn,
          // The backdrop is fully in by 0.65 of the timeline; anything that
          // belongs to the picture rather than to the hero copy becomes real
          // at that point and not before.
          onUpdate: (self) => {
            const el = stage.current;
            if (!el) return;
            if (self.progress > 0.62) el.dataset.heroLive = "";
            else delete el.dataset.heroLive;
          },
        },
      });

      tl.to(
        logoRef.current,
        {
          scale: () => landing()?.scale ?? 0.12,
          x: () => landing()?.x ?? 0,
          y: () => landing()?.y ?? 0,
          ease: "none",
        },
        0,
      )
        // The dotted field resolves into the solid lockup as it reaches size.
        // The two sit in the same box, so the crossfade reads as one mark
        // sharpening rather than two marks trading places.
        .to(logoRef.current, { opacity: 0, duration: 0.1, ease: "none" }, 0.6)
        .to(solidRef.current, { opacity: 1, duration: 0.1, ease: "none" }, 0.62)
        .to(fieldRef.current, { opacity: 0, ease: "none" }, 0.1)
        .fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, ease: "none" },
          0.15,
        );

      // Once the mark has resolved into the solid lockup, the rail changes ends
      // of the screen: it fades away downward from the foot, and a moment later
      // drops in from above the top edge to stay.
      //
      // It never travels between the two. The rail is repositioned while it is
      // invisible, so the move costs no scroll distance and the two arrivals
      // read as one bar changing its mind rather than a bar sliding 800px.
      //
      // All of it is `y` on a fixed element rather than `top`: one composited
      // property, and the resting offset stays in the stylesheet where the
      // no-JS and reduced-motion paths can still see it.
      if (rail) {
        const railTop = () => window.innerHeight - RAIL - barH();

        tl.to(
          stage.current,
          { paddingBottom: 0, duration: 0.1, ease: "none" },
          0.7,
        )
          // Handing the clearance back grows the content column downward, which
          // would drag the already-settled copy 36px with it. Half the rail's
          // height, upward, keeps it exactly where it came to rest.
          .to(
            contentRef.current,
            { y: -RAIL / 2, duration: 0.1, ease: "none" },
            0.7,
          )
          .to(rail, { y: 28, autoAlpha: 0, duration: 0.1, ease: "none" }, 0.7)
          // The rail arrives without its logo, because the mark is already
          // sitting in that exact spot. The bar assembles around it instead of
          // bringing a second copy down past it.
          .set(railLogo, { autoAlpha: 0 }, 0.8)
          .fromTo(
            rail,
            { y: () => -(railTop() + RAIL), autoAlpha: 0 },
            {
              y: () => -railTop(),
              autoAlpha: 1,
              duration: 0.15,
              ease: "none",
              // Without this the "from" would apply at build time and throw the
              // rail off the top of the screen on first paint.
              immediateRender: false,
            },
            0.8,
          )
          // Both lockups are on the same pixels by now, so the handover is
          // invisible; the stand-in has nothing left to hold.
          .to(railLogo, { autoAlpha: 1, duration: 0.05, ease: "none" }, 0.95)
          .to(
            solidRef.current,
            { opacity: 0, duration: 0.05, ease: "none" },
            0.95,
          );
      }

      // --- Headline -------------------------------------------------------
      //
      // Centred-to-flush cannot be tweened: text-align and align-items have no
      // in-between values, so animating them snaps, and the snap is exactly
      // what read as cheap here.
      //
      // So the copy is never centred by alignment at all. The block is set
      // flush from the outset and every line is then pushed back out by half
      // its own slack, which reproduces the centred composition to the pixel
      // using nothing but transforms. Scrolling drains those offsets to zero.
      // What was an unanimatable property change becomes one interpolation, and
      // each line travels its own distance because each line has its own width.
      if (headlineRef.current) {
        const wrap = headlineRef.current;
        const kids = Array.from(wrap.children) as HTMLElement[];
        const prose = kids.filter((k) => /^(H1|P)$/.test(k.tagName));
        const blocks = kids.filter((k) => !prose.includes(k));

        gsap.set(wrap, { alignItems: "flex-start", textAlign: "start" });

        // The distance a line sits from the start edge when the block is
        // centred is half the space it does not fill.
        const slack = (el: HTMLElement) => {
          const off = (wrap.offsetWidth - el.offsetWidth) / 2;
          return rtl ? -off : off;
        };

        splitRef.current = SplitText.create(prose, {
          type: "lines",
          // Re-splits when the display face finishes loading and on resize,
          // both of which change where the lines break.
          autoSplit: true,
          onSplit: (self) => {
            // A line box spans its parent's full width by default, which would
            // make its slack zero and leave it pinned. Shrinking it to the text
            // is what gives each line something to measure.
            gsap.set(self.lines, { width: "fit-content" });
            const movers = [...blocks, ...(self.lines as HTMLElement[])];

            return gsap
              .timeline({
                scrollTrigger: {
                  trigger: runway.current,
                  start: "top top",
                  // Settles well before the rail changes ends, so the two
                  // moments stay legible as separate beats.
                  end: () =>
                    "+=" +
                    ((runway.current?.offsetHeight ?? 0) - window.innerHeight) *
                      0.6,
                  scrub: 0.6,
                  invalidateOnRefresh: true,
                },
              })
              .fromTo(
                wrap,
                { x: 0 },
                { x: () => headlineShift(), ease: "none" },
                0,
              )
              .fromTo(
                movers,
                { x: (_i, t: HTMLElement) => slack(t) },
                { x: 0, ease: "none" },
                0,
              );
          },
        });
      }
    }, runway);

    return () => {
      stopWatching();
      splitRef.current?.revert();
      // Also what puts the rail back where its stylesheet says it belongs when
      // a window is dragged down past md mid-sequence.
      ctx.revert();
    };
  }, [pass]);

  return (
    // The runway collapses to a single screen when motion is reduced, in CSS
    // rather than from the effect below: the effect bails out and leaves the
    // sequence unplayed, and a 240vh runway with nothing happening in it is
    // just a screen and a half of dead scrolling. CSS also keeps the server and
    // client markup identical.
    <>
      <div
        ref={runway}
        data-hero-runway
        className={cn(
          // Desktop only. Below md the hero is MobileHero — a swipe track with
          // the mark as its first frame — so this runway is not shortened for a
          // phone, it is not rendered on one.
          "relative hidden h-[170vh] motion-reduce:h-dvh md:block md:h-[240vh]",
          className,
        )}
      >
        <div
          ref={stage}
          data-hero-stage
          className="sticky top-0 flex h-dvh flex-col overflow-hidden bg-navy-900 pb-[4.5rem] text-cream-100"
        >
          {/* The art spans the whole stage, including the strip the readout sits
            on. The band is glass, so it needs something behind it to refract;
            bounded to the column above it there was nothing there but its own
            ground. */}
          <div ref={fieldRef} className="absolute inset-0">
            {field}
          </div>
          <div
            ref={backdropRef}
            className="absolute inset-0 opacity-0 motion-reduce:opacity-100"
          >
            {backdrop}
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center">
            {copyGround}
            {slideCopy}
            {/* The copy is its own layer so the clearance handback can move it
              without moving the art. Translating the whole column lifted the
              frame off the readout by half a rail and opened a band of bare
              navy above the numbers. */}
            <div
              ref={contentRef}
              className="relative flex w-full flex-col items-center gap-6 text-center sm:gap-8 lg:gap-9"
            >
              <div
                ref={logoRef}
                data-hero-lockup
                className="w-full will-change-transform"
              >
                {logo}
              </div>
              {/* Holds the copy inside the page gutter. Without it the block is
                free to fill the viewport, and on a phone it ran to within 3px of
                both edges — which also left the move to the start edge almost no
                distance to travel. */}
              <div className="flex w-full justify-center px-[var(--gutter)]">
                <div
                  ref={headlineRef}
                  data-hero-headline
                  className="flex flex-col items-center gap-5 sm:gap-6"
                >
                  {headline}
                </div>
              </div>
            </div>

            {controls}
          </div>

          {/* The readout belongs to the pinned composition from md up, sitting on
            the strip at the foot of the stage. On a phone it moves out, so the
            copy area gets the whole screen and the numbers are a scroll away.
            Rendered in both places and hidden in one: a sticky box and its
            sibling are separate overflow contexts, and no amount of CSS moves a
            single element between them. `hidden` is display:none, so the copy
            that is off is out of the accessibility tree too. */}
          <div className="hidden md:block">{children}</div>
        </div>

        {/* Stand-in for the rail's lockup, holding the corner between the moment
          the dotted mark lands there and the moment the rail arrives to take
          over. Fixed and outside the stage on purpose: parked inside, it rode
          the hero off the top of the screen and left the corner empty for the
          whole of the rail's climb. */}
        <div
          ref={solidRef}
          aria-hidden
          data-hero-standin
          className="page-shell pointer-events-none fixed inset-x-0 top-0 z-50 h-[4.5rem] opacity-0"
        >
          <div className="flex h-full items-center">{solidLogo}</div>
        </div>
      </div>

      {/* After the runway, not inside it. The stage is sticky and therefore
          positioned, so anything static that follows it inside the runway is
          painted underneath and scrolls past unseen: measured at -674px, gone
          before the hero ever unpinned. Out here the numbers arrive when the
          sequence has finished. */}
      <div className="md:hidden">{children}</div>
    </>
  );
}
