import { cn } from "@/lib/utils";

/**
 * The brand's stepped squares as an ambient field.
 *
 * Every cell fades between its own two opacities on its own duration and
 * delay, so the field breathes without ever pulsing in unison or settling into
 * a visible loop. Only opacity animates, so the whole thing composites on the
 * GPU; a few hundred spans changing opacity is cheaper than one repainting
 * gradient.
 *
 * Timings come from a deterministic hash rather than Math.random: the server
 * and the client must agree on the markup, and a given `seed` should always
 * produce the same field rather than a new one on every render.
 *
 * Density falls away toward the middle of the frame. The centre is where the
 * lockup and the copy sit, and a field that competes with them is decoration;
 * one that thickens at the edges is a frame.
 */

function hash(seed: number, x: number, y: number, salt = 0): number {
  let h = (seed * 374761393 + x * 668265263 + y * 2246822519 + salt * 3266489917) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export interface PixelFieldProps {
  /** Cell edge in px. These are meant to read as large pixels, not texture. */
  cell?: number;
  /** Columns and rows generated. Overflow is clipped by the parent. */
  cols?: number;
  rows?: number;
  seed?: number;
  /** Peak share of cells lit, at the edges of the frame. */
  density?: number;
  className?: string;
}

export function PixelField({
  cell = 56,
  cols = 40,
  rows = 26,
  seed = 1,
  density = 0.3,
  className,
}: PixelFieldProps) {
  const cells: React.ReactNode[] = [];
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Normalised distance from the centre, 0 in the middle to 1 at a corner.
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const radial = Math.min(1, Math.hypot(dx, dy));
      // Quiet core, thickening outward.
      const chance = density * Math.pow(radial, 2.2);
      if (hash(seed, x, y) > chance) continue;

      const r1 = hash(seed, x, y, 1);
      const r2 = hash(seed, x, y, 2);
      const r3 = hash(seed, x, y, 3);

      // A handful of cells sit brighter and hold longer, so the field has
      // accents rather than one uniform shimmer.
      const accent = r3 > 0.93;
      const lo = 0.015 + r1 * 0.03;
      const hi = accent ? 0.16 + r2 * 0.1 : 0.05 + r2 * 0.07;

      cells.push(
        <span
          key={`${x}-${y}`}
          className={cn("pixel-cell", accent ? "bg-blue-400" : "bg-cream-200")}
          style={{
            insetInlineStart: x * cell,
            top: y * cell,
            width: cell,
            height: cell,
            // Long, unequal cycles: nothing lines up, so nothing reads as a loop.
            animationDuration: `${7 + r1 * 11}s`,
            animationDelay: `-${r2 * 18}s`,
            ["--lo" as string]: lo.toFixed(3),
            ["--hi" as string]: hi.toFixed(3),
          }}
        />,
      );
    }
  }

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {cells}
    </div>
  );
}
