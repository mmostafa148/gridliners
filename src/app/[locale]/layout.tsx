import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { DirectionProvider } from "@/components/providers/direction-provider";
import { IntlProvider } from "@/components/providers/intl-provider";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getDirection, routing, type Locale } from "@/i18n/routing";
import { ADOBE_FONTS_CSS_URL, fontVariables } from "@/lib/fonts";
import { QueryProvider } from "@/lib/query/provider";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("siteName"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("tagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale segment.
  setRequestLocale(locale);
  // Awaited on its own: `check-messages` binds namespaces to destructured names
  // positionally, so a non-`getTranslations` member inside a `Promise.all` here
  // would shift every binding after it.
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={getDirection(locale as Locale)}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        {/* Presicav (EN display) ships from an Adobe Fonts kit; Inter and
            Noto Sans Arabic come from next/font via `fontVariables`. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href={ADOBE_FONTS_CSS_URL} />
      </head>
      <body>
        {/* Strict about missing messages in both halves of the tree - see
            `intl-provider.tsx`. A missing key must never render as its own key
            path in a public composition. */}
        <IntlProvider locale={locale} messages={messages}>
          <DirectionProvider dir={getDirection(locale as Locale)}>
            <QueryProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </QueryProvider>
          </DirectionProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
