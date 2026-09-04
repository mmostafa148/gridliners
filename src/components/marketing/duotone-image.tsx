import Image from "next/image";

import type { MediaAsset } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Photography, graded into the palette.
 *
 * Every photograph on this site passes through here. Raw, the event coverage
 * is mixed-white-balance stage lighting that reads as a press gallery pasted
 * into a brand; graded to navy shadows and cream highlights it belongs to the
 * palette, and future photography drops in without art direction on the shoot.
 */
export function DuotoneImage({
  asset,
  alt,
  sizes,
  priority,
  className,
  imageClassName,
  intensity = "full",
  children,
}: {
  asset: MediaAsset;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** `soft` keeps more of the original colour for portraits. */
  intensity?: "full" | "soft";
  children?: React.ReactNode;
}) {
  return (
    <div
      data-motion-media
      className={cn("duotone overflow-hidden bg-navy-950", className)}
    >
      <Image
        src={asset.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("duotone-img object-cover", imageClassName)}
      />
      <div className={cn("duotone-wash", intensity === "soft" && "opacity-75")} aria-hidden />
      <div className="duotone-lift" aria-hidden />
      <div className="grain-layer" aria-hidden />
      {children}
    </div>
  );
}
