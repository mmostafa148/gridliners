import { getLocale, getTranslations } from "next-intl/server";

import { Logo } from "@/components/brand/brand-assets";
import { SOCIAL_ACCOUNTS } from "@/components/brand/social-icons";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Link } from "@/i18n/navigation";
import { SITE_URL } from "@/lib/site";

/**
 * Public footer — a navy field, which is the brand's ceremonial surface.
 *
 * A colophon, not a stack of bands. The version before this ran five separate
 * rows down the page and each one was mostly empty: a newsletter on one side
 * with eight hundred pixels of nothing beside it, a brand column holding a logo
 * and a single line, and a watermark large enough to need its own band. Length
 * was standing in for substance.
 *
 * So the middle is one ruled plate. The list, the accounts and the sitemap sit
 * in the same four-column lattice, divided by the hairlines the partner wall
 * already uses on this build — gaps over a tinted ground, so every interior
 * rule is drawn exactly once and the plate has no outer frame to box it in. The
 * columns stretch to a common height, which is what makes a lattice read as one
 * object rather than four lists that happen to be adjacent.
 *
 * There is no ask band. One was built here during the 1.1 footer rebuild and it
 * was an unmapped addition: the content map's footer is nav columns, the
 * newsletter, contact, social, legal, the language switcher and the mark, and
 * no CTA. Once pages started owning their own closing CTAs per their map
 * entries, the footer's band repeated whatever the page had just said, in the
 * band directly below it. The footer is utility again, and it stays that way on
 * every page rather than by per-page condition.
 *
 * The mark closes the footer whole, edge to edge, and it is the logotype rather
 * than the lockup. The icon was a third of the artwork's width spent repeating
 * a G that is already in the header and in the logo directly above it; without
 * it the type runs the full viewport at 8.17:1 instead of 6.42:1.
 *
 * It fades out downward. A wordmark this size wants to sit under the page
 * rather than on it, and a gradient is how you get that without dropping the
 * whole thing so faint that the top of it stops reading too. The gradient masks
 * the element that carries the dot mask, rather than compositing two mask
 * layers on one element, because nesting is the version that stays legible.
 *
 * Structured data: an Organization and a WebSite node, which nothing on the
 * site emitted before. sameAs is deliberately absent even though the social
 * links are here — sameAs asserts that these accounts are this organisation,
 * and the handles below are guesses.
 *
 * Two notes carried from the brand audit:
 *  - The mark uses the reversed (white) lockup, a derived asset generated from
 *    the original because the deck ships no white variant.
 *  - Blue #2123bc on navy #0a1a3c is 1.4:1 and effectively invisible, so on
 *    this surface the interactive signal is cream, never blue.
 */

const COLUMNS = [
  {
    heading: "awards",
    links: [
      { href: "/winners", key: "winners" },
      { href: "/finalists", key: "finalists" },
      { href: "/jury-panel", key: "jury" },
      // "Award levels" used to sit here, pointing at `/awards` - a hub that has
      // never existed, so it resolved to the localized 404 from every page on
      // the site, exactly as the header's Awards item did. The header's is a
      // menu over the Sitemap's five branches now; this had no such answer.
      // The Sitemap names no "Award levels" page and the medal system is
      // already on Winners, at the head of this column - so the label is gone
      // rather than pointed somewhere invented. Recorded in build-state §42.
      { href: "/categories", key: "categories" },
    ],
  },
  {
    heading: "participate",
    links: [
      { href: "/how-to-enter", key: "howToEnter" },
      { href: "/register", key: "register" },
      { href: "/partner", key: "partner" },
      { href: "/contact", key: "contact" },
    ],
  },
  {
    heading: "discover",
    links: [
      { href: "/about", key: "about" },
      { href: "/news", key: "news" },
      { href: "/partners", key: "partners" },
    ],
  },
] as const;

export async function PublicFooter() {
  const locale = await getLocale();
  const [tNav, tFooter, tCommon] = await Promise.all([
    getTranslations("nav"),
    getTranslations("footer"),
    getTranslations("common"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: tCommon("siteName"),
        url: SITE_URL,
        description: tCommon("tagline"),
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/brand/logo-horizontal.svg`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: tCommon("siteName"),
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: locale,
      },
    ],
  };

  return (
    // No top margin. The body ground is white, so a margin here painted a white
    // band between the last section and the footer on every page.
    //
    // No bottom padding either: the mark is the last thing and it runs to the
    // edge. That padding used to clear the header rail on pages short enough
    // for it to park at the foot of the viewport; what it would now overlap is
    // the faded end of a decorative mark, which is a trade worth making.
    <footer className="relative overflow-hidden bg-navy-900 text-cream-100">
      {/* The plate. gap-px over a tinted ground draws every interior rule once
          and nothing around the outside, so it divides without boxing.
          It carries the footer's opening air now that the ask band above it is
          gone, on the same `--section-y` every section on the page uses. */}
      <div className="page-shell pt-[var(--section-y)]">
        <div className="grid gap-px bg-cream-200/15 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-7 bg-navy-900 py-10 md:col-span-2 lg:col-span-1 lg:pe-10">
            <div>
              <Link
                href="/"
                aria-label={tCommon("siteName")}
                className="inline-block"
              >
                <Logo variant="horizontal" tone="reversed" height={26} />
              </Link>
              <p className="mt-4 max-w-sm text-body-sm text-cream-200/75">
                {tCommon("tagline")}
              </p>
            </div>

            <div>
              <h2 className="font-display text-coord uppercase text-cream-200/60">
                {tFooter("newsletterTitle")}
              </h2>
              <p className="mt-2 max-w-sm text-body-sm text-cream-200/70">
                {tFooter("newsletterLead")}
              </p>
              <NewsletterForm className="mt-5 max-w-sm" />
            </div>

            <div className="mt-auto">
              <h2 className="font-display text-coord uppercase text-cream-200/60">
                {tFooter("followUs")}
              </h2>
              <ul className="mt-4 flex flex-wrap items-center gap-2.5">
                {SOCIAL_ACCOUNTS.map(({ network, href, Icon }) => (
                  <li key={network}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={tFooter("followUsOn", { network })}
                      className="flex size-10 items-center justify-center border border-cream-200/35 text-cream-100/85 transition-colors hover:border-cream-100 hover:bg-cream-100 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav
              key={column.heading}
              aria-label={tFooter(column.heading)}
              className="bg-navy-900 py-10 lg:px-10"
            >
              <h2 className="font-display text-coord uppercase text-cream-200/60">
                {tFooter(column.heading)}
              </h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-cream-100/85 transition-colors hover:text-cream-50"
                    >
                      {"scope" in link ? tFooter(link.key) : tNav(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="page-shell mt-4 border-t border-cream-200/15">
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-display text-coord uppercase text-cream-200/60">
            <p>{tFooter("rights", { year: 2026 })}</p>
            <Link
              href="/terms"
              className="transition-colors hover:text-cream-100"
            >
              {tFooter("terms")}
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-cream-100"
            >
              {tFooter("privacy")}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-display text-coord uppercase text-cream-200/60">
              {tCommon("currencyNote")}
            </p>
            {/* The ghost variant hovers to `text-foreground`, which is navy: on
                this ground that is the button disappearing. */}
            <LanguageSwitcher className="text-cream-100 hover:bg-cream-100/15 hover:text-cream-100" />
          </div>
        </div>
      </div>

      {/* Full bleed, no shell. aspect rather than a height, because the mask is
          `contain` and a box of the wrong ratio letterboxes the mark inside its
          own container. */}
      <div
        aria-hidden
        className="pointer-events-none mt-10"
        style={{
          maskImage: "linear-gradient(to top, transparent, #000 88%)",
          WebkitMaskImage: "linear-gradient(to top, transparent, #000 88%)",
        }}
      >
        <span className="dotted-logotype block aspect-[196/24] w-full text-cream-100/20" />
      </div>

      <script
        type="application/ld+json"
        // Serialised by us from values we control, and the only escape that
        // matters in a JSON-LD block is the closing script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </footer>
  );
}
