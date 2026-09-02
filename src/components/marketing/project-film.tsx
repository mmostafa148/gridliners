"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState } from "react";

import { ProjectArt } from "@/components/marketing/project-art";
import type { ProjectImage } from "@/lib/project-media";

/**
 * The film, as a plate you press rather than a line you read.
 *
 * It was a text link in a row of two. A film is the largest thing a project can
 * hand a reader after the work itself, and a line of small caps does not say
 * so - this is the project's own frame at full measure with a play control over
 * it.
 *
 * **What pressing it does depends on where the film lives, and the control says
 * which.** A film served from this origin opens in a viewer on the page; an
 * entrant's film hosted elsewhere is a link, because embedding a third-party
 * player on a page that has just asked for an email address is a tracking
 * surface the entrant never agreed to. Same plate either way, so the page reads
 * the same on every project.
 *
 * Built on Radix's Dialog primitive rather than `components/ui/dialog.tsx`, for
 * the reason the gallery gives: a viewer is a full-bleed surface with its own
 * chrome, not a panel with a title and a close button in the corner.
 */
export function ProjectFilm({
  href,
  local,
  cover,
  title,
}: {
  /** The entrant's own film, off-site. */
  href: string | null;
  /** A film served from this origin, which can play in place. */
  local: string | null;
  cover: ProjectImage | null;
  title: string;
}) {
  const t = useTranslations("project");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);

  if (!href && !local) return null;

  const plate = (
    <>
      {cover?.kind === "file" ? (
        <Image
          src={cover.src}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 80vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : cover ? (
        <ProjectArt
          spec={cover.spec}
          ratio={16 / 9}
          caption={false}
          plain
          className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : null}

      {/* Dark enough for the label to hold on a pale cover. 45% measured
          between 3.29 and 4.04:1 across the curated kits - a poster is dimmed
          on purpose, and the play control is what the eye goes to anyway. */}
      <span aria-hidden className="absolute inset-0 bg-navy-950/62 transition-colors group-hover:bg-navy-950/50" />

      <span className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <span className="flex size-20 items-center justify-center rounded-full bg-cream-50 text-navy-950 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 lg:size-24">
          {/* Nudged off centre: a triangle is optically left of the circle's
              middle when its bounding box is centred. It nudges the other way
              in Arabic, where the mark itself is flipped. */}
          <Play
            aria-hidden
            fill="currentColor"
            strokeWidth={0}
            className="size-8 translate-x-0.5 rtl:-translate-x-0.5 rtl:-scale-x-100 lg:size-9"
          />
        </span>
        <span className="font-display text-coord uppercase text-cream-50">
          {t("record.video")}
        </span>
      </span>
    </>
  );

  const shell =
    "group relative block aspect-video w-full overflow-hidden bg-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

  return (
    <section aria-labelledby="film-title">
      <h2 id="film-title" className="sr-only">
        {t("record.video")}
      </h2>

      {local ? (
        <>
          <button type="button" onClick={() => setOpen(true)} className={shell}>
            {plate}
          </button>

          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Portal>
              {/* Opaque, for the reason the gallery records: the header's cream
                  nav reads straight through a 95% overlay and the viewer looks
                  as though it failed to open. */}
              <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy-950 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none" />
              <DialogPrimitive.Content
                aria-label={title}
                className="fixed inset-0 z-[60] flex flex-col focus:outline-none"
              >
                <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                <div className="flex justify-end p-4">
                  <DialogPrimitive.Close
                    className="flex size-11 items-center justify-center text-cream-100 transition-colors hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                    aria-label={tCommon("close")}
                  >
                    <X aria-hidden className="size-6" />
                  </DialogPrimitive.Close>
                </div>
                <div className="flex min-h-0 flex-1 items-center justify-center p-4 pt-0">
                  {/* Mounted with the dialog, so the film only downloads once a
                      reader has asked for it. `controls` because this one is
                      being watched, not used as scenery. */}
                  <video
                    src={local}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full"
                  />
                </div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </>
      ) : (
        <a href={href ?? undefined} target="_blank" rel="noopener noreferrer" className={shell}>
          {plate}
        </a>
      )}
    </section>
  );
}
