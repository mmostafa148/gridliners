"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";

import type { MediaAsset } from "@/lib/media";

/**
 * A held year's ceremony photography, and the viewer it opens into.
 *
 * Only years whose ceremony has taken place reach this component - see
 * `EventOverview`, which decides that from the cycle's phase. A frame here is
 * always a record of a night that happened.
 *
 * **Built on Radix's Dialog primitive rather than `components/ui/dialog.tsx`.**
 * That file is a popover: `max-w-sm`, `rounded-xl`, `bg-popover`, `p-4`, and a
 * centred translate. A full-viewport image viewer shares none of it, and
 * overriding eight geometry utilities through `cn()` is fighting the component
 * instead of using it. What is worth having is underneath: the focus trap,
 * `aria-modal`, Escape, the portal and the scroll lock all come from Radix
 * either way. `shared/otp-modal.tsx` is the precedent for a controlled Radix
 * dialog in this build; this one just wears different clothes.
 *
 * **The keys are mirrored, because the layout is.** In RTL the next frame lies
 * toward the start edge, which is the left, so ArrowLeft advances and
 * ArrowRight retreats - the reverse of LTR. Direction is read off the document
 * the way `hero-stage.tsx` reads it, since this component lives outside `ui/`
 * where `rtl:` variants are permitted, and the chevrons are chosen the same way
 * so the button a reader presses points where they expect to go.
 *
 * **The alt text stays empty.** These frames are placeholders whose year is not
 * established (`fixtures/content.ts` says so), and a viewer that announced
 * "the 2025 ceremony in Amman" would assert exactly the provenance the data
 * cannot support. The caption beside them carries the city, and it is text.
 */
export function CeremonyFrames({
  frames,
  city,
  caption,
}: {
  frames: MediaAsset[];
  /** For the viewer's accessible name, so it is not announced as "dialog". */
  city: string;
  /**
   * The city and venue, laid over the hero frame.
   *
   * A sibling of the button rather than a child of it, with pointer events off
   * so the frame beneath still takes the click. Inside the button it would have
   * been swallowed by the button's own `aria-label`, and since this section no
   * longer carries a separate description list, that would have left the city
   * unannounced anywhere on the page.
   */
  caption: React.ReactNode;
}) {
  const t = useTranslations("finalists.event");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rtl, setRtl] = useState(false);

  // The frame that opened the viewer, so focus can go back to it. Radix
  // restores focus to the trigger it controls; this dialog has no single
  // trigger, so the thumbnail that was clicked is remembered instead.
  const openedBy = useRef<HTMLButtonElement | null>(null);

  const many = frames.length > 1;

  useEffect(() => {
    setRtl(document.documentElement.dir === "rtl");
  }, []);

  const step = useCallback(
    (delta: number) => {
      // Wraps rather than clamping. A viewer of a handful of frames is a loop,
      // and a disabled arrow at each end is two dead controls.
      setIndex((i) => (i + delta + frames.length) % frames.length);
    },
    [frames.length],
  );

  useEffect(() => {
    if (!open || !many) return;
    const onKey = (event: KeyboardEvent) => {
      // Escape is Radix's, deliberately not handled here.
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(rtl ? 1 : -1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(rtl ? -1 : 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, many, rtl, step]);

  const openAt = (i: number, el: HTMLButtonElement) => {
    openedBy.current = el;
    setIndex(i);
    setOpen(true);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
  };

  // Toward the start edge is "previous" in LTR and "next" in RTL, so the glyph
  // is picked by direction rather than by role.
  const StartChevron = rtl ? ChevronRight : ChevronLeft;
  const EndChevron = rtl ? ChevronLeft : ChevronRight;

  const current = frames[index];

  return (
    <>
      {/* The hero frame at full width, then the rest as a strip of thumbnails
          beneath it.

          The rest were a second column of a two-up grid first, which put a hole
          the size of a photograph beside every year that has exactly one of
          them - and with the coverage the client has supplied so far, that is
          every year. A strip has no hole: one thumbnail reads as one
          thumbnail, and four read as a row. */}
      <ul className="mt-12 flex flex-wrap gap-4 lg:mt-16">
        {frames.map((frame, i) => (
          <li
            key={frame.src}
            className={
              i === 0
                ? "relative w-full"
                : "relative w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)]"
            }
          >
            <button
              type="button"
              onClick={(event) => openAt(i, event.currentTarget)}
              aria-label={t("openFrame", { n: i + 1, total: frames.length })}
              className="group relative block w-full overflow-hidden bg-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              style={{ aspectRatio: i === 0 ? "16 / 9" : "3 / 2" }}
            >
              <Image
                src={frame.src}
                alt=""
                fill
                sizes={
                  i === 0
                    ? "(max-width: 1024px) 100vw, 1200px"
                    : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                }
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </button>

            {i === 0 ? (
              <>
                {/* The type has to bring its own ground with it: these frames
                    are art-directed as shot and run from near-black to a lit
                    projection screen. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-7 sm:p-9 lg:p-11">
                  {caption}
                </div>
              </>
            ) : null}
          </li>
        ))}
      </ul>

      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-950/95 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            // Radix returns focus to the trigger it owns, and this dialog has
            // no single trigger - every frame opens it. Restoring focus from
            // `onOpenChange` was tried first and lost the race: Radix's own
            // close-focus handling runs afterwards and sent focus to the body,
            // stranding a keyboard reader at the top of the document. This hook
            // is the one that runs last.
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              openedBy.current?.focus();
            }}
            className="fixed inset-0 z-50 flex flex-col outline-none"
          >
            <DialogPrimitive.Title className="sr-only">
              {t("viewerTitle", { city })}
            </DialogPrimitive.Title>

            <div className="flex items-center justify-between gap-6 px-5 py-4 sm:px-8">
              {/* The counter is the viewer's only chrome text, and it is absent
                  when there is nothing to count through. */}
              {many ? (
                <p className="font-data text-data-sm tabular-nums text-cream-200">
                  {t("counter", { n: index + 1, total: frames.length })}
                </p>
              ) : (
                <span />
              )}
              <DialogPrimitive.Close
                aria-label={t("closeViewer")}
                className="flex size-11 items-center justify-center text-cream-100 transition-colors hover:bg-cream-100/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
              >
                <X className="size-5" aria-hidden />
              </DialogPrimitive.Close>
            </div>

            <div className="relative flex-1">
              <Image
                key={current.src}
                src={current.src}
                alt=""
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {many ? (
              <div className="flex items-center justify-center gap-3 px-5 py-5 sm:px-8">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t("previousFrame")}
                  className="flex size-12 items-center justify-center text-cream-100 transition-colors hover:bg-cream-100/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                >
                  <StartChevron className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t("nextFrame")}
                  className="flex size-12 items-center justify-center text-cream-100 transition-colors hover:bg-cream-100/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                >
                  <EndChevron className="size-6" aria-hidden />
                </button>
              </div>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
