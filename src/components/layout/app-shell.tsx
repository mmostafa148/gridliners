"use client";

import { PanelsTopLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Logo } from "@/components/brand/brand-assets";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { useInlineStartSide } from "@/lib/direction";
import { cn } from "@/lib/utils";

export interface AppShellNavItem {
  href: string;
  label: string;
  /** Pre-rendered icon element — server layouts can pass these across. */
  icon?: React.ReactNode;
}

export interface AppShellProps {
  /** Area name shown under the logo: Participant / Jury Panel / Administration. */
  area: string;
  items: AppShellNavItem[];
  children: React.ReactNode;
  /** Rendered at the bottom of the sidebar (account, sign out, …). */
  sidebarFooter?: React.ReactNode;
  /** Rendered at the inline-end of the top bar. */
  headerActions?: React.ReactNode;
}

/**
 * Sidebar shell shared by the dashboard, jury and admin areas.
 *
 * The sidebar is the first flex child, so it lands on the inline-start edge
 * and mirrors automatically under `dir="rtl"`; its divider uses `border-e`
 * for the same reason.
 */
export function AppShell({
  area,
  items,
  children,
  sidebarFooter,
  headerActions,
}: AppShellProps) {
  const t = useTranslations("shell");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const drawerSide = useInlineStartSide();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const nav = (onNavigate?: () => void) => (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label={area}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-sm px-3 py-2 text-body-sm transition-colors",
            isActive(item.href)
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
          )}
        >
          {item.icon ? (
            <span className="shrink-0 [&_svg]:size-4" aria-hidden>
              {item.icon}
            </span>
          ) : null}
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex flex-col gap-2 p-4">
      <Link href="/" className="inline-flex w-fit bg-cream-100 px-2 py-1.5">
        <Logo variant="horizontal" height={22} />
      </Link>
      <span className="text-overline uppercase text-sidebar-foreground/60">{area}</span>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        {brand}
        <Separator className="bg-sidebar-border" />
        {nav()}
        {sidebarFooter ? (
          <div className="border-t border-sidebar-border p-3">{sidebarFooter}</div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("toggleSidebar")}
              >
                <PanelsTopLeft className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={drawerSide}
              className="w-72 bg-sidebar p-0 text-sidebar-foreground"
            >
              <SheetHeader className="p-0">
                <SheetTitle className="sr-only">{area}</SheetTitle>
              </SheetHeader>
              {brand}
              <Separator className="bg-sidebar-border" />
              {nav(() => setOpen(false))}
              {sidebarFooter ? (
                <div className="border-t border-sidebar-border p-3">{sidebarFooter}</div>
              ) : null}
            </SheetContent>
          </Sheet>

          <span className="text-body-sm font-medium md:hidden">{area}</span>

          <div className="ms-auto flex items-center gap-2">
            {headerActions}
            <LanguageSwitcher />
            <Button asChild variant="ghost" size="sm">
              <Link href="/">{tNav("home")}</Link>
            </Button>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
