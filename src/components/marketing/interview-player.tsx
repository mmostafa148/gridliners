"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

/**
 * The interview film, on the post itself.
 *
 * **It does not autoplay and it does not preload.** The poster stands until a
 * reader asks for the film, so a page opened on a metered connection costs a
 * frame rather than a download, and `controls` appear the moment it is playing
 * because this one is being watched rather than used as scenery.
 */
export function InterviewPlayer({
  src,
  poster,
  title,
}: {
  src: string;
  poster: string;
  title: string;
}) {
  const t = useTranslations("post");
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="m-0">
      <div className="relative aspect-video w-full overflow-hidden bg-navy-950">
        {playing ? (
          <video
            src={src}
            poster={poster || undefined}
            controls
            autoPlay
            playsInline
            className="size-full object-contain"
            title={title}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={t("watchTitle")}
            className="group size-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            style={
              poster
                ? { backgroundImage: `url(${poster})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {/* The scrim does not lift on hover. It used to, and the label
                measured 3.58:1 over the brightest posters at rest and worse
                once the image brightened - so the affordance moved onto the
                play circle, which can grow without changing what is behind the
                words. A fixed scrim is legible in every state. */}
            <span aria-hidden className="absolute inset-0 bg-navy-950/65" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="flex size-20 items-center justify-center rounded-full bg-cream-50 text-navy-950 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Play aria-hidden fill="currentColor" strokeWidth={0} className="size-8 translate-x-0.5 rtl:-translate-x-0.5 rtl:-scale-x-100" />
              </span>
              <span className="font-display text-coord uppercase text-cream-50">
                {t("watchTitle")}
              </span>
            </span>
          </button>
        )}
      </div>
    </figure>
  );
}
