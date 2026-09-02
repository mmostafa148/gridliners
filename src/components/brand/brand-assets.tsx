import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Wrappers around the 15 production SVGs in `public/brand/` (copied verbatim
 * from `resources/brand/`).
 *
 * Rules encoded here, from CLAUDE.md:
 *  - Logo artwork keeps its exported #0932c6 / #1e1e1e fills. Never recolor.
 *  - doty-lockup.svg is white artwork, so it is always placed on blue.
 *  - Images are `unoptimized`: these are vector marks, and running them
 *    through the image optimizer would need `dangerouslyAllowSVG`.
 */

/** Intrinsic dimensions read from each file's viewBox. */
const ASSET = {
  "logo-icon": { w: 64.77, h: 64.77 },
  "logo-horizontal": { w: 415.28, h: 64.77 },
  "logo-vertical": { w: 334.12, h: 130.97 },
  "logo-logotype": { w: 335.15, h: 40.95 },
  "social-icon": { w: 282.04, h: 282.04 },
  "badge-gold": { w: 149.87, h: 242.37 },
  "badge-silver": { w: 149.87, h: 242.37 },
  "badge-bronze": { w: 149.87, h: 242.37 },
  "badge-blue": { w: 149.87, h: 242.37 },
  "badge-black": { w: 149.87, h: 242.37 },
  "winner-frame-gold": { w: 262.4, h: 262.4 },
  "winner-frame-silver": { w: 262.4, h: 262.4 },
  "winner-frame-bronze": { w: 262.4, h: 262.4 },
  "winner-year-2026": { w: 840.88, h: 186.67 },
  "doty-lockup": { w: 216.23, h: 216.23 },
  // Reversed lockups. The deck ships no white variant, so these are derived
  // from the originals: identical geometry, fills forced to white. Requested
  // for dark surfaces, where the dark artwork cannot sit without a plate.
  "logo-horizontal-reversed": { w: 415.28, h: 64.77 },
  "logo-vertical-reversed": { w: 334.12, h: 130.97 },
  "logo-icon-reversed": { w: 64.77, h: 64.77 },
  "logo-logotype-reversed": { w: 335.15, h: 40.95 },
} as const;

export type BrandAssetName = keyof typeof ASSET;

/** Award levels that map to a metal colorway. */
export type MedalLevel = "gold" | "silver" | "bronze";
/** Every badge colorway: metals + finalist (blue) + honorary (black). */
export type BadgeColorway = MedalLevel | "finalist" | "honorary";

const BADGE_FILE: Record<BadgeColorway, BrandAssetName> = {
  gold: "badge-gold",
  silver: "badge-silver",
  bronze: "badge-bronze",
  finalist: "badge-blue",
  honorary: "badge-black",
};

interface BrandAssetProps extends Omit<React.ComponentProps<typeof Image>, "src" | "alt" | "width" | "height"> {
  name: BrandAssetName;
  alt: string;
  /** Rendered height in px; width follows the intrinsic aspect ratio. */
  height?: number;
}

export function BrandAsset({ name, alt, height = 64, className, ...props }: BrandAssetProps) {
  const { w, h } = ASSET[name];
  return (
    <Image
      src={`/brand/${name}.svg`}
      alt={alt}
      width={Math.round((w / h) * height)}
      height={height}
      unoptimized
      className={cn("h-auto max-w-full", className)}
      {...props}
    />
  );
}

export function Logo({
  variant = "horizontal",
  tone = "default",
  height = 40,
  alt = "Gridliners",
  className,
}: {
  variant?: "horizontal" | "vertical" | "icon" | "logotype";
  /** `reversed` is the white lockup, for dark surfaces. */
  tone?: "default" | "reversed";
  height?: number;
  alt?: string;
  className?: string;
}) {
  const base = variant === "icon" ? "logo-icon" : `logo-${variant}`;
  const name = (tone === "reversed" ? `${base}-reversed` : base) as BrandAssetName;
  return <BrandAsset name={name} alt={alt} height={height} className={className} />;
}

export function AwardBadge({
  colorway,
  height = 96,
  alt,
  className,
}: {
  colorway: BadgeColorway;
  height?: number;
  alt: string;
  className?: string;
}) {
  return <BrandAsset name={BADGE_FILE[colorway]} alt={alt} height={height} className={className} />;
}

export function WinnerFrame({
  level,
  height = 160,
  alt,
  className,
}: {
  level: MedalLevel;
  height?: number;
  alt: string;
  className?: string;
}) {
  return (
    <BrandAsset
      name={`winner-frame-${level}` as BrandAssetName}
      alt={alt}
      height={height}
      className={className}
    />
  );
}

export function WinnerYear({ height = 72, alt, className }: { height?: number; alt: string; className?: string }) {
  return <BrandAsset name="winner-year-2026" alt={alt} height={height} className={className} />;
}

/**
 * Designer of the Year lockup. The artwork is white, so this component owns
 * its blue backdrop — it must never render on a light surface.
 */
export function DotyLockup({
  height = 140,
  alt,
  className,
  padding = "p-8",
}: {
  height?: number;
  alt: string;
  className?: string;
  padding?: string;
}) {
  return (
    <div className={cn("inline-flex items-center justify-center bg-blue-700", padding, className)}>
      <BrandAsset name="doty-lockup" alt={alt} height={height} />
    </div>
  );
}

export const BRAND_ASSET_NAMES = Object.keys(ASSET) as BrandAssetName[];

/* ---------------------------------------------------------------------------
 * Foil plates
 *
 * The deck's gold, silver and bronze foils are classified in
 * resources/manifest.md as production-asset source, and are curated into
 * public/brand/texture/ alongside the SVGs.
 *
 * They are NOT used in the web UI. Tried as a surface under the metal award
 * bars, they read as a cheap gradient: foil is a print effect that depends on
 * a physical light response, and flattened to a JPEG it just looks like a
 * 90s texture fill. They are kept here for the certificate and Winners
 * Package artwork in Phase 2.7 / 3.1, which are printed or downloaded assets.
 * ------------------------------------------------------------------------ */

export const FOIL: Record<MedalLevel, string> = {
  gold: "/brand/texture/foil-gold.jpg",
  silver: "/brand/texture/foil-silver.jpg",
  bronze: "/brand/texture/foil-bronze.jpg",
};
