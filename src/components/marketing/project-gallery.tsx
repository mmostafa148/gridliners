"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback, useEffect, useState } from "react";

import { ProjectPlaceholder } from "@/components/shared/project-placeholder";
import type { ProjectImage } from "@/lib/project-media";
import { cn } from "@/lib/utils";

/**
 * The gallery: four to seven frames of one project.
 *
 * The content map requires a cover **and** a gallery. The entry's gallery slots
 * remain visible even before entrant photography exists; each unresolved slot
 * uses the shared project placeholder and real media replaces it in place.
 *
 * **The composition follows the pictures, not a fixed grid.** A frame wider
 * than 3:2 takes the full measure; the rest pair up. So a set of landscapes
 * reads as a sequence of plates and a set of uprights reads as pairs, and
 * **no image is cropped to fit a slot** - each keeps the ratio it was shot at,
 * which is what makes six frames look like one body of work rather than six
 * thumbnails.
 *
 * **Built on Radix's Dialog primitive rather than `components/ui/dialog.tsx`**,
 * for the reason `ceremony-frames.tsx` gives: a viewer is a full-bleed surface
 * with its own chrome, not a panel with a title and a close button in the
 * corner. That component belongs to approved, closed 1.6 and is typed on a
 * ceremony's city and caption, so this is a `[dupe]` beside the mark-map,
 * `Scrim` and the retired winner sheet - same reasoning each time.
 *
 * Arrow keys move; in Arabic the chevrons swap so the button a reader presses
 * points where they expect to go.
 */
export function ProjectGallery({
  images,
  title,
  framed = false,
}: {
  images: ProjectImage[];
  title: string;
  /**
   * Draw a hairline around each plate.
   *
   * Opt-in and **off by default**, so 1.8's project page renders exactly as it
   * was approved. The award page asks for it: its plates sit on a lighter band
   * directly under a ruled strip, and without an edge a pale frame dissolves
   * into the ground the way it does not on the project page.
   */
  framed?: boolean;
}) {
  const t = useTranslations("project.gallery");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (!images.length) return null;

  const current = images[index];

  return (
    /**
     * Two columns of equal width, filled top to bottom.
     *
     * **The editorial rhythm was the thing that read as disorder.** Frames took
     * the full measure, then two thirds, then a third, then an inset third, so
     * every row began and ended somewhere different and the column edges never
     * lined up twice. It was composed, but what it looked like was a pile.
     *
     * A multi-column flow fixes the edges without cropping anything: the column
     * width is constant, each frame keeps the ratio it was drawn at, and the
     * flow closes the gaps that a fixed grid would leave under the short ones.
     */
    <section aria-labelledby="gallery-title" className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        {/* Named on the page, not only to a screen reader: an unlabelled run of
            pictures reads as a continuation of the text above it. */}
        <h2
          id="gallery-title"
          className="font-display text-coord uppercase text-navy-600"
        >
          {t("label")}
        </h2>

        {/* Plates of one size, on a grid that lines up.
            The flow before this kept the column edges straight but left the two
            columns at different lengths and every frame at a different height,
            so the run still read as a pile. Every cell is the same shape now -
            and because the artwork is generated, it is *drawn* at that shape
            rather than cropped into it, so nothing is lost to the frame. */}
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-12">
          {images.map((img, at) => {
            const key = img.kind === "file" ? img.src : `art-${img.spec.index}`;
            const caption =
              img.kind === "file"
                ? `${String(img.order + 1).padStart(2, "0")} — ${img.shows.toUpperCase()}`
                : "PROJECT PREVIEW";
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => { setIndex(at); setOpen(true); }}
                  aria-label={t("open", { index: at + 1, total: images.length })}
                  className={cn(
                    "group relative block aspect-[4/3] w-full overflow-hidden bg-white",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
                    framed && "border border-[#ddd]",
                  )}
                >
                  {img.kind === "file" ? (
                    /* Contained, not covered: a curated kit's frames carry
                       their own lettering, and a crop to fit the plate would
                       cut it off. */
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 45vw"
                      className="object-contain transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <ProjectPlaceholder
                      slug={`${img.spec.seed}-${img.spec.index}-${title}`}
                      title={title}
                      parentId={img.spec.parentId}
                      className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  )}
                </button>
                {/* The caption as text, at one size for every frame. Drawn into
                    the SVG it was 22px on a 1600px canvas, which is a different
                    size in every cell and unreadable in most of them. */}
                <p className="mt-3 font-display text-coord uppercase text-navy-600">
                  {caption}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          {/* Opaque, not 95%. The z-order was never the problem - the viewer
              sits at 60 and the docked rail at 50 - but the header's cream
              nav and gold action read straight through the remaining 5%, so
              the lightbox looked as though it had failed to open. A gallery
              viewer wants the work isolated anyway. */}
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy-950 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none" />
          <DialogPrimitive.Content
            aria-label={title}
            // z-60: the docked navigation rail sits at z-50 and was legible
            // through a 95% overlay, which read as the viewer failing to open.
            className="fixed inset-0 z-[60] flex flex-col focus:outline-none"
          >
            <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {t("counter", { index: index + 1, total: images.length })}
            </DialogPrimitive.Description>

            <div className="flex items-center justify-between p-5 text-cream-100 lg:p-7">
              <span aria-live="polite" className="font-data text-data-sm tabular-nums">
                {t("counter", { index: index + 1, total: images.length })}
              </span>
              <DialogPrimitive.Close
                aria-label={t("close")}
                className="flex size-11 items-center justify-center border border-cream-100/30 transition-colors hover:bg-cream-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
              >
                <X aria-hidden className="size-5" />
              </DialogPrimitive.Close>
            </div>

            <div className="relative flex-1 px-5 pb-5 lg:px-7 lg:pb-7">
              {current.kind === "file" ? (
                <Image
                  key={current.src}
                  src={current.src}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              ) : (
                /* Drawn frames scale in the viewer rather than being upscaled:
                   the artefact is vector, so the lightbox is where it is
                   actually worth opening. */
                <ProjectPlaceholder
                  key={`art-${current.spec.index}`}
                  slug={`${current.spec.seed}-${current.spec.index}-${title}`}
                  title={title}
                  parentId={current.spec.parentId}
                  className="absolute inset-0 size-full [&>*]:h-full"
                />
              )}
            </div>

            <div className="flex items-center justify-center gap-4 p-5 text-cream-100 lg:p-7">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t("prev")}
                className="flex size-11 items-center justify-center border border-cream-100/30 transition-colors hover:bg-cream-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
              >
                <ChevronLeft aria-hidden className="size-5 rtl:-scale-x-100" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t("next")}
                className="flex size-11 items-center justify-center border border-cream-100/30 transition-colors hover:bg-cream-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
              >
                <ChevronRight aria-hidden className="size-5 rtl:-scale-x-100" />
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}
