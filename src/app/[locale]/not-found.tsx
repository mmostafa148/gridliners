import { getLocale, getTranslations } from "next-intl/server";

import { SystemState, systemPrimary, systemSecondary } from "@/components/marketing/system-state";
import { Link } from "@/i18n/navigation";
import { getDirection, type Locale } from "@/i18n/routing";

/**
 * Localized 404.
 *
 * Next renders not-found responses inside its own document shell, which does
 * not carry our `<html lang dir>` - so this page sets both on its own wrapper.
 * Without that, an Arabic 404 renders left-to-right.
 *
 * The body says the one thing a visitor here most often needs to know: only
 * shortlisted projects have public pages, so a dead project link is usually a
 * page that was never published rather than one that was taken down.
 */
export default async function LocaleNotFound() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("system");

  return (
    <div lang={locale} dir={getDirection(locale)} className="min-h-svh bg-navy-950">
      <SystemState
        code={t("notFound.code")}
        title={t("notFound.title")}
        body={t("notFound.body")}
        actions={
          <>
            <Link href="/" className={systemPrimary}>
              {t("notFound.home")}
            </Link>
            <Link href="/finalists" className={systemSecondary}>
              {t("notFound.browse")}
            </Link>
          </>
        }
      />
    </div>
  );
}
