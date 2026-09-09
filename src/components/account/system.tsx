import { cn } from "@/lib/utils";

/**
 * The participant module's visual system.
 *
 * **Derived from measurements of the approved website, not generic dashboard
 * references.** The first pass set every label, control and action in the 11px tracked-uppercase
 * coordinate voice and put every object inside a bordered white rectangle;
 * build-state §49 records why that was rejected.
 *
 * Three rules replace it:
 *
 * 1. **Rank comes from size and space, not from a border.** A 42px title over
 *    17px body over 13px metadata is a hierarchy. Eleven-pixel capitals
 *    everywhere is a texture.
 * 2. **Uppercase is for eyebrows and the cycle's own action.** Everything a
 *    reader chooses between — a destination, a tier, an action — is sentence
 *    case at 15–16px, exactly as the approved tier tabs and category tiles are.
 * 3. **Ground carries meaning.** Navy is the institution speaking, white is
 *    reading and form work, mist groups operational content, blue is the
 *    current action, gold is an award. Every page changes ground at least once.
 */

/* ---------------------------------------------------------------- type --- */

/** An eyebrow. The one place tracked uppercase belongs. */
export function Eyebrow({
  children,
  tone = "blue",
  className,
}: {
  children: React.ReactNode;
  tone?: "blue" | "quiet" | "onNavy" | "gold" | "goldOnNavy";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-display text-overline uppercase",
        tone === "blue" && "text-blue-700",
        tone === "quiet" && "text-navy-600",
        tone === "onNavy" && "text-cream-200/70",
        tone === "gold" && "text-gold-deep",
        // On navy the deep gold measures 2.8:1. The metal itself measures 7.4:1.
        tone === "goldOnNavy" && "text-gold",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** A major section heading. 27.4px at 1440, 24px on a phone. */
export function SectionTitle({
  children,
  className,
  id,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "h2" | "h3";
}) {
  // The size is concatenated, not merged.
  //
  // `cn()` runs tailwind-merge, which classifies an unknown `text-*` token as a
  // COLOUR and drops it when a real colour follows - so every heading in this
  // module silently rendered at the inherited 16px instead of 27.4. The scale
  // is declared in `lib/utils.ts` for exactly this reason, but a structural
  // size has no business depending on that declaration staying in step: it is
  // not something a caller may override, so it never enters the merge.
  return (
    <Tag id={id} className={`font-display text-account-section ${cn("text-navy-900", className)}`}>
      {children}
    </Tag>
  );
}

/** A card, row or action heading. 19.4px at 1440. */
export function ItemTitle({
  children,
  className,
  as: Tag = "h3",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4" | "p" | "span";
}) {
  return (
    <Tag className={`font-display text-account-card ${cn("text-navy-900", className)}`}>
      {children}
    </Tag>
  );
}

/**
 * A labelled figure: an id, a date, a reference, an amount.
 *
 * `font-data` with tabular numbers, and **only** for something genuinely
 * comparable down a column. Prose never gets this voice.
 */
export function Figure({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "font-data tabular-nums",
        size === "sm" && "text-[0.8125rem] tracking-[0.04em]",
        size === "md" && "text-body-sm",
        size === "lg" && "text-data-lg",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Metadata. 13px, sentence case, never smaller. */
export function Meta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-caption text-navy-600", className)}>{children}</span>;
}

/* ------------------------------------------------------------- surfaces --- */

/**
 * A titled band.
 *
 * **Ground, not border.** `plain` sits on whatever is behind it; `mist` groups
 * related operational content; `navy` is the institution speaking. A border is
 * only drawn where `bordered` is asked for, which is where a real boundary
 * exists.
 */
export function AccountSection({
  title,
  eyebrow,
  lead,
  action,
  ground = "plain",
  children,
  className,
  id,
}: {
  title?: React.ReactNode;
  eyebrow?: string;
  lead?: string;
  action?: React.ReactNode;
  ground?: "plain" | "mist" | "navy" | "white";
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const onNavy = ground === "navy";
  return (
    <section
      data-motion-panel
      className={cn(
        ground === "mist" && "bg-mist",
        ground === "white" && "bg-white",
        onNavy && "bg-navy-950 text-cream-50",
        className,
      )}
    >
      {title || action ? (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="min-w-0">
            {eyebrow ? (
              <Eyebrow tone={onNavy ? "onNavy" : "quiet"} className="mb-2">
                {eyebrow}
              </Eyebrow>
            ) : null}
            {title ? (
              <SectionTitle id={id} className={onNavy ? "text-cream-50" : undefined}>
                {title}
              </SectionTitle>
            ) : null}
            {lead ? (
              <p
                className={cn(
                  "mt-1.5 max-w-[62ch] text-body-sm",
                  onNavy ? "text-cream-200/85" : "text-navy-700",
                )}
              >
                {lead}
              </p>
            ) : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* -------------------------------------------------------------- actions --- */

/**
 * The four action weights.
 *
 * **Sentence case at 15px, 48px tall** — the height the approved site's own
 * buttons are, and the case its structural controls use. The first pass set
 * every action in 11px tracked capitals, which made a primary action and a
 * table label look like the same object.
 */
const ACTION_BASE = cn(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap px-4",
  "text-[0.875rem] font-medium leading-none transition-colors",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
  "disabled:cursor-not-allowed",
);

export const accountAction = {
  /** The one thing this screen most wants done. */
  primary: cn(ACTION_BASE, "bg-navy-900 text-cream-50 hover:bg-blue-700 disabled:bg-navy-400"),
  /** Available, and quieter. A hairline, not a heavy outline. */
  secondary: cn(
    ACTION_BASE,
    "border border-navy-900/25 bg-white text-navy-900 hover:border-navy-900/60 hover:bg-navy-50",
    "disabled:border-navy-900/12 disabled:text-navy-500",
  ),
  /** Low-priority navigation. Reads as a link because it is one. */
  quiet: cn(
    "inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-blue-700 underline underline-offset-4",
    "transition-colors hover:text-navy-900",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
  ),
  /** Explicit and separate. Never sits beside a primary. */
  destructive: cn(
    ACTION_BASE,
    "border border-destructive/45 bg-white text-destructive-ink hover:bg-destructive hover:text-white",
  ),
  /** On navy. The focus ring inverts with it: blue on navy is not visible. */
  onNavy: cn(
    ACTION_BASE,
    "bg-cream-100 text-navy-950 hover:bg-white",
    "focus-visible:outline-cream-100",
  ),
  /** A secondary action, on navy. */
  onNavySecondary: cn(
    ACTION_BASE,
    "border border-cream-50/40 text-cream-50 hover:bg-cream-50 hover:text-navy-950",
    "focus-visible:outline-cream-100",
  ),
  /** A link-weight action, on navy. */
  onNavyQuiet: cn(
    "inline-flex items-center gap-2 text-[0.9375rem] font-medium text-cream-100",
    "underline underline-offset-4 transition-colors hover:text-white",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100",
  ),
  /** Compact, for a row's own action. Still 44px and still sentence case. */
  row: cn(
    "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap px-3.5",
    "text-[0.8125rem] font-medium leading-none transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
  ),
};

export const accountRowAction = {
  primary: cn(accountAction.row, "bg-navy-900 text-cream-50 hover:bg-blue-700"),
  secondary: cn(
    accountAction.row,
    "border border-navy-900/25 bg-white text-navy-900 hover:border-navy-900/60 hover:bg-navy-50",
  ),
};

/* ----------------------------------------------------------- structures --- */

/** Labelled facts. A real definition list, generously spaced. */
export function AccountDataList({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
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

export function AccountDatum({
  label,
  children,
  figure,
  onNavy,
}: {
  label: string;
  children: React.ReactNode;
  /** Set for ids, dates, references and amounts. */
  figure?: boolean;
  onNavy?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className={cn("text-caption", onNavy ? "text-cream-200/65" : "text-navy-600")}>
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 break-words",
          onNavy ? "text-cream-50" : "text-navy-900",
          figure ? "font-data text-body-sm tabular-nums" : "text-body-md",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

/**
 * Nothing here yet.
 *
 * A ground change and generous space rather than a dashed rectangle: an empty
 * list is a moment in the account, not an error.
 */
export function AccountEmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-navy-900/12 bg-mist/60 px-6 py-12 text-center">
      <SectionTitle as="h3">{title}</SectionTitle>
      <p className="mx-auto mt-2.5 max-w-[52ch] text-body-sm text-navy-700">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** The row rhythm for a list that is genuinely compared down a column. */
export const accountRow = "border-b border-navy-900/10 last:border-b-0";

/* ---------------------------------------------------------- filter bars --- */

/**
 * A filter chip, a page step, a search field and its button.
 *
 * **All four were 11px tracked capitals**, which is what made every listing in
 * this module read as one undifferentiated field of labels. They are controls a
 * participant clicks; they take the same 15px sentence case the actions do, and
 * a 40-44px target.
 */
const CONTROL_FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

export const accountChip = {
  base: cn(
    "inline-flex h-9 items-center gap-2 border px-3.5 text-[0.8125rem] font-medium transition-colors",
    CONTROL_FOCUS,
  ),
  on: "border-navy-900 bg-navy-900 text-cream-50",
  off: "border-navy-900/20 bg-white text-navy-700 hover:border-navy-900/55 hover:bg-navy-50",
};

export const accountStep = {
  base: cn(
    "inline-flex h-10 min-w-10 items-center justify-center border px-3.5 text-[0.875rem] font-medium transition-colors",
    CONTROL_FOCUS,
  ),
  on: "border-navy-900 bg-navy-900 text-cream-50",
  off: "border-navy-900/20 bg-white text-navy-800 hover:border-navy-900 hover:bg-navy-50",
  disabled: "border-navy-900/10 text-navy-900/55",
};

export const accountField = cn(
  "h-10 w-full border border-navy-900/25 bg-white px-3 text-body-sm text-navy-900",
  "placeholder:text-navy-600 hover:border-navy-900/45",
  "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-700",
);

/** The label above a filter group or a search field. Readable, sentence case. */
export function FieldLabel({
  htmlFor,
  children,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const Tag = htmlFor ? "label" : "span";
  return (
    <Tag
      htmlFor={htmlFor}
      className={cn("block text-body-sm font-medium text-navy-700", className)}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------- surfaces --- */

/**
 * A panel: one job, on its own surface.
 *
 * **Why the account has panels and the public pages do not.** A public page is
 * read top to bottom and its sections are separated by changing the ground
 * beneath the whole viewport. An account screen is *scanned*: a participant
 * arrives looking for one thing among six, and full-bleed bands give them no
 * edge to find it by. A panel does — it starts and ends somewhere, it owns its
 * title and its action, and six of them stack into a page whose structure is
 * legible before a word is read.
 *
 * Square, hairline, white on the module's tinted ground. No radius, no shadow,
 * no gradient: the identity's geometry is a pixel grid and the panel is one
 * cell of it.
 *
 * `padded={false}` hands the horizontal rhythm to the content — a table or a
 * row list needs its cells to reach the panel's edge, and `PANEL_X` is the
 * inset those rows should use so they line up with the panel's own header.
 */
export const PANEL_X = "px-5 sm:px-7";

export function AccountPanel({
  title,
  titleAs = "h2",
  action,
  lead,
  padded = true,
  children,
  className,
  id,
}: {
  title?: React.ReactNode;
  titleAs?: "h2" | "h3";
  action?: React.ReactNode;
  lead?: string;
  padded?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      data-motion-panel
      // The id sits on the panel, not on its heading: a link to a panel should
      // bring the panel's own top edge into view, and `scroll-mt` clears the
      // fixed rail so the heading is not left under it.
      id={id}
      className={cn("scroll-mt-28 border border-navy-900/10 bg-white", className)}
    >
      {title || action ? (
        <div className={cn("border-b border-navy-900/10 py-4", PANEL_X)}>
          {/* The action stays on the title's line whatever the lead does: in a
              narrow panel a wrapping lead used to push it onto a third row. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <SectionTitle as={titleAs}>{title}</SectionTitle>
            {action ? (
              <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div>
            ) : null}
          </div>
          {lead ? (
            <p className="mt-1.5 max-w-[68ch] text-body-sm text-navy-600">{lead}</p>
          ) : null}
        </div>
      ) : null}
      <div className={cn(padded && `py-6 ${PANEL_X}`)}>{children}</div>
    </section>
  );
}

/**
 * The stack panels sit in.
 *
 * One gap value for the whole module, so every account screen has the same
 * rhythm however many panels it holds.
 */
export function AccountStack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-5", className)}>{children}</div>;
}

/* ----------------------------------------------------------------- tables --- */

/**
 * The table's own parts, in one place.
 *
 * A management table is not a grid of hairlines. What makes one readable is a
 * header that reads as a header, a row that responds when it is pointed at, and
 * numbers that line up — none of which the first pass had.
 *
 * `TABLE_HEAD` tints the header band so it reads as chrome rather than as the
 * first row of data. `TABLE_ROW` gives every row the same height and a hover
 * tint. Numeric columns take `TABLE_NUM`, which is what makes a column of money
 * comparable down its length.
 */
export const TABLE_HEAD = cn(
  "bg-mist/70 py-3 text-start align-middle",
  "text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-navy-600",
);

export const TABLE_ROW = cn(
  "border-b border-navy-900/8 transition-colors last:border-b-0",
  "hover:bg-mist/50 focus-within:bg-mist/50",
);

export const TABLE_CELL = "py-3.5 align-middle";

export const TABLE_NUM = "font-data tabular-nums";

/**
 * A state, as a chip.
 *
 * **Not the 11px outlined capsule §49 rejected.** That was ten identical
 * capsules in tracked capitals telling a reader nothing. This is 13px sentence
 * case on a tint of the state's own colour, with the marker still there — so a
 * column of states is scannable by colour and readable by word, and colour is
 * never the only signal.
 *
 * Every tint is light enough that the ink over it clears AA; the tones are
 * checked by `verify-contrast-account.mjs` like everything else.
 */
export function StatusChip({
  label,
  tone,
  className,
}: {
  label: string;
  tone: "neutral" | "waiting" | "progress" | "good" | "closed" | "adverse";
  className?: string;
}) {
  const styles = {
    neutral: "bg-navy-900/6 text-navy-800",
    waiting: "bg-campaign-yellow/30 text-navy-900",
    progress: "bg-blue-700/8 text-blue-800",
    good: "bg-finalist/12 text-blue-800",
    closed: "bg-navy-900/5 text-navy-600",
    adverse: "bg-destructive/8 text-destructive-ink",
  }[tone];

  const dot = {
    neutral: "bg-navy-400",
    waiting: "bg-campaign-yellow",
    progress: "bg-blue-700",
    good: "bg-finalist",
    closed: "bg-navy-300",
    adverse: "bg-destructive",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap px-2.5 py-1 text-body-sm font-medium",
        styles,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0", dot)} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ notes --- */

/**
 * A note: something true of everything below it.
 *
 * The module had four of these written four ways — a grey sentence with an
 * `Info` icon on My Votes, two hairline-bordered paragraphs on My Awards, a
 * campaign-yellow block in the wizard. None of them looked like a notice; they
 * looked like body copy that had lost its paragraph.
 *
 * One element, three tones. A tinted ground and a start edge in the tone's own
 * colour — the same device `Obligations` uses to mark urgency — so a note is
 * recognisable before it is read, and is never mistaken for the content it is
 * about.
 */
export function AccountNote({
  tone = "info",
  icon: Icon,
  title,
  children,
  className,
}: {
  tone?: "info" | "caution" | "quiet";
  /** A lucide icon. Optional: the tone carries most of the meaning. */
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    info: "border-blue-700 bg-blue-700/5",
    caution: "border-campaign-orange bg-campaign-yellow/12",
    quiet: "border-navy-900/25 bg-mist/60",
  }[tone];

  const ink = {
    info: "text-blue-700",
    caution: "text-campaign-orange",
    quiet: "text-navy-500",
  }[tone];

  return (
    <div className={cn("flex gap-3 border-s-2 px-4 py-3.5", styles, className)}>
      {Icon ? <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", ink)} /> : null}
      <div className="min-w-0">
        {title ? (
          <p className="mb-0.5 text-body-sm font-semibold text-navy-900">{title}</p>
        ) : null}
        <div className="max-w-[80ch] text-body-sm leading-relaxed text-navy-700">{children}</div>
      </div>
    </div>
  );
}

/**
 * A count, beside the thing it counts.
 *
 * A total belongs next to the page's own title, not floated to the far end of a
 * panel header where it reads as an orphan.
 */
export function CountPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center bg-navy-900/6 px-2.5 py-1",
        "font-data text-[0.8125rem] tabular-nums text-navy-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
