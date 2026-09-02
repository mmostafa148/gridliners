"use client";

import {
  CreditCard,
  FilePlus,
  Files,
  LayoutDashboard,
  LogIn,
  LogOut,
  ThumbsUp,
  Trophy,
  User,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

/**
 * Account entry point — signed out and signed in.
 *
 * "Log in" and "Create account" were two buttons competing beside the primary
 * CTA for what is a single intent: get to your account. They collapse into one
 * icon, with both routes inside. That leaves exactly one filled button in the
 * header, which is the one that should be filled.
 *
 * **When somebody is signed in, this is where their account lives.** Phase 2
 * first added a second account bar of its own inside a separate application
 * shell; there is one account control on this site and it is this one
 * (build-state §47). Signed in it carries the participant's own destinations
 * and their name; signed out it carries the two doors.
 *
 * **A participant is never offered a Jury or Admin destination.** The menu is
 * built from the session's role, and the participant branch names participant
 * routes only.
 *
 * The session arrives as a prop from the frame, which resolved it on the
 * server. Nothing here fetches it, so there is no moment where the control
 * renders logged-out and then corrects itself.
 */
export interface AccountIdentity {
  name: string;
  /** Two letters for the compact marker. */
  initials: string;
}

export function AccountMenu({
  className,
  identity,
}: {
  className?: string;
  /** Set when a participant is signed in. */
  identity?: AccountIdentity | null;
}) {
  const t = useTranslations("nav");
  const tAccount = useTranslations("account");

  const signedIn = Boolean(identity);
  const items = signedIn
    ? [
        { href: "/dashboard", label: tAccount("nav.overview"), Icon: LayoutDashboard, mirror: false },
        { href: "/entries", label: tAccount("nav.entries"), Icon: Files, mirror: false },
        { href: "/entries/new", label: tAccount("nav.newEntry"), Icon: FilePlus, mirror: false },
        { href: "/my-awards", label: tAccount("nav.awards"), Icon: Trophy, mirror: false },
        { href: "/billing", label: tAccount("nav.billing"), Icon: CreditCard, mirror: false },
        { href: "/my-votes", label: tAccount("nav.votes"), Icon: ThumbsUp, mirror: false },
        { href: "/profile", label: tAccount("nav.profile"), Icon: User, mirror: false },
      ]
    : [
        { href: "/login", label: t("login"), Icon: LogIn, mirror: true },
        { href: "/register", label: t("register"), Icon: UserPlus, mirror: false },
      ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          // Addressable by something that is not a translated string: the
          // accessible name is localized, which is right for a reader and
          // useless for a harness that has to find this control in Arabic.
          data-account-menu
          variant="ghost"
          size={identity ? "cta" : "icon-cta"}
          className={cn("text-navy-600 hover:text-navy-900", className)}
          aria-label={identity ? `${t("account")}: ${identity.name}` : t("account")}
        >
          {identity ? (
            <>
              {/* The initials always, the name only where the rail has room -
                  the header already carries a logo, eight nav items, a language
                  control and the cycle's action. */}
              <span
                aria-hidden
                className="grid size-6 shrink-0 place-items-center bg-current/12 font-display text-coord"
              >
                {identity.initials}
              </span>
              <span className="hidden max-w-[10ch] truncate 2xl:inline">{identity.name}</span>
            </>
          ) : (
            <UserRound strokeWidth={1.5} aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>
      {/* Square, edged and flat rather than rounded and floated — the stock
          popover's drop shadow exists nowhere else here.

          Each row carries a pixel that arrives on hover, the same mark the
          primary button uses, so the menu belongs to the same set rather than
          looking like a component from a different library. On white that mark
          is gold-deep: flat gold is close enough to a light ground's own value
          to all but vanish against it. */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 rounded-none border border-navy-900/15 bg-white/97 p-0 text-navy-900 shadow-none ring-0 backdrop-blur"
      >
        <p className="border-b border-navy-900/10 px-4 py-3 font-display text-coord uppercase text-navy-600">
          {identity ? identity.name : t("account")}
        </p>
        {items.map((item, i) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-none px-4 py-3.5 text-nav uppercase",
                "text-navy-800 transition-colors focus:bg-navy-900/5 focus:text-navy-900",
                i > 0 && "border-t border-navy-900/10",
              )}
            >
              <item.Icon
                strokeWidth={1.5}
                aria-hidden
                className={cn(
                  // stroke, not text — on any ground. The base item carries
                  // `not-data-[variant=destructive]:focus:**:text-accent-foreground`,
                  // which reaches every descendant — including the paths inside
                  // this svg. Lucide strokes with currentColor, and that keyword
                  // is re-resolved against each element's own colour, so setting
                  // the colour on the svg alone left the paths resolving to the
                  // ground behind them. The declared colour said gold while
                  // nothing gold was painted at all.
                  //
                  // Setting stroke gives the paths a resolved colour to inherit
                  // rather than a keyword to resolve, which the colour rule
                  // cannot reach.
                  "size-4 shrink-0 stroke-navy-500 transition-colors",
                  "group-hover:stroke-gold-deep group-focus:stroke-gold-deep",
                  // The sign-in glyph is an arrow through a door, so it reads
                  // backwards unmirrored. The add-person glyph has no direction
                  // and is left alone.
                  item.mirror && "rtl:-scale-x-100",
                )}
              />
              {item.label}
              {/* Parked at the far end and revealed on hover, so the row gains
                  a terminal rather than a bullet: the same square the primary
                  button carries at its tail. */}
              <span
                aria-hidden
                className={cn(
                  "ms-auto size-2 shrink-0 bg-gold-deep opacity-0 transition-opacity",
                  "group-hover:opacity-100 group-focus:opacity-100",
                )}
              />
            </Link>
          </DropdownMenuItem>
        ))}

        {signedIn ? (
          <form action={logoutAction}>
            <DropdownMenuItem asChild>
              <button
                type="submit"
                className={cn(
                  "group flex w-full items-center gap-3 rounded-none border-t border-navy-900/10 px-4 py-3.5 text-nav uppercase",
                  "text-navy-800 transition-colors focus:bg-navy-900/5 focus:text-navy-900",
                )}
              >
                <LogOut
                  strokeWidth={1.5}
                  aria-hidden
                  className="size-4 shrink-0 stroke-navy-600 transition-colors group-hover:stroke-gold-deep group-focus:stroke-gold-deep rtl:-scale-x-100"
                />
                {tAccount("nav.logout")}
                <span
                  aria-hidden
                  className="ms-auto size-2 shrink-0 bg-gold-deep opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                />
              </button>
            </DropdownMenuItem>
          </form>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
