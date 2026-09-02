"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState } from "react";

import { DrawnPortrait } from "@/components/brand/drawn-marks";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { NewsItem } from "@/lib/api/types";

/**
 * Winner interviews: the person, what they said, and the film.
 *
 * The Sitemap's Winner Interviews branch names four things - name, description,
 * image and interview video - and all four are here. The **portrait is drawn**,
 * because attaching a real face to an invented name misrepresents somebody who
 * never agreed to appear.
 *
 * **The film plays in a viewer, not in the card.** Four autoplaying videos in a
 * row is a page that fights the reader; the poster and the control say what is
 * there, and the film downloads when somebody asks for it.
 */
export function InterviewStrip({
  interviews,
  locale,
}: {
  interviews: NewsItem[];
  locale: Locale;
}) {
  const t = useTranslations("news");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState<string | null>(null);
  const playing = interviews.find((i) => i.slug === open);

  if (!interviews.length) return null;

  return (
    <section aria-labelledby="interviews-title" className="bg-navy-950 text-cream-50">
      <div className="page-shell section-y">
        {/* The heading stands alone. It carried a lead sentence beside it and
            the client removed it: the three cards below say who these people
            are far better than a line above them can. */}
        <h2 id="interviews-title" className="max-w-[16ch] text-balance text-h1">
          {t("interviewsTitle")}
        </h2>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {interviews.map((item) => {
            const person = item.interview;
            if (!person) return null;
            return (
              <li key={item.slug} className="flex h-full flex-col">
                <button
                  type="button"
                  onClick={() => setOpen(item.slug)}
                  aria-label={`${t("watch")}: ${person.name[locale]}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden bg-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : null}
                  <span aria-hidden className="absolute inset-0 bg-navy-950/45" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-cream-50 text-navy-950 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                      <Play aria-hidden fill="currentColor" strokeWidth={0} className="size-6 translate-x-0.5 rtl:-translate-x-0.5 rtl:-scale-x-100" />
                    </span>
                  </span>
                </button>

                <div className="mt-5 flex items-start gap-4">
                  <DrawnPortrait
                    seed={person.portraitSeed}
                    title={person.name[locale]}
                    className="size-14 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-h4 leading-tight text-cream-50">{person.name[locale]}</p>
                    <p className="mt-1 font-display text-coord uppercase text-cream-200/75">
                      {person.role[locale]}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-body-md text-cream-200/85">{item.excerpt[locale]}</p>

                <Link
                  href={`/news/${item.slug}`}
                  className="mt-auto pt-5 font-display text-coord uppercase text-cream-100 underline underline-offset-4 transition-colors hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                >
                  {t("readMore")}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <DialogPrimitive.Root open={Boolean(open)} onOpenChange={(v) => setOpen(v ? open : null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-navy-950 data-open:animate-in data-open:fade-in-0 motion-reduce:animate-none" />
          <DialogPrimitive.Content
            aria-label={playing?.interview?.name[locale] ?? ""}
            className="fixed inset-0 z-[60] flex flex-col focus:outline-none"
          >
            <DialogPrimitive.Title className="sr-only">
              {playing?.title[locale] ?? ""}
            </DialogPrimitive.Title>
            <div className="flex justify-end p-4">
              <DialogPrimitive.Close
                aria-label={tCommon("close")}
                className="flex size-11 items-center justify-center text-cream-100 transition-colors hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
              >
                <X aria-hidden className="size-6" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center p-4 pt-0">
              {playing?.interview ? (
                /* Mounted with the dialog, so nothing downloads until asked. */
                <video
                  src={playing.interview.videoUrl}
                  poster={playing.interview.posterUrl || undefined}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-full max-w-full"
                />
              ) : null}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}
