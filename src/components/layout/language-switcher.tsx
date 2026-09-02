"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { LocaleFlag } from "@/components/layout/locale-flag";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Locale switcher: a globe with the active locale's code.
 *
 * The full language name in the trigger ("English") cost more header width
 * than it earned. The code carries the same information in two characters,
 * and the names are in the menu where the choice is actually made, each set in
 * its own script.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    const query = searchParams.toString();
    startTransition(() => {
      // `pathname` comes from the locale-aware hook, so it is already stripped
      // of the /en | /ar prefix; the helper re-adds the target locale.
      router.replace(query ? `${pathname}?${query}` : pathname, { locale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="cta"
          className={cn("gap-2 px-3.5 text-navy-600 hover:text-navy-900", className)}
          aria-label={t("switchLanguage")}
          disabled={isPending}
        >
          <Globe strokeWidth={1.5} aria-hidden />
          <span>{activeLocale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      {/* Same surface as the account menu: white, square and hairline-edged
          rather than rounded and floated, with the pixel as the row's terminal. */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 rounded-none border border-navy-900/15 bg-white/97 p-0 text-navy-900 shadow-none ring-0 backdrop-blur"
      >
        <p className="border-b border-navy-900/10 px-4 py-3 font-display text-coord uppercase text-navy-500">
          {t("language")}
        </p>
        {locales.map((locale, i) => {
          const isActive = locale === activeLocale;
          return (
            <DropdownMenuItem
              key={locale}
              onSelect={() => switchTo(locale)}
              // lang belongs on the row, not on a span around the name. The base
              // item carries `not-data-[variant=destructive]:focus:**:text-accent-foreground`,
              // which reaches every descendant *element* and outranks anything
              // this file can write — the extra :not() gives it the specificity.
              // A name wrapped in a span was navy-on-navy the moment the row was
              // highlighted. As a bare text node it has no element to be hit on,
              // so it simply inherits the row's own colour, which we do control.
              lang={locale}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                // Three columns rather than flex + an auto margin. A bare text
                // node becomes an anonymous item either way, but as a flex item
                // it swallowed the row's free space whenever its script ran
                // against the menu's direction, and `ms-auto` on the square then
                // resolved to 0 — the mark sat against the name instead of at
                // the row's end. Columns place all three outright.
                "group grid grid-cols-[1.25rem_1fr_auto] items-center gap-3",
                "rounded-none px-4 py-3.5 text-nav uppercase",
                "transition-colors focus:bg-navy-900/5 focus:text-navy-900",
                i > 0 && "border-t border-navy-900/10",
                // The inactive row is de-emphasised by one step and no more. It
                // is still a control someone has to read, and at this size —
                // small, caps, tracked out — the lighter navies measured 3.05:1
                // and 3.84:1. The mark carries the state; the type does not have
                // to go pale to say it as well.
                isActive ? "text-navy-900" : "text-navy-800",
              )}
            >
              {/* Flags stay at full strength in both states. They identify the
                  language; the mark at the row's end is what says which one is
                  set, and a half-faded flag on white just reads as broken. */}
              <LocaleFlag locale={locale} />
              {/* Pure-Arabic strings are already turned the right way by bidi,
                  so the row keeps the menu's own direction and the two names
                  stay on one axis in both locales. */}
              {localeLabels[locale]}
              {/* Gold always means "this is the language you are reading". The
                  row you are only pointing at gets the same terminal in a
                  quieter value — on the old navy panel the two could be told
                  apart by the row's own brightness, but on a light one that step
                  is too small, and two gold marks at once said nothing. */}
              <span
                aria-hidden
                className={cn(
                  "size-2 transition-opacity",
                  isActive
                    ? "bg-gold-deep opacity-100"
                    : "bg-navy-900/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100",
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
