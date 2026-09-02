"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

import type { HeroSlide, PixelCell } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * The identity's pixel squares, laid over a photograph.
 *
 * The brand deck uses these as large tinted blocks that crowd a frame's edges
 * and thin out toward its subject, so the picture reads through and the motif
 * reads as a system rather than a texture. Two things follow from that and are
 * the whole design of this component:
 *
 * Cells are anchored to a corner and offset in whole units, never spread across
 * the box. A grid that covered the frame would have to be sparse to stay out of
 * the way, and sparse-and-even reads as noise; clustered-and-dense at one corner
 * reads as deliberate.
 *
 * The unit is a fixed square that scales with the viewport, not a fraction of
 * the box. A fraction would stretch with the container and stop being a pixel
 * the moment the hero changed proportion.
 *
 * Placement is authored per slide rather than generated. These have to miss the
 * copy, the controls and the faces in each specific photograph, which is a
 * judgement about that photograph and not something a seed can be asked for.
 */

const TONE: Record<PixelCell["tone"], string> = {
  navy: "var(--color-navy-900)",
  blue: "var(--color-blue-700)",
  purple: "var(--color-campaign-purple)",
  lime: "var(--color-campaign-lime)",
  cream: "var(--color-cream-200)",
};

export function PixelOverlay({ cells }: { cells: PixelCell[] }) {
  return (
    <div
      aria-hidden
      // Starts below the rail. The rail is opaque and pinned to the top by the
      // time the slider is live, so a cluster anchored at the true top edge
      // spends its first row behind it. The bottom is left to bleed under the
      // readout on purpose — that band is glass, so the squares carry through
      // it softened.
      className="pointer-events-none absolute inset-x-0 bottom-0 top-[4.5rem] overflow-hidden [--px:clamp(58px,6.4vw,164px)]"
    >
      {/* The copy's field. Centred on the inline start edge rather than hung
          off a corner, because the copy is centred in the column and a
          corner-anchored cluster lands somewhere different at every height.
          Its trailing edge steps down in whole units, which is the join the
          deck uses between a block and the photograph beside it. */}
      {cells.map((cell, i) => {
        const [ax, ay] = cell.at.split("-") as ["start" | "end", "top" | "bottom"];
        const size = `calc(var(--px) * ${cell.span ?? 1})`;
        return (
          <span
            key={i}
            className="absolute block"
            style={{
              // Logical inline axis, so a cluster placed against the copy's
              // gutter stays against it when the page mirrors.
              [ax === "start" ? "insetInlineStart" : "insetInlineEnd"]:
                `calc(var(--px) * ${cell.x})`,
              [ay === "top" ? "top" : "bottom"]: `calc(var(--px) * ${cell.y})`,
              inlineSize: size,
              blockSize: size,
              backgroundColor: TONE[cell.tone],
              opacity: cell.alpha,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Squares gathered around the copy.
 *
 * Rendered in the copy's own column rather than in the art layer, because the
 * two are different boxes: the art spans the whole stage while the copy is
 * centred in the space above the readout.
 *
 * A smaller unit than the corner clusters. These sit beside type rather than
 * against the edge of a photograph, and at the frame's unit they stopped being
 * squares and became panels.
 */
export function PixelCopyGround({
  cells,
  reveal,
}: {
  cells: HeroSlide["copyCluster"];
  /** Bumped whenever the field should assemble again. */
  reveal: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  // The field builds itself square by square rather than switching on. Each
  // cell has its own resting opacity, so the tween reads its target off the
  // element instead of driving everything to 1 and flattening the rag into the
  // core.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const squares = el.querySelectorAll<HTMLElement>("[data-px]");
    const rest = { opacity: (_i: number, t: HTMLElement) => Number(t.dataset.px), scale: 1 };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(squares, rest);
      return;
    }

    const tw = gsap.fromTo(
      squares,
      // Scaled from the corner nearest the gutter, so the field grows out of
      // the edge it is anchored to rather than blooming from its own middle.
      { opacity: 0, scale: 0.4, transformOrigin: "0% 50%" },
      {
        ...rest,
        duration: 0.45,
        ease: "power3.out",
        // Index order, which is the order the lattice is authored in: row by
        // row from the gutter out. GSAP's grid detection cannot help here — the
        // cells are absolutely positioned, so it has no rows to find.
        //
        // Kept under a second in total. The copy is already on screen while
        // this runs, so a longer build leaves type sitting on a half-made
        // field.
        stagger: { each: 0.018, from: 0 },
      },
    );
    return () => {
      tw.kill();
    };
  }, [reveal, cells]);

  return (
    <div
      ref={root}
      aria-hidden
      // The unit has a floor in rem, not just a viewport term. Keyed to the
      // viewport alone the squares shrank while the copy kept its fixed
      // measure, so below about 1850 the text simply overran them — 8.7:1 at
      // 1850 and 1.02:1 at 768 for the same cluster.
      // hero-copy-ground holds it back until the scroll sequence hands the
      // screen to the picture. It belongs to a slide, and before the slides
      // exist the opening screen is the dotted mark on the ambient field alone.
      className={cn(
        "hero-copy-ground pointer-events-none absolute inset-0 overflow-hidden",
        // The rem floor below exists for desktop, where the copy holds a fixed
        // measure while a vw-only unit shrinks away from it. On a phone the
        // copy is already narrow and that same floor makes one cluster half
        // the screen, so the field stops reading as a ground and starts
        // reading as slabs dropped on the text. Smaller unit under sm only.
        "[--pxc:2.4rem] sm:[--pxc:min(max(3.3vw,4.3rem),6rem)]",
      )}
    >
      {cells.map((cell, i) => (
        <span
          key={i}
          data-px={cell.alpha}
          className="absolute block opacity-0 will-change-transform"
          style={{
            // x is measured from the page shell's start edge, so the cluster
            // keeps its relationship to the copy once the shell stops growing
            // with the viewport. Negative x runs off the screen.
            insetInlineStart: `calc(max(var(--gutter), (100% - var(--container-page)) / 2 + var(--gutter)) + var(--pxc) * ${cell.x})`,
            top: `calc(50% + var(--pxc) * ${cell.y})`,
            // A pixel over, so neighbours overlap instead of meeting exactly.
            // The lattice lands on fractional positions once the container's
            // 50% resolves against an odd height, and the hairline that opened
            // between two cells let the press wall through — enough to take the
            // headline to 1.19:1 at 2400 with the field otherwise covering it
            // completely.
            inlineSize: `calc(var(--pxc) * ${cell.size} + 1px)`,
            blockSize: `calc(var(--pxc) * ${cell.size} + 1px)`,
            backgroundColor: TONE[cell.tone],
          }}
        />
      ))}
    </div>
  );
}
