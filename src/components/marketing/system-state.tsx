import { PixelGrid } from "@/components/brand/pixel-grid";

const CELL = "clamp(2.25rem, 4.4vw, 5rem)";

/**
 * The shared shape of a recovery state.
 *
 * 404, the error page and the cycle-closed notice are the same object: a code,
 * a sentence that says what happened, a sentence that says what it means for
 * the reader, and the way out. Building each one separately is how three pages
 * that a visitor only ever sees on a bad day end up looking like three
 * different sites.
 *
 * **The brand field is the whole picture.** These pages carry no photography,
 * because nothing has happened worth illustrating, and a stock image on an
 * error page is decoration over an apology. The field is the identity's own
 * material and it is the reason the page reads as Gridliners rather than as a
 * server default.
 */
export function SystemState({
  code,
  title,
  body,
  children,
  actions,
}: {
  code: string;
  title: string;
  body: string;
  /** Anything the specific state adds - dates, links, a follow block. */
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-cream-50">
      <div aria-hidden className="pointer-events-none absolute end-0 top-0 -z-10">
        <PixelGrid
          direction="start"
          seed={11}
          cols={5}
          rows={5}
          density={0.42}
          cellSize={CELL}
          cellClassName="bg-cream-200/10"
        />
        <PixelGrid
          direction="start"
          seed={29}
          cols={3}
          rows={3}
          density={0.3}
          cellSize={CELL}
          cellClassName="bg-blue-700/35"
          className="absolute"
          style={{ insetInlineEnd: CELL, top: CELL }}
        />
      </div>

      <div className="page-shell flex min-h-[clamp(30rem,72svh,44rem)] flex-col justify-center py-20">
        <p className="font-data text-data-lg tabular-nums text-cream-200/70">{code}</p>
        <h1 className="mt-5 max-w-[20ch] text-display-md leading-[1.05] text-balance">{title}</h1>
        <p className="mt-6 max-w-[54ch] text-body-lg text-cream-100/90">{body}</p>
        {children}
        {actions ? <div className="mt-10 flex flex-wrap gap-4">{actions}</div> : null}
      </div>
    </section>
  );
}

/** The filled action on a system page. */
export const systemPrimary =
  "inline-flex h-12 items-center border border-cream-50 bg-cream-50 px-7 font-display text-data-sm uppercase tracking-[0.1em] text-navy-950 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100";

/** The outlined one beside it. */
export const systemSecondary =
  "inline-flex h-12 items-center border border-cream-100/45 px-7 font-display text-data-sm uppercase tracking-[0.1em] text-cream-100 transition-colors hover:border-cream-50 hover:bg-cream-50 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100";
