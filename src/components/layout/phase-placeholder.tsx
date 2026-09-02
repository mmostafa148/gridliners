/**
 * Marker for routes whose real screen arrives in a later phase. Phase 0 ships
 * shells, not screens (see docs/gridliners-screen-map.md), so these keep the
 * four layouts reachable and RTL-verifiable in the browser.
 */
export function PhasePlaceholder({
  phase,
  title,
  description,
}: {
  phase: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="page-shell flex flex-col items-start gap-6 py-16">
      {/* These strings are English-authored scaffolding. Without lang/dir the
          Latin text inherits the page's RTL context and its punctuation flips
          to the wrong end of the line on /ar. */}
      <div lang="en" dir="ltr" className="space-y-3 text-start">
        <p className="font-display text-coord uppercase text-blue-700">{phase}</p>
        <h1 className="text-display-md">{title}</h1>
        {description ? (
          <p className="max-w-prose text-body-md text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
