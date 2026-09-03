"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The account's identity masthead — Direction C's organising device.
 *
 * **The same frame on every route.** Identity and action occupy one compact
 * band; destinations occupy their own rail beneath it. That separation keeps
 * the person's context legible without making it compete with navigation.
 *
 * **Standing lives on the page, not in the bar.** Three number/label pairs
 * squeezed between a job title and a button had no room and no rank; they are
 * `AccountStatCards` now, under the page's own title, where a figure can be
 * the size a figure should be.
 *
 * **The ground is cream, not navy.** The navy slab is what §51 rejected. Cream
 * is the identity's own paper and separates the account from both the public
 * pages (which open on navy) and the white content below.
 *
 * The phone disclosure, its Escape handling, focus return and route-change
 * close are carried over unchanged from `AccountNav`: that behaviour was
 * verified and there is no reason to rewrite it.
 */

export interface MastheadItem {
  href: string;
  label: string;
  count?: number;
  urgent?: boolean;
}

export interface MastheadIdentity {
  name: string;
  /** Job title and company, already joined by the server. */
  role: string | null;
  country: string | null;
  photoUrl: string | null;
}

export function AccountMasthead({
  identity,
  items,
  primary,
  action,
}: {
  identity: MastheadIdentity;
  items: MastheadItem[];
  /** New entry. Rendered once, here, and never again inside a page. */
  primary: MastheadItem;
  /** A route's own action, when it has one that is not New entry. */
  action?: React.ReactNode;
}) {
  const t = useTranslations("account");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    href === "/entries"
      ? pathname === "/entries" || /^\/entries\/(?!new$)/.test(pathname)
      : pathname === href || pathname.startsWith(`${href}/`);

  const all = [...items, primary];
  const current = all.find((item) => isActive(item.href));

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const count = (item: MastheadItem, active: boolean) =>
    item.count !== undefined && item.count > 0 ? (
      <span
        className={cn(
          "inline-flex min-w-6 shrink-0 items-center justify-center px-1.5 py-0.5 font-data text-[0.75rem] tabular-nums",
          item.urgent
            ? "bg-campaign-yellow text-navy-950"
            : active
              ? "bg-navy-900/10 text-navy-900"
              : "bg-white text-navy-600",
        )}
      >
        {item.count}
      </span>
    ) : null;

  /**
   * The portrait.
   *
   * `absolute inset-0`, not `size-full` inside a centred grid: a grid item is
   * sized to its content before `height: 100%` resolves, so the photo rendered
   * 48x60 and was saved only by the container's `overflow-hidden`. Positioning
   * it against the box makes the box the box.
   */
  const portrait = (
    <span className="relative block size-14 shrink-0 overflow-hidden bg-navy-900/8 md:size-16">
      {identity.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={identity.photoUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Image
          src="/brand/logo-icon.svg"
          alt=""
          width={48}
          height={48}
          className="absolute inset-0 m-auto size-7"
        />
      )}
    </span>
  );

  return (
    <div data-account-masthead className="bg-white">
      <div
        // The fixed rail's clearance, owned here exactly as `PageHeader` owns
        // its own: SiteFrame's <main> clears the announcement bar and no more.
        className="account-shell pb-4 pt-4 md:pt-[calc(4.5rem+1rem)]"
      >
        <div className="flex min-h-16 items-center gap-5 md:min-h-20">
          <div className="flex min-w-0 items-center gap-4">
            {portrait}
            <div className="min-w-0">
              <p className="text-overline font-semibold uppercase tracking-[0.14em] text-blue-700">
                {t("eyebrow")}
              </p>
              <p className="mt-1 truncate font-display text-[1.1875rem] font-semibold leading-tight text-navy-950 md:text-account-card">
                {identity.name}
              </p>
              {identity.role || identity.country ? (
                <p className="mt-1 line-clamp-2 text-body-sm leading-snug text-navy-600 md:line-clamp-1">
                  {[identity.role, identity.country].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="ms-auto hidden flex-wrap items-center justify-end gap-3 md:flex">
            {action}
            <Link href={primary.href} className={MASTHEAD_ACTION}>
              {primary.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation gets its own quiet rail: the identity remains recognisable,
          while the active destination reads as a destination rather than a
          loose underlined link. */}
      <div className="border-y border-navy-900/12 bg-mist/70">
        <div className="account-shell">
          <nav aria-label={t("navLabel")} className="hidden md:block">
            <ul className="flex min-h-13 items-stretch">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className="flex">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex min-h-13 items-center gap-2 border-b-2 px-4 text-[0.875rem] transition-colors",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700",
                        active
                          ? "border-blue-700 bg-white font-semibold text-navy-950"
                          : "border-transparent text-navy-600 hover:bg-white/70 hover:text-navy-950",
                      )}
                    >
                      {item.label}
                      {count(item, active)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Phone: a disclosure that names where you are. The primary action
              lives inside the disclosure, so it is never duplicated. */}
          <div className="py-3 md:hidden">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="account-sections"
              className={cn(
                "flex min-h-12 w-full items-center gap-3 border border-navy-900/18 bg-white px-4",
                "text-body-md font-medium text-navy-900 transition-colors hover:bg-mist",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
              )}
            >
              <span aria-hidden className="size-2 shrink-0 bg-gold" />
              <span className="sr-only">{t("currentSection")}: </span>
              {current?.label ?? t("openSections")}
              <ChevronDown
                aria-hidden
                strokeWidth={2}
                className={cn(
                  "ms-auto size-5 shrink-0 text-navy-600 transition-transform duration-200 motion-reduce:transition-none",
                  open && "rotate-180",
                )}
              />
            </button>

            {open ? (
              <div
                ref={panelRef}
                id="account-sections"
                tabIndex={-1}
                className="mt-1 border border-navy-900/18 bg-white focus:outline-none"
              >
                <nav aria-label={t("navLabel")}>
                  <ul className="flex flex-col">
                    {all.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <li
                          key={item.href}
                          className="border-b border-navy-900/10 last:border-b-0"
                        >
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex min-h-12 items-center gap-3 px-4 py-3 text-body-md transition-colors",
                              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700",
                              active
                                ? "bg-navy-900 font-medium text-cream-50"
                                : "text-navy-800 hover:bg-mist",
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "size-2 shrink-0",
                                active ? "bg-gold" : "bg-transparent",
                              )}
                            />
                            {item.label}
                            {count(item, active)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const MASTHEAD_ACTION = cn(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap px-6",
  "bg-navy-900 text-[0.875rem] font-medium text-cream-50 transition-colors hover:bg-blue-700",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
);
