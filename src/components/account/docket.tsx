import { cn } from "@/lib/utils";

/**
 * The operational language every participant screen is written in.
 *
 * **The docket.** An entry in this system is identified four ways at once - an
 * id, a cycle, a coordinate in the taxonomy, a state - and the public site
 * already has a grammar for exactly that: the project card's `VI·02 / CORP`
 * coordinate, the identity's pixel marker, the monospaced figure. This carries
 * it inward.
 *
 * Three rules hold across the module:
 *
 * 1. **An identifier is monospaced.** Entry ids, payment ids, invoice numbers,
 *    references and codes are `font-data` and tabular, so a column of them
 *    aligns and two of them can be compared by eye.
 * 2. **A label is a coordinate.** `font-display text-coord uppercase` for the
 *    name of a fact, sentence case for the fact itself. The reader learns one
 *    rule and can then skim any screen.
 * 3. **A ground means something.** White is a record. Mist is the frame around
 *    it. Navy is the programme speaking. Gold is an award and nothing else.
 */

/** A monospaced identifier. The one way an id is ever set. */
export function Ident({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-data text-data-sm tabular-nums text-navy-600", className)}>
      {children}
    </span>
  );
}

/** The name of a fact, above or beside the fact itself. */
export function Coord({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-display text-coord uppercase text-navy-600", className)}>
      {children}
    </span>
  );
}

/**
 * One labelled fact.
 *
 * `<dl>` semantics without forcing every caller to own a definition list:
 * `Facts` supplies the list, `Fact` the pair.
 */
export function Facts({
  children,
  className,
  columns = 2,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-8 gap-y-5",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function Fact({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  /** For identifiers and figures. */
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="font-display text-coord uppercase text-navy-600">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-words text-navy-900",
          mono ? "font-data text-data-sm tabular-nums" : "text-body-md",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

/**
 * A panel: the module's only container.
 *
 * White on the mist ground with a hairline, square, no shadow. Shadows and
 * radii are what make an operational screen look like a template; a rule and a
 * change of ground are enough to say "this is one thing".
 */
export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "li";
}) {
  return (
    <Tag className={cn("border border-navy-900/12 bg-white", className)}>{children}</Tag>
  );
}

/** A panel's head: what it is, and anything that acts on the whole of it. */
export function PanelHead({
  title,
  id,
  action,
  className,
}: {
  title: React.ReactNode;
  id?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-navy-900/12 px-5 py-3.5",
        className,
      )}
    >
      <h2 id={id} className="font-display text-coord uppercase text-navy-600">
        {title}
      </h2>
      {action}
    </div>
  );
}

/**
 * The body of an account page.
 *
 * **No gutters of its own.** `AccountPage` already put the content inside the
 * website's `page-shell`, which is the same measure every public page uses;
 * this only carries the page's internal rhythm. The rejected app frame had its
 * own padding scale here and that is exactly how the area came to look like a
 * different site (build-state §47).
 */
export function ScreenBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("page-shell section-y", className)}>{children}</div>;
}

/**
 * A full-width band with its own ground, breaking out of the page shell.
 *
 * The approved public pages change ground by running a section edge to edge and
 * putting the shell back inside it. The account pages do the same, which is
 * what stops them reading as one long white sheet.
 */
export function Band({
  children,
  ground = "mist",
  className,
}: {
  children: React.ReactNode;
  ground?: "mist" | "white" | "navy" | "blue";
  className?: string;
}) {
  return (
    <div
      className={cn(
        ground === "mist" && "bg-mist",
        ground === "white" && "bg-white",
        ground === "navy" && "bg-navy-950 text-cream-50",
        ground === "blue" && "bg-blue-700 text-cream-50",
        className,
      )}
    >
      <div className="page-shell section-y">{children}</div>
    </div>
  );
}

/**
 * Nothing here yet, and what to do about it.
 *
 * Every list in the module has one, because a newly registered account sees
 * every list empty on its first visit and a blank panel reads as a failure.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-navy-900/25 bg-white px-6 py-14 text-center">
      <p className="text-h3 text-navy-900">{title}</p>
      <p className="mx-auto mt-3 max-w-[46ch] text-body-md text-navy-600">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** The module's action styles. Two weights, and no third. */
export const actionPrimary = cn(
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap bg-navy-900 px-5",
  "font-display text-coord uppercase text-cream-50 transition-colors hover:bg-blue-700",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
);

export const actionQuiet = cn(
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap border border-navy-900/30 px-5",
  "font-display text-coord uppercase text-navy-900 transition-colors hover:bg-navy-900 hover:text-cream-50",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
);

/** A figure in USD, set the way every figure in the module is set. */
export function Money({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cn("font-data tabular-nums", className)}>
      ${amount.toLocaleString("en-US", { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })}
    </span>
  );
}
