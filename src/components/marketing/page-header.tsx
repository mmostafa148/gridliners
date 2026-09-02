import { PixelGrid } from "@/components/brand/pixel-grid";
import { cn } from "@/lib/utils";

/**
 * One cell size for both passes and for the offset between them, so the two
 * grids stay locked to the same lattice at every width. Two clamps that drift
 * apart by a pixel put every square half a step out and the motif turns to
 * noise.
 */
const CELL = "clamp(2.75rem, 5.6vw, 6.5rem)";
/** The same lattice at a phone's scale. */
const CELL_SM = "clamp(2rem, 9vw, 2.75rem)";

/**
 * The opening plate of a page that is not Home.
 *
 * Home opens with a full-screen scrubbed hero on photography. Nothing else on
 * the site earns that, and copying it eight more times would spend the one
 * gesture the site has on every page equally. So an inner page opens on the
 * ceremonial ground with type and geometry, and no photograph at all.
 *
 * **Every inner page opens here, including About.** A photographic opening for
 * About was built and rejected: at full height on a picture it stopped being a
 * page header and became a second hero, which is the one thing an inner page
 * must not be. The identity is carried by geometry instead.
 *
 * The thesis takes the start columns and the lead sits on the end side at its
 * foot, so the two read as a statement and its caption rather than as two
 * stacked paragraphs.
 *
 * `text-h1`. A header names the page; it does not announce it. The display
 * sizes were tried here in turn and each one read as a headline competing with
 * the sections below rather than labelling them — so the title now sits at the
 * same step as a section heading, and position, eyebrow and the pixel field do
 * the work of saying where the reader is.
 *
 * **Rail clearance lives here.** From md up the navigation rail docks under the
 * announcement bar on every page except Home, and `main` only clears the bar.
 * The remaining rail-height belongs to whichever component guarantees it is
 * first on the page, and for an inner page that is this one — build-state
 * mandates it. Putting it here means no route-aware server layout and no
 * second nav tree.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow?: string;
  /**
   * `ReactNode`, not `string`, since 1.8.
   *
   * Seven screens pass a plain string and still do. A project page's title is
   * **entry content**, which is never translated (§3.8) and has to carry its
   * own `lang` and `dir` so an Arabic submission stays right-to-left inside an
   * English page - and that means an element, not a string. Widening the type
   * changes nothing any existing caller renders.
   */
  title: React.ReactNode;
  lead?: string;
  /** Anything the page wants under the plate, e.g. a status line or actions. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-navy-950 text-cream-100",
        className,
      )}
    >
      {/* The identity, at the size the brand actually draws it. The deck's
          pixel field is built from large squares breaking off a solid mass;
          rendered small it stops being the motif and turns into texture, which
          is what a 2.75rem cell in a twelve-column strip was doing here.

          Big boxes, on the side, dissolving toward the type. Two tones rather
          than one — the deck's fields are never a single flat value, and a
          second pass at a different scale and opacity is what stops a grid of
          squares reading as a loading state.

          Below the rail, not behind it. At `top-0` the dissolve ran underneath
          a bar of the same navy and lost its first rows to it. */}
      {/* A phone gets its own field rather than the desktop one shrunk. Six
          columns of a 2.75rem cell is 264px, which is two thirds of a 390
          screen and lands the whole motif behind the headline. Three columns
          of a smaller cell reads as the same device at the size the width can
          carry. */}
      <div
        aria-hidden
        className="pointer-events-none absolute end-0 top-0 sm:hidden"
      >
        <PixelGrid
          direction="start"
          seed={7}
          cols={3}
          rows={4}
          density={0.45}
          cellSize={CELL_SM}
          cellClassName="bg-cream-200/10"
        />
        <PixelGrid
          direction="start"
          seed={23}
          cols={2}
          rows={3}
          density={0.34}
          cellSize={CELL_SM}
          cellClassName="bg-blue-700/30"
          className="absolute"
          style={{ insetInlineEnd: CELL_SM, top: CELL_SM }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute end-0 top-0 hidden sm:block md:top-[4.5rem]"
      >
        <PixelGrid
          direction="start"
          seed={7}
          cols={6}
          rows={6}
          density={0.42}
          cellSize={CELL}
          cellClassName="bg-cream-200/10"
        />
        {/* The second pass is offset by one cell in both axes so it interleaves
            with the first instead of stacking on it. Laid on the same origin
            the two grids agree cell for cell and the result is one flat block
            with a tint, which is the opposite of a dissolve. */}
        <PixelGrid
          direction="start"
          seed={23}
          cols={4}
          rows={4}
          density={0.3}
          cellSize={CELL}
          cellClassName="bg-blue-700/30"
          className="absolute"
          style={{ insetInlineEnd: CELL, top: CELL }}
        />
      </div>

      <div className="page-shell section-y relative md:pt-[calc(var(--section-y)+4.5rem)]">
        {/* The type stacks on the start side and the pixel field owns the end
            side. The lead used to sit in the end columns, which put it on top
            of the field: legible, but it read as two things that had landed in
            the same place rather than a composition. */}
        <div className="lg:w-7/12">
          {eyebrow ? (
            <p className="font-display text-coord uppercase text-cream-200/70">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "max-w-[24ch] text-h1 text-cream-100",
              eyebrow && "mt-5",
            )}
          >
            {title}
          </h1>
          {lead ? (
            <p className="mt-7 max-w-prose text-body-lg text-cream-100/85">
              {lead}
            </p>
          ) : null}
        </div>

        {children}
      </div>
    </section>
  );
}
