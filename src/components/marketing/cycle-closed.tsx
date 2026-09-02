import { getTranslations } from "next-intl/server";

import { SOCIAL_ACCOUNTS } from "@/components/brand/social-icons";
import { SystemState, systemPrimary, systemSecondary } from "@/components/marketing/system-state";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * The cycle-closed state.
 *
 * **Not a route.** A closed cycle is a condition the entry flow falls into, not
 * a page somebody navigates to, so this is a component the flow renders and it
 * is reviewable in `/dev/kitchen-sink` like every other shared state. Giving it
 * a URL would publish a page that claims the programme is shut whenever
 * somebody linked to it.
 *
 * Content-map §1.10 asks for next-cycle dates and the socials, and both are
 * here for the same reason: a visitor who arrives between cycles has exactly
 * two useful questions - when does it open again, and how do I hear about it.
 * The archive links answer the third, which is what they can do in the
 * meantime.
 */
export async function CycleClosed({
  locale,
  opensAt,
  resultsAt,
  latestWinnerYear,
}: {
  locale: Locale;
  opensAt: string;
  resultsAt: string;
  latestWinnerYear: number;
}) {
  const t = await getTranslations("system");
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <SystemState
      code={t("closed.eyebrow")}
      title={t("closed.title")}
      body={t("closed.body")}
      actions={
        <>
          <Link href={`/winners/${latestWinnerYear}`} className={systemPrimary}>
            {t("closed.browseWinners")}
          </Link>
          <Link href="/finalists" className={systemSecondary}>
            {t("closed.browseFinalists")}
          </Link>
        </>
      }
    >
      <div className="mt-10 grid gap-x-12 gap-y-8 border-t border-cream-100/25 pt-8 sm:grid-cols-2 lg:max-w-[52rem]">
        <div>
          <h2 className="font-display text-coord uppercase text-cream-200/75">
            {t("closed.nextTitle")}
          </h2>
          <dl className="mt-4">
            <div className="flex items-baseline justify-between gap-6 border-b border-cream-100/20 py-3">
              <dt className="font-display text-coord uppercase text-cream-200/75">
                {t("closed.opensLabel")}
              </dt>
              <dd className="text-body-md text-cream-50">{fmt(opensAt)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-cream-100/20 py-3">
              <dt className="font-display text-coord uppercase text-cream-200/75">
                {t("closed.resultsLabel")}
              </dt>
              <dd className="text-body-md text-cream-50">{fmt(resultsAt)}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="font-display text-coord uppercase text-cream-200/75">
            {t("closed.followTitle")}
          </h2>
          <p className="mt-4 text-body-md text-cream-200/85">{t("closed.followBody")}</p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {SOCIAL_ACCOUNTS.map(({ network, href, Icon }) => (
              <li key={network}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={network}
                  className="flex size-11 items-center justify-center border border-cream-100/35 text-cream-100 transition-colors hover:border-cream-50 hover:bg-cream-50 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SystemState>
  );
}
