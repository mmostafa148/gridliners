import { PixelGrid } from "@/components/brand/pixel-grid";
import { Eyebrow } from "@/components/account/system";

/**
 * The focused composition the four authentication screens share.
 *
 * **Inside the website's frame, not instead of it.** The header, the footer,
 * the language control and the site's identity are all still there; this is one
 * section of a page, the way every other section on this site is.
 *
 * It opens on navy — the ground the public inner pages open on — and puts the
 * form on white beside it, because a form is filled rather than looked at. The
 * pixel field is the identity's own material and is the only ornament: these
 * are four short forms and the boldness belongs to the site around them.
 */
export function AuthScreen({
  eyebrow,
  title,
  lead,
  aside,
  formPanelClassName = "bg-cream-50",
  fullDesktopHeight = false,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  /** One sentence on the navy side — what the account is for. */
  aside: string;
  formPanelClassName?: string;
  fullDesktopHeight?: boolean;
  children: React.ReactNode;
}) {
  return (
    // The fixed rail's clearance, owned here for the same reason `PageHeader`
    // owns its own: `SiteFrame`'s <main> clears the announcement bar and no
    // more, and from md the rail sits under it.
    //
    // `data-account` marks these as part of the participant module: it carries
    // the module's single type face and its Arabic letter-spacing reset.
    <div
      data-account
      className={`grid md:pt-[4.5rem] lg:grid-cols-[5fr_7fr] ${
        fullDesktopHeight ? "lg:min-h-[calc(100dvh-var(--announce-h))]" : ""
      }`}
    >
      {/* The navy side. Below lg it becomes a band above the form rather than
          disappearing, so the page still opens the way an inner page does. */}
      <aside className="relative isolate overflow-hidden bg-navy-950 text-cream-50">
        <div aria-hidden className="pointer-events-none absolute end-0 top-0 -z-10 opacity-90">
          <PixelGrid
            direction="start"
            seed={7}
            cols={7}
            rows={6}
            density={0.34}
            cellSize="clamp(1.5rem, 3vw, 2.75rem)"
            cellClassName="bg-cream-200/14"
          />
        </div>
        <div className="page-shell flex h-full flex-col justify-end gap-5 py-14 lg:py-20">
          <Eyebrow tone="onNavy">{eyebrow}</Eyebrow>
          <p className="max-w-[26ch] font-display text-account-section leading-tight text-cream-100">
            {aside}
          </p>
        </div>
      </aside>

      {/* The cool paper is the quiet ground; the white sheet is the task. */}
      <div
        className={`flex items-start justify-center px-5 py-10 sm:px-8 sm:py-14 lg:items-center lg:px-12 lg:py-20 ${formPanelClassName}`}
      >
        <div className="relative isolate w-full max-w-[34rem] overflow-hidden border border-navy-900/10 bg-white/90 px-6 py-8 shadow-[0_24px_80px_rgba(8,24,55,0.09)] sm:px-9 sm:py-10">
          <div aria-hidden className="absolute inset-x-0 top-0 flex h-1">
            <span className="w-20 bg-blue-700" />
            <span className="w-6 bg-gold" />
            <span className="flex-1 bg-navy-900/8" />
          </div>
          <span
            aria-hidden
            className="absolute end-5 top-5 size-2 border border-navy-900/20 bg-[#f3f3f9]"
          />

          <h1 className="max-w-[15ch] font-display text-account-title text-navy-900">{title}</h1>
          <p className="mt-3 max-w-[36ch] text-body-lg leading-relaxed text-navy-700">{lead}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
