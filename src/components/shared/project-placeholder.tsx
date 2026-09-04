import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function seedFrom(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * The honest fallback for fictional/demo projects.
 *
 * It deliberately reads as an unavailable preview rather than as entrant work.
 * The composition is shared across the site, while its title and small seeded
 * details keep neighbouring cards recognisable.
 */
export function ProjectPlaceholder({
  slug,
  title,
  parentId,
  className,
}: {
  slug: string;
  title: string;
  parentId: string;
  className?: string;
}) {
  const seed = seedFrom(slug);
  const markerStart = 8 + (seed % 5) * 3;
  const markerWidth = 7 + (seed % 3) * 2;
  const markerTop = 27 + (seed % 4) * 7;
  const category =
    {
      "visual-identity": "IDENTITY",
      packaging: "PACKAGING",
      type: "TYPE",
      photography: "PHOTOGRAPHY",
      film: "FILM & MOTION",
      digital: "DIGITAL",
      layout: "EDITORIAL",
    }[parentId] ?? "DESIGN";
  const rtl = /[\u0600-\u06ff]/.test(title);

  return (
    <span
      aria-hidden
      className={cn(
        "relative block size-full overflow-hidden bg-[#071733] text-[#f8f4e3]",
        className,
      )}
      style={{
        direction: "ltr",
        backgroundImage:
          "linear-gradient(rgba(144,164,200,.105) 1px, transparent 1px), linear-gradient(90deg, rgba(144,164,200,.105) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }}
    >
      <span className="absolute inset-0 border border-[#d8e0ef]/15" />
      <span className="absolute start-0 top-0 h-1 bg-[#3841df]" style={{ width: `${markerStart}%` }} />
      <span className="absolute top-0 h-1 bg-[#d7aa43]" style={{ insetInlineStart: `${markerStart}%`, width: `${markerWidth}%` }} />

      <span data-placeholder-copy className="absolute inset-x-3 top-3 flex items-center justify-between gap-3 font-display text-[clamp(.45rem,.85vw,.7rem)] font-bold uppercase tracking-[0.18em] sm:inset-x-4 sm:top-4">
        <span className="min-w-0 truncate text-[#f6f0d8]/75">Gridliners / Project preview</span>
        <span className="max-w-[38%] shrink-0 truncate text-end text-[#94a5c3]">{category}</span>
      </span>

      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex aspect-[4/3] h-[32%] min-h-8 max-h-28 items-center justify-center border border-[#edf0e7]/70 bg-[#0b2148] text-[#edf0e7]/90 sm:border-2">
          <ImageIcon strokeWidth={1.35} className="size-[48%]" />
        </span>
      </span>

      <span
        className="absolute size-1.5 rounded-full bg-[#3841df] ring-1 ring-[#d7aa43]/80 ring-offset-4 ring-offset-[#071733] sm:size-2"
        style={{ insetInlineStart: `${markerStart + markerWidth}%`, top: `${markerTop}%` }}
      />

      <span data-placeholder-copy className="absolute inset-x-3 bottom-3 border-t border-[#d8e0ef]/20 pt-2 sm:inset-x-4 sm:bottom-4 sm:pt-3">
        <span
          dir={rtl ? "rtl" : "ltr"}
          className="block truncate font-display text-[clamp(.625rem,1.45vw,1.35rem)] font-semibold leading-none text-[#f8f4e3]"
        >
          {title}
        </span>
      </span>
    </span>
  );
}
