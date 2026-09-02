import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Become a partner.
 *
 * The ask, immediately after the wall of people who already said yes, and
 * nothing more than the ask.
 *
 * This section has been cut twice. It began as a nine-row comparison matrix and
 * was the tallest block on the page at 1299px; trimming that to three tier
 * sentences got it to 847px, and it was still carrying a how-it-works sequence,
 * a pricing note and a tier breakdown — a page's worth of material inside a
 * section.
 *
 * A home page partner block has one job: make the case in a sentence and get
 * the reader to /partner. Everything that was here belongs to that page and is
 * already written — the three process steps, the nine inclusions and the tier
 * summaries all remain in the message files, translated, for Phase 1.9 to
 * render. Deliberately unused here rather than deleted, because the writing and
 * the translation are done.
 *
 * The counts went with them. They were real and interpolated, but the hero's
 * stat rail already counts sub-categories on this same page, and a number is
 * worth less the second time a reader meets it.
 *
 * One row rather than two columns. At this length a two-column grid leaves a
 * hole where the second column used to be, which is exactly what it did.
 *
 * Cream, between the white partner grid above and the navy testimonials below.
 */
export async function BecomePartner() {
  const t = await getTranslations("home.becomePartner");

  return (
    <section className="bg-cream-100 text-navy-900">
      <div className="page-shell py-14 sm:py-18 lg:py-24">
        <div className="grid overflow-hidden border-y border-navy-900/15 lg:grid-cols-[minmax(0,1.08fr)_minmax(25rem,0.92fr)]">
          <div className="relative py-12 sm:py-16 lg:pe-20 lg:py-20">
            <div className="flex items-center gap-3 font-display text-coord uppercase tracking-[0.16em] text-blue-700">
              <span className="size-1.5 bg-blue-700" aria-hidden />
              <span>{t("cycleLabel")}</span>
            </div>

            <h2 className="mt-7 max-w-2xl text-h1 text-balance">{t("title")}</h2>
            <p className="mt-5 max-w-2xl text-body-md text-navy-600">{t("description")}</p>

            <div className="mt-12 grid items-end gap-7 border-t border-navy-900/15 pt-7 2xl:grid-cols-[auto_1fr] 2xl:gap-10">
              <p className="font-data text-[clamp(4.75rem,9vw,7.5rem)] leading-[0.78] tracking-[-0.08em] text-navy-900">
                2026
              </p>

              <div className="2xl:border-s 2xl:border-navy-900/15 2xl:ps-8">
                <p className="max-w-md text-body-sm text-navy-600">{t("tiersNote")}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-display text-coord uppercase tracking-[0.12em] text-navy-900">
                  <span>{t("principal")}</span>
                  <span className="text-gold-600" aria-hidden>/</span>
                  <span>{t("partner")}</span>
                  <span className="text-gold-600" aria-hidden>/</span>
                  <span>{t("supporter")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative -mx-5 bg-navy-900 px-5 py-12 text-cream-100 sm:-mx-8 sm:px-8 sm:py-16 lg:mx-0 lg:px-12 lg:py-20 xl:px-16">
            <span className="absolute end-5 top-5 size-2 border border-cream-100/40 sm:end-8 sm:top-8" aria-hidden />

            <p className="font-display text-coord uppercase tracking-[0.16em] text-gold-500">
              {t("tiersTitle")}
            </p>

            <ul className="mt-8 divide-y divide-cream-100/15 border-y border-cream-100/15">
              {["benefit1", "benefit2", "benefit3"].map((key) => (
                <li key={key} className="flex items-start gap-4 py-5 text-body-md text-cream-100">
                  <span className="mt-[0.55em] size-1.5 shrink-0 bg-gold-500" aria-hidden />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-start gap-5">
              <Button asChild variant="award-invert" size="cta">
                <Link href="/partner">{t("cta")}</Link>
              </Button>
              <Link
                href="/contact"
                className="font-display text-coord uppercase tracking-[0.12em] text-cream-100/75 underline-offset-4 transition-colors hover:text-cream-100 hover:underline focus-visible:text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
