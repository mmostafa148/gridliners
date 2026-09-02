import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { KitchenSinkContent } from "@/components/dev/kitchen-sink-content";
import { CycleClosed } from "@/components/marketing/cycle-closed";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getDirection, localeLabels, routing, type Locale } from "@/i18n/routing";

/**
 * /dev/kitchen-sink — every token, component and fixture state.
 *
 * The page renders the active locale, then the opposite one inside its own
 * NextIntlClientProvider and `dir`, so LTR and RTL are comparable on one
 * screen rather than by flipping back and forth between two URLs.
 *
 * Dev-only: 404s in production unless NEXT_PUBLIC_ENABLE_DEV_ROUTES=1.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function KitchenSinkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_ROUTES !== "1"
  ) {
    notFound();
  }

  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dev");
  const other = routing.locales.find((l) => l !== locale) as Locale;
  const otherMessages = (await import(`@/messages/${other}.json`)).default;

  return (
    <div className="page-shell py-10">
      <header className="flex flex-wrap items-start justify-between gap-4 pb-6">
        <div className="space-y-1">
          <p className="text-overline uppercase text-muted-foreground">Phase 0.4</p>
          <h1 className="text-display-md">{t("kitchenSinkTitle")}</h1>
          <p className="max-w-prose text-body-md text-muted-foreground">
            {t("kitchenSinkDescription")}
          </p>
        </div>
        <LanguageSwitcher />
      </header>

      <KitchenSinkContent />

      {/* 1.10's cycle-closed state.
          It has no route of its own on purpose - a closed cycle is a condition
          the entry flow falls into, not a page somebody navigates to, and a URL
          for it would publish a page claiming the programme is shut to anyone
          who linked to it. It is reviewed here, like every other shared
          state. */}
      <section className="mt-16 border-t-4 border-navy-900 pt-8">
        <h2 className="text-h2">Cycle closed (1.10)</h2>
        <div className="mt-6">
          <CycleClosed
            locale={locale as Locale}
            opensAt="2026-11-15T08:00:00Z"
            resultsAt="2027-09-17T16:00:00Z"
            latestWinnerYear={2025}
          />
        </div>
      </section>

      {/* Opposite locale, mirrored, in the same viewport. */}
      <section className="mt-16 border-t-4 border-navy-900 pt-8">
        <h2 className="text-h2">
          {t("mirroredLocale")}: {localeLabels[other]}
        </h2>
        <div
          lang={other}
          dir={getDirection(other)}
          className="mt-6 rounded-md border border-dashed border-navy-300 p-4"
        >
          <NextIntlClientProvider locale={other} messages={otherMessages}>
            <KitchenSinkContent />
          </NextIntlClientProvider>
        </div>
      </section>
    </div>
  );
}
