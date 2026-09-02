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
 * **The same bar on every route.** It carried three scales — a full identity
 * block on Overview and Profile, a smaller one on the listings, none at all on
 * the entry and wizard routes — and the avatar, the name and the bar's own
 * height changed as somebody moved between tabs. Chrome that moves is chrome
 * somebody has to re-read. The pages below it still differ from each other;
 * the frame around them does not.
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
          "shrink-0 font-data text-[0.8125rem] tabular-nums",
          item.urgent && !active
            ? "bg-campaign-yellow px-2 py-0.5 text-navy-950"
            : active
              ? "text-cream-200/75"
              : "text-navy-600",
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
    <span className="relative block size-12 shrink-0 overflow-hidden bg-navy-900/8">
      {identity.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={identity.photoUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Image
          src="/brand/logo-icon.svg"
          alt=""
          width={40}
          height={40}
          className="absolute inset-0 m-auto size-6"
        />
      )}
    </span>
  );

  return (
    <div data-account-masthead className="border-b border-navy-900/12 bg-white">
      <div
        // The fixed rail's clearance, owned here exactly as `PageHeader` owns
        // its own: SiteFrame's <main> clears the announcement bar and no more.
        className="account-shell pb-0 pt-5 md:pt-[calc(4.5rem+1.25rem)]"
      >
        {/* Identity is a block, not a line.
            The name and what somebody is were on one baseline with the standing
            figures and the action, which made five things compete for one row.
            The name now leads and the role sits under it; the figures are
            number-over-label on the end edge, which is how a figure is read. */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex min-w-0 items-center gap-3.5">
            {portrait}
            <div className="min-w-0">
              <p className="truncate text-body-md font-semibold leading-tight text-navy-900">
                {identity.name}
              </p>
              {identity.role || identity.country ? (
                <p className="mt-0.5 truncate text-body-sm leading-tight text-navy-600">
                  {[identity.role, identity.country].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:ms-auto">
            {action}
            <Link href={primary.href} className={MASTHEAD_ACTION}>
              {primary.label}
            </Link>
          </div>
        </div>

        {/* The destinations. The same row at every scale, so navigation never
            moves even though the identity above it does. */}
        <nav aria-label={t("navLabel")} className="mt-5 hidden md:block">
          <ul className="-mb-px flex flex-wrap items-center gap-x-6">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 border-b-2 pb-3 text-[0.875rem] transition-colors",
                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700",
                      active
                        ? "border-navy-900 font-medium text-navy-900"
                        : "border-transparent text-navy-600 hover:text-navy-900",
                    )}
                  >
                    {item.label}
                    {count(item, false)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Phone: a disclosure that names where you are. */}
        <div className="mt-4 pb-4 md:hidden">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="account-sections"
            className={cn(
              "flex min-h-12 w-full items-center gap-3 border border-navy-900/20 bg-white px-4",
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
              className="mt-px border border-navy-900/20 bg-white focus:outline-none"
            >
              <nav aria-label={t("navLabel")}>
                <ul className="flex flex-col">
                  {all.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.href} className="border-b border-navy-900/10 last:border-b-0">
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
                            className={cn("size-2 shrink-0", active ? "bg-gold" : "bg-transparent")}
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
  );
}

const MASTHEAD_ACTION = cn(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap px-5",
  "bg-navy-900 text-[0.875rem] font-medium text-cream-50 transition-colors hover:bg-blue-700",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
);
