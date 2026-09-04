import { getTranslations } from "next-intl/server";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { SiteMotion } from "@/components/motion/site-motion";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import { phasePresentation } from "@/lib/cycle-phase";

/**
 * The website's frame — the whole site, public and authenticated alike.
 *
 * **Extracted rather than copied.** Phase 2 first shipped a second frame of its
 * own for the participant area, and the result was a page that looked like a
 * different product: its own sidebar, its own top bar, a second Gridliners
 * logo, and no announcement bar, navigation or footer at all. That direction is
 * recorded and rejected in build-state §47.
 *
 * There is one frame now and both route groups render it, so the two cannot
 * drift: whatever the announcement bar, the header or the footer do on a public
 * page, they do identically on My Entries.
 *
 * What it owns, once:
 *
 * - The announcement bar, and the `--announce-h` / `--chrome-h` variables that
 *   publish how tall the fixed chrome actually is (§37). Nothing downstream may
 *   hard-code that offset.
 * - The header, with its global navigation, the cycle's own action, the
 *   language switcher and the account control.
 * - **One** skip link and **one** `<main>`. Two of either is the defect this
 *   extraction exists to make impossible.
 * - The footer.
 *
 * `children` is the page. An authenticated area adds its own navigation
 * *inside* that page rather than beside it.
 */
export async function SiteFrame({ children }: { children: React.ReactNode }) {
  const [t, tCta] = await Promise.all([
    getTranslations("shell"),
    getTranslations("home.cta"),
  ]);
  // Awaited separately: `check-messages` reads a `Promise.all` positionally and
  // binds one namespace per destructured name, so a non-`getTranslations`
  // member in that array shifts every binding after it.
  const cycle = await api.cycles.getActive();
  const announcement = await api.content.announcement();
  /**
   * Who is signed in, resolved here and passed down.
   *
   * **On the server, once, for the whole frame.** The header's account control
   * is the only account control on the site, so it has to know - and resolving
   * it here rather than inside the control means there is no moment where the
   * header renders logged-out and then corrects itself once some client state
   * catches up. Server and client agree because only the server ever decided.
   */
  const session = await getSession();
  const identity =
    session?.role === "participant"
      ? {
          name: session.name,
          initials:
            session.name
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0] ?? "")
              .join("")
              .toUpperCase() || "?",
        }
      : null;

  // The header's action follows the cycle, from the same map the hero uses, so
  // the two can never disagree about what the site is currently asking for.
  const { primary } = phasePresentation(cycle);

  const announceH = announcement ? "2.5rem" : "0rem";

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={
        {
          "--announce-h": announceH,
          "--chrome-h": `calc(${announceH} + 4.5rem)`,
        } as React.CSSProperties
      }
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <AnnouncementBar />
      <PublicHeader
        action={{ href: primary.href, label: tCta(primary.labelKey) }}
        identity={identity}
      />
      <SiteMotion />
      {/* Cleared for the fixed announcement bar, and on a phone for the rail
          under it as well, since that is where the rail lives below md. Inner
          pages clear the rest themselves — public pages in `PageHeader`, the
          account area in `AccountNav`. */}
      <main
        id="main-content"
        data-site-motion-root
        className="flex-1 pt-[var(--chrome-h)] md:pt-[var(--announce-h)]"
      >
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
