"use client";

import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Logo } from "@/components/brand/brand-assets";
import { SOCIAL_ACCOUNTS } from "@/components/brand/social-icons";
import { AccountMenu, type AccountIdentity } from "@/components/layout/account-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Public header.
 *
 * The rail docks under the announcement bar, at every width, on every page but
 * one. Home is the exception: from md up it rests on the FOOT of the screen so
 * the hero opens with nothing above it, and the hero's scroll sequence flies it
 * to the top. That was once the rule rather than the exception, which left
 * every inner page with a nav bar stranded across the middle of the screen.
 *
 * It is a solid navy rail everywhere, not a transparent overlay. Transparency
 * was written for a bar sitting on a hero photograph at the top of the page; at
 * the foot it floats over whatever section happens to be there, and the content
 * behind it showed through. A constant rail also means no scroll listener and
 * no per-route list of which pages it may be see-through on.
 */

/**
 * The lockup, smaller on a phone.
 *
 * At the desktop's 32px it is 205px of a 390px screen, and with the account
 * control now beside the language and the menu there is not that much room to
 * give it — the row came to 381px inside a 350px shell. The height is set in
 * CSS rather than by the `height` prop so one element serves both widths;
 * `w-auto` because the intrinsic width attribute would otherwise stretch it
 * against the new height.
 */
const LOGO_SIZE = "h-5 w-auto sm:h-8";

/**
 * The ghost controls that sit on the navy rail — language, account.
 *
 * The variant resolves its hover *and* its open state to `muted` on
 * `foreground`, which is a near-white ground under navy text: right on a light
 * surface, and a white box on this one. Opening the account menu inside the
 * full-screen panel is where that stopped being subtle — the trigger turned
 * into a white tile in the middle of the bar — so both states are restated in
 * the rail's own colours, and both places the controls appear use this.
 */
const RAIL_CONTROL = cn(
  "text-cream-100/80 hover:bg-cream-100/10 hover:text-cream-50",
  "aria-expanded:bg-cream-100/15 aria-expanded:text-cream-50",
);

/**
 * The Awards hub, as the Sitemap draws it.
 *
 * **Awards is a menu whose Overview is a page.** This corrects the earlier
 * reading, recorded here and in build-state §42: the Sitemap was taken as
 * giving Awards five branches and no page of its own, so Overview was pointed
 * at `/about`. **That sent a reader asking about the awards to the company
 * page**, and the client has overruled it. The Sitemap draws Awards as a node
 * with five branches and Overview as a node with three children of its own, so
 * Overview is now `/awards` - a real hub carrying the five branches as
 * sections, each closing on a link to the screen that owns it.
 *
 * The dropdown keeps all five items; only Overview's destination changed.
 *
 * **Every item points at content that exists**, which is why two of them are
 * anchors rather than routes:
 *
 * | Branch | Where it is |
 * | --- | --- |
 * | Overview | `/awards` - the hub, and the award story, timetable and archive |
 * | Categories | `/categories` |
 * | Fees & Deadlines | the pricing section of `/how-to-enter` |
 * | How to Enter | `/how-to-enter` |
 * | Benefits | the "Why enter" block inside `/how-to-enter` |
 *
 * The two anchors are the honest answer to a Sitemap branch whose content was
 * deliberately fused into another screen (build-state 1.4: eligibility, pricing
 * and the fees explainer are one section by design). A menu item that landed on
 * the top of a long page and left the reader to find the part it named would be
 * a link in name only.
 */
const AWARDS_ITEMS = [
  { href: "/awards", key: "awardsOverview" },
  { href: "/categories", key: "categories" },
  { href: "/how-to-enter#fees", key: "awardsFees" },
  { href: "/how-to-enter", key: "howToEnter" },
  { href: "/how-to-enter#benefits", key: "awardsBenefits" },
] as const;

/**
 * The sitemap's main menu, in its order.
 *
 * Home is in the list even though the logo already goes there: on a menu this
 * long the logo stops reading as a control, and the sitemap names it.
 *
 * Awards carries `items` instead of an `href`, which is what makes it a menu.
 */
type NavLink = { href: string; key: string };
type NavGroup = { key: string; items: readonly NavLink[] };

/**
 * A predicate, not a truthiness check on an extracted variable: narrowing has
 * to reach `item` itself for the link branch to know it has an `href`.
 */
const isGroup = (item: NavLink | NavGroup): item is NavGroup => "items" in item;

const NAV_ITEMS: readonly (NavLink | NavGroup)[] = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { key: "awards", items: AWARDS_ITEMS },
  // Two entries, not one. The Sitemap's main menu names a single "Winners &
  // Finalists", and the rail carried it as one link that only ever went to
  // Winners - so Finalists had no way in from the main menu at all, on a site
  // where it is a route of its own with a year archive under it. Split on the
  // client's instruction; both destinations already existed.
  { href: "/winners", key: "winners" },
  { href: "/finalists", key: "finalists" },
  { href: "/jury-panel", key: "jury" },
  { href: "/news", key: "news" },
  { href: "/partners", key: "partners" },
  { href: "/contact", key: "contact" },
] as const;

export function PublicHeader({
  action,
  identity,
}: {
  /** Whatever the cycle is currently asking for. Shown in the rail from sm up,
   *  and at the foot of the phone menu, where it is the menu's only button. */
  action?: { href: string; label: string };
  /** The signed-in participant, or null. Resolved by the frame on the server. */
  identity?: AccountIdentity | null;
}) {
  const t = useTranslations("nav");
  // The accounts are labelled from the footer's namespace, where they were
  // written; the menu shows the same list rather than a second copy of it.
  const tSocial = useTranslations("footer");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Which group is expanded inside the phone panel. One at a time, and it opens
  // itself when the reader is already somewhere inside it.
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // "/" is not a prefix test: startsWith would mark Home active on every route.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  // A group is current when the reader is on any of its branches.
  //
  // The `/about` exclusion this carried is gone with the reason for it: it
  // existed only because Overview pointed at `/about`, so About and Awards both
  // lit for one page. Overview is `/awards` now, About is a rail item and
  // nothing else, and the plain test is the correct one again.
  const groupActive = (items: readonly { href: string }[]) =>
    items.some((i) => isActive(i.href));

  // The foot position belongs to Home's hero and nothing else. Every other
  // page docks the rail at the top, which is where a reader looks for it.
  const isHome = pathname === "/";

  return (
    <header
      data-site-rail
      className={cn(
        "fixed inset-x-0 z-40 w-full border-cream-100/12 bg-navy-950/92 text-cream-100 backdrop-blur",
        // On a phone the rail docks under the announcement bar and stays there.
        // A bar at the foot of a phone is a bar across the thumb: it covered
        // the hero's own actions, and the hero sequence that eventually lifts
        // it costs a screen and a half of scrolling that a phone does not have
        // to spare. Its hairline moves to the bottom edge with it.
        "top-[var(--announce-h,2.5rem)] border-b",
        // From md up the rail splits by route, and only by route.
        //
        // On Home it rests on the foot of the window, which is the position the
        // hero timeline animates away from. That stays a CLASS rather than
        // anything JS sets: under prefers-reduced-motion the hero effect
        // returns before GSAP is ever created, and crossing the md breakpoint
        // calls ctx.revert(), which strips inline transforms and falls back to
        // the stylesheet. The stylesheet is the only thing keeping those two
        // paths correct.
        //
        // Everywhere else it docks under the announcement bar exactly as it
        // does on a phone. The foot position was Home's choreography leaking
        // onto every inner page, where it read as a nav bar stranded across
        // the middle of the screen. Inner pages clear it in `PageHeader`.
        isHome
          ? "md:top-[calc(100dvh-4.5rem)] md:border-b-0 md:border-t"
          : "md:top-[var(--announce-h,2.5rem)]",
      )}
    >
      <div className="page-shell flex h-[4.5rem] items-center gap-6">
        <Link
          href="/"
          data-rail-logo
          className="shrink-0"
          aria-label="Gridliners Awards"
        >
          <Logo
            variant="horizontal"
            tone="reversed"
            height={32}
            className={LOGO_SIZE}
          />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center gap-0.5 xl:flex"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const current = isGroup(item) ? groupActive(item.items) : isActive(item.href);
            const railItem = cn(
              // Tighter at xl than at 2xl: the rail carries nine nav items now
              // as well as the language, the account control and the cycle's
              // action, and at 1280 the original padding put the action past
              // the gutter. Measured, not guessed.
              "relative whitespace-nowrap px-1.5 py-2 text-nav uppercase transition-colors 2xl:px-2",
              "after:absolute after:inset-x-2 after:-top-px after:h-0.5 after:transition-colors",
              current
                ? "text-cream-50 after:bg-gold"
                : "text-cream-100/70 after:bg-transparent hover:text-cream-50",
            );

            // A group opens; it does not navigate. The trigger is a button
            // rather than a link with a menu bolted on, so a keyboard gets the
            // whole thing for free - Enter and Space open it, the arrows move
            // through it, Escape closes it and returns focus to the trigger.
            if (isGroup(item)) {
              return (
                <DropdownMenu key={item.key}>
                  <DropdownMenuTrigger
                    className={cn(
                      railItem,
                      "flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                      "data-[state=open]:text-cream-50",
                    )}
                  >
                    {t(item.key)}
                    <ChevronDown
                      aria-hidden
                      strokeWidth={2}
                      className="size-3.5 transition-transform duration-200 data-[state=open]:rotate-180 motion-reduce:transition-none"
                    />
                  </DropdownMenuTrigger>

                  {/* The rail's own navy, not the stock light popover: this
                      hangs off a navy bar and a white card under it would read
                      as a different site's component. Square and edged for the
                      same reason the account menu is. `align="start"` is
                      logical here - Radix resolves it against the trigger's
                      direction, so it opens from the inline start in both. */}
                  <DropdownMenuContent
                    align="start"
                    sideOffset={12}
                    className="w-64 rounded-none border border-cream-100/15 bg-navy-950/97 p-0 text-cream-100 shadow-none ring-0 backdrop-blur"
                  >
                    {item.items.map((sub, i) => (
                      <DropdownMenuItem key={sub.href} asChild>
                        <Link
                          href={sub.href}
                          aria-current={isActive(sub.href) ? "page" : undefined}
                          className={cn(
                            "group flex items-center gap-3 rounded-none px-4 py-3.5 text-nav uppercase",
                            "text-cream-100/75 transition-colors",
                            "focus:bg-cream-100/10 focus:text-cream-50",
                            i > 0 && "border-t border-cream-100/10",
                          )}
                        >
                          {/* The identity's square, arriving on hover - the
                              same mark the mobile menu marks its current row
                              with, and the account menu its rows. */}
                          <span
                            aria-hidden
                            className={cn(
                              "size-1.5 shrink-0 transition-colors",
                              isActive(sub.href)
                                ? "bg-gold"
                                : "bg-transparent group-focus:bg-gold",
                            )}
                          />
                          {t(sub.key)}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={railItem}
                aria-current={current ? "page" : undefined}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-1">
          <LanguageSwitcher className={RAIL_CONTROL} />
          {/* On a phone too. It was hidden below sm, which left the account
              reachable only from inside the menu — two taps to a control that
              is one everywhere else, and the one control a returning entrant
              comes to the site for. */}
          <AccountMenu className={RAIL_CONTROL} identity={identity} />
          {/* Below sm the rail has no room for it beside the logo, the
              language and the two icons — it is the first thing in the menu
              instead, which is also the only place on a phone it was ever
              visible from. */}
          {action ? (
            <Button
              asChild
              variant="award"
              size="cta"
              className="ms-1 hidden sm:inline-flex"
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : null}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="text-cream-100 hover:bg-cream-100/10 hover:text-cream-50 xl:hidden"
                aria-label={t("openMenu")}
              >
                <Menu strokeWidth={1.5} aria-hidden />
              </Button>
            </SheetTrigger>

            {/* The whole screen, on the rail's own navy. It used to be a white
                card rising from the bottom edge — written when the rail lived
                at the foot, and left behind when the rail moved to the top on a
                phone, so the menu opened away from the control that opened it.
                It also arrived as a stack of black-on-white rows that could
                have belonged to any site.
                Full bleed instead: the rail expands into the screen rather than
                a panel appearing over it. It stops below the announcement bar,
                which is the one strip pinned to the top of the window from
                first paint and belongs to the cycle rather than to any page —
                covering it to show a menu would hide what the site is currently
                asking for. Below that its own bar sits at exactly the rail's
                height and gutter, so on a phone the logo does not move a pixel
                between closed and open, which is what makes it read as one
                object rather than two.
                "top" is an edge, not a direction, so RTL needs no mirror. */}
            <SheetContent
              side="top"
              showCloseButton={false}
              // The overlay dims and blurs whatever it covers, so it starts
              // below the bar as well; the panel underneath is opaque, so it is
              // the bar and nothing else that this is protecting.
              overlayClassName="top-[var(--announce-h,2.5rem)]"
              // Position and height are written with the same variant the base
              // uses. tailwind-merge keys a variant-scoped utility apart from a
              // bare one, so a plain `h-dvh` does not replace the base's
              // `data-[side=top]:h-auto` — it loses to it, and the panel comes
              // out as tall as its contents happen to be.
              className="max-w-none gap-0 bg-navy-900 p-0 text-cream-100 data-[side=top]:top-10 data-[side=top]:h-[calc(100dvh-2.5rem)] data-[side=top]:border-b-0"
            >
              {/* The visible name is the logo, which is artwork; the dialog
                  still needs a real one to announce itself by. */}
              <SheetTitle className="sr-only">{t("menu")}</SheetTitle>

              {/* The rail, still. Same height, same gutter, same logo, and the
                  language control stays with it — a menu is exactly where
                  someone who cannot read the page reaches for it, and sending
                  them back out to the rail to switch would be the one thing
                  this panel covers that they still need. Only the trigger
                  changes: the hamburger becomes the close. */}
              <div className="page-shell flex h-[4.5rem] shrink-0 items-center justify-between border-b border-cream-100/12">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  aria-label="Gridliners Awards"
                >
                  <Logo
                    variant="horizontal"
                    tone="reversed"
                    height={32}
                    className={LOGO_SIZE}
                  />
                </Link>
                <div className="flex items-center gap-1">
                  <LanguageSwitcher className={RAIL_CONTROL} />
                  {/* The account control keeps its place in the row too, so the
                      rail survives the panel opening whole: same logo, same
                      language, same account, and only the hamburger changed
                      into the close. Nothing in the bar moves. */}
                  <AccountMenu className={RAIL_CONTROL} identity={identity} />
                  <SheetClose asChild>
                    <button
                      type="button"
                      aria-label={t("closeMenu")}
                      className="-me-2 grid size-11 place-items-center text-cream-100/80 transition-colors hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <X strokeWidth={1.5} aria-hidden />
                    </button>
                  </SheetClose>
                </div>
              </div>

              {/* One scroll area for the list and the actions together, rather
                  than a scrolling list under pinned buttons. On a short phone
                  the pinned version clipped the last row mid-letterform with
                  nothing to say it could be scrolled, which reads as broken
                  rather than as more to come. `min-h-full` plus `mt-auto` keeps
                  the actions on the bottom edge whenever there is room for
                  them, and lets the whole panel scroll as one when there is
                  not. */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="flex min-h-full flex-col">
                  {/* The list hangs from the bar. Centring it in the leftover
                      put 93px of navy between the bar and the first row, which
                      detached the list from the control that opened it and left
                      it floating in the middle of the panel. Everything a menu
                      does starts at the top edge, so it starts there.
                      No page-shell here: the rows carry the gutter themselves,
                      so their rules and their pressed ground run the full width
                      of the panel like the bar's rule above them, rather than
                      stopping short of both edges. */}
                  <nav className="flex flex-col" aria-label="Primary">
                    <ul>
                      {NAV_ITEMS.map((item, i) => {
                        const current = isGroup(item)
                          ? groupActive(item.items)
                          : isActive(item.href);
                        const expanded =
                          openGroup === item.key || (openGroup === null && current);
                        // The row's own type, shared by the link and the button
                        // so a group does not read as a different kind of thing
                        // from the rows around it.
                        const rowClass = cn(
                          // 44px is the floor for a thumb, and py-3 on
                          // 1rem type lands at 46 - so the row is as
                          // compact as it is allowed to be, not as compact
                          // as it could look.
                          "group flex w-full items-center gap-3 px-[var(--gutter)] py-3",
                          "font-display text-base uppercase tracking-[0.01em] transition-colors",
                          // The whole row answers a finger, not just the
                          // word in it. A tap on a phone gets no hover, so
                          // the ground is what confirms the target was hit.
                          "hover:bg-cream-100/6 active:bg-cream-100/12",
                          current ? "text-cream-50" : "text-cream-100/75 hover:text-cream-50",
                        );
                        const marker = (
                          <span
                            aria-hidden
                            className={cn(
                              "size-1.5 shrink-0 transition-colors",
                              current ? "bg-gold" : "bg-transparent",
                            )}
                          />
                        );

                        if (isGroup(item)) {
                          return (
                            <li
                              key={item.key}
                              className="border-b border-cream-100/12 motion-safe:menu-row"
                              style={{ animationDelay: `${40 + i * 35}ms` }}
                            >
                              {/* A button, not a link. Awards has no page of
                                  its own, and the sheet has no room for a
                                  floating popover - so on a phone the group
                                  opens in place. */}
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenGroup(expanded ? "" : item.key)
                                }
                                aria-expanded={expanded}
                                aria-controls={`nav-${item.key}`}
                                className={rowClass}
                              >
                                {marker}
                                {t(item.key)}
                                <ChevronDown
                                  aria-hidden
                                  strokeWidth={2}
                                  className={cn(
                                    "ms-auto size-4 shrink-0 text-cream-100/25 transition-transform duration-200",
                                    "group-hover:text-cream-100/60 motion-reduce:transition-none",
                                    expanded && "rotate-180",
                                  )}
                                />
                              </button>

                              {expanded ? (
                                <ul
                                  id={`nav-${item.key}`}
                                  aria-label={t("awardsMenu")}
                                  className="pb-2"
                                >
                                  {item.items.map((sub) => (
                                    <li key={sub.href}>
                                      <Link
                                        href={sub.href}
                                        onClick={() => setOpen(false)}
                                        aria-current={isActive(sub.href) ? "page" : undefined}
                                        className={cn(
                                          // Indented past the parent's marker
                                          // so the nesting is visible without a
                                          // second rule cutting the panel up.
                                          "flex items-center gap-3 py-2.5 ps-[calc(var(--gutter)+1.5rem)] pe-[var(--gutter)]",
                                          "text-nav uppercase transition-colors hover:bg-cream-100/6",
                                          isActive(sub.href)
                                            ? "text-cream-50"
                                            : "text-cream-100/60 hover:text-cream-50",
                                        )}
                                      >
                                        <span
                                          aria-hidden
                                          className={cn(
                                            "h-px w-4 shrink-0 transition-colors",
                                            isActive(sub.href) ? "bg-gold" : "bg-cream-100/25",
                                          )}
                                        />
                                        {t(sub.key)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </li>
                          );
                        }

                        return (
                        <li
                          key={item.href}
                          className="border-b border-cream-100/12 motion-safe:menu-row"
                          // Stagger. The rows are a list, not a sequence, so the
                          // delay is the only thing that carries order here — and
                          // it tops out quickly, because the last row still has to
                          // be tappable the moment the panel is up.
                          style={{ animationDelay: `${40 + i * 35}ms` }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            aria-current={current ? "page" : undefined}
                            className={rowClass}
                          >
                            {/* The identity's square, the same mark the
                            announcement bar and the partner wall use, and gold
                            because that is what the rail marks its own current
                            item with. Held in the layout at all times so a row
                            does not shift when it becomes the current one. */}
                            {marker}
                            {t(item.key)}
                            <ChevronRight
                              className="ms-auto size-4 shrink-0 text-cream-100/25 transition-colors group-hover:text-cream-100/60 rtl:-scale-x-100"
                              strokeWidth={2}
                              aria-hidden
                            />
                          </Link>
                        </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* The accounts, in the room the list no longer takes. They
                      are the one thing a menu can offer that the pages under it
                      cannot, and without them the space the top-aligned list
                      opens up is just navy. Same list the footer shows, from
                      one source. */}
                  <div className="page-shell mt-auto pt-7">
                    <h2 className="font-display text-coord uppercase text-cream-200/50">
                      {tSocial("followUs")}
                    </h2>
                    <ul className="mt-4 flex flex-wrap items-center gap-2">
                      {SOCIAL_ACCOUNTS.map(({ network, href, Icon }) => (
                        <li key={network}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label={tSocial("followUsOn", { network })}
                            className="flex size-11 items-center justify-center border border-cream-200/25 text-cream-100/80 transition-colors hover:border-cream-100 hover:bg-cream-100 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                          >
                            <Icon className="size-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* One button, and it is the cycle's, not an account's.
                      This foot used to be Log in and Create account side by
                      side — two grey-weight buttons in the menu's most valuable
                      slot, asking a visitor to decide something about us before
                      they had decided anything about themselves. And the site's
                      actual ask was not here at all: the rail's action is
                      hidden below sm, so on a phone the most prominent thing in
                      the menu was "Create account" during a voting phase, when
                      entries are closed. Wrong ask, best position.
                      So the ask takes the button, and it is the only thing
                      here. Log in briefly sat under it as a quiet link, and
                      then the account control moved into the bar above — which
                      is the same two destinations, spelled out twice on one
                      screen, which is the fault this foot was rewritten to fix.
                      The bar owns the account; the foot owns the ask.
                      Create account is a control nowhere in this panel:
                      registration is where the cycle's action leads for anyone
                      not signed in, /login carries the "no account?" door for
                      everyone else — a requirement on that screen, logged in
                      build-state — and the account menu in the bar lists both.
                      Acquisition does not happen in a menu's utility foot; it
                      happens in the hero, on /how-to-enter and in the partner
                      block. */}
                  <div className="page-shell mt-7 border-t border-cream-100/12 pt-5 pb-7">
                    {action ? (
                      /* Cream, not `award`: the award fill is navy, which is
                         this panel's own ground, so the button dissolves as it
                         fills — the same trap the footer fell into. */
                      <Button
                        asChild
                        variant="award"
                        size="cta"
                        className="w-full justify-between bg-cream-100 text-navy-900"
                      >
                        <Link href={action.href} onClick={() => setOpen(false)}>
                          {action.label}
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
