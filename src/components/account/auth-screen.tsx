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
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  /** One sentence on the navy side — what the account is for. */
  aside: string;
  formPanelClassName?: string;
  children: React.ReactNode;
}) {
  return (
    // The fixed rail's clearance, owned here for the same reason `PageHeader`
    // owns its own: `SiteFrame`'s <main> clears the announcement bar and no
    // more, and from md the rail sits under it.
    //
    // `data-account` marks these as part of the participant module: it carries
    // the module's single type face and its Arabic letter-spacing reset.
    <div data-account className="grid md:pt-[4.5rem] lg:grid-cols-[5fr_7fr]">
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

      {/* Cream, not white: it is the ground the account itself opens on, so
          signing in leads onto the same paper rather than onto a new one. */}
      <div
        className={`flex items-start justify-center px-6 py-14 lg:items-center lg:py-20 ${formPanelClassName}`}
      >
        {/* Not a floating card. It is one column of the page, and the page is
            the site's own - the frame around it is doing the framing. */}
        <div className="w-full max-w-[30rem]">
          <h1 className="font-display text-account-title text-navy-900">{title}</h1>
          <p className="mt-4 text-body-lg text-navy-700">{lead}</p>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
