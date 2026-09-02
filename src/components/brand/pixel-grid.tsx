import { cn } from "@/lib/utils";

/**
 * The pixel-grid motif from Brand Guidelines V3.0 — a solid field that breaks
 * into stepped squares as it dissolves.
 *
 * The composition is generated from a deterministic hash (never Math.random),
 * so server and client render identical markup and a given `seed` always
 * produces the same result.
 *
 * Two things keep it reading as a designed motif rather than as noise:
 *  - each column has a stepped boundary, so the solid mass stays contiguous
 *    and breaks along a staircase instead of dissolving into salt-and-pepper;
 *  - loose pixels only appear just beyond that boundary, thinning out with
 *    distance.
 *
 * The dissolve axis is expressed logically (`start`/`end`), so the motif
 * mirrors under RTL.
 */

export type PixelGridDirection = "start" | "end" | "up" | "down";
export type PixelGridVariant = "corner" | "edge-band" | "fade" | "full-bleed";

const VARIANT_SHAPE: Record<
  PixelGridVariant,
  { cols: number; rows: number; density: number }
> = {
  corner: { cols: 6, rows: 6, density: 0.55 },
  "edge-band": { cols: 32, rows: 3, density: 0.5 },
  fade: { cols: 10, rows: 6, density: 0.6 },
  "full-bleed": { cols: 24, rows: 12, density: 0.45 },
};

/** Deterministic 32-bit hash — same cell always resolves to the same value. */
function hash(seed: number, x: number, y: number): number {
  let h = (seed * 374761393 + x * 668265263 + y * 2246822519) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export interface PixelGridProps extends React.ComponentProps<"div"> {
  variant?: PixelGridVariant;
  /** Direction the mosaic dissolves toward. Logical, so RTL mirrors it. */
  direction?: PixelGridDirection;
  /** Changes the composition without changing the shape. */
  seed?: number;
  /** Overrides the variant's column count. Ignored when `cellSize` is set. */
  cols?: number;
  /** Overrides the variant's row count. */
  rows?: number;
  /** 0–1. How much of the field is solid before the dissolve begins. */
  density?: number;
  /**
   * Fixed cell edge (any CSS length), producing a block of exactly
   * cols × rows cells at that size. Without it, cells are fractions of the
   * container width — which in a wide container makes them very large.
   */
  cellSize?: string;
  /** Tailwind color utilities applied to the cells, e.g. "bg-blue-700". */
  cellClassName?: string;
}

export function PixelGrid({
  variant = "fade",
  direction = "end",
  seed = 1,
  cols,
  rows,
  density,
  cellSize,
  cellClassName,
  className,
  style,
  ...props
}: PixelGridProps) {
  const shape = VARIANT_SHAPE[variant];
  const columnCount = cols ?? shape.cols;
  const rowCount = rows ?? shape.rows;
  const fill = density ?? shape.density;

  const horizontal = direction === "start" || direction === "end";
  const alongCount = horizontal ? columnCount : rowCount;
  const acrossCount = horizontal ? rowCount : columnCount;

  // One stepped boundary per lane, so the solid mass breaks along a staircase.
  const boundary: number[] = [];
  for (let lane = 0; lane < acrossCount; lane++) {
    const jitter = hash(seed, lane, 991) - 0.5;
    boundary.push((fill + jitter * 0.38) * alongCount);
  }

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < columnCount; x++) {
      const along = horizontal ? x : y;
      const lane = horizontal ? y : x;
      // Progress runs 0 at the solid end → 1 at the dissolved end.
      const progress =
        direction === "end" || direction === "down"
          ? along
          : alongCount - 1 - along;

      const edge = boundary[lane];
      let on: boolean;
      if (progress < edge - 1) {
        on = true; // solid core
      } else {
        // Loose pixels past the boundary, thinning out over ~4 cells so the
        // mass scatters rather than stopping at a hard edge.
        const beyond = progress - edge + 1;
        on = hash(seed, x, y) < Math.max(0, 0.9 - beyond * 0.24);
      }

      cells.push(
        <span
          key={`${x}-${y}`}
          aria-hidden
          data-on={on || undefined}
          className={cn(
            cellSize ? undefined : "aspect-square",
            on ? cellClassName ?? "bg-blue-700" : "bg-transparent",
          )}
          style={cellSize ? { width: cellSize, height: cellSize } : undefined}
        />,
      );
    }
  }

  return (
    <div
      aria-hidden
      // overflow-hidden matters: without it, fractional cells in a short
      // container paint far outside their box.
      className={cn("grid gap-0 overflow-hidden", cellSize ? "w-fit" : "w-full", className)}
      style={{
        gridTemplateColumns: cellSize
          ? `repeat(${columnCount}, ${cellSize})`
          : `repeat(${columnCount}, minmax(0, 1fr))`,
        ...style,
      }}
      {...props}
    >
      {cells}
    </div>
  );
}
