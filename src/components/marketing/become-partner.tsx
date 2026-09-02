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
      <div className="page-shell section-y">
        <div className="flex flex-col gap-x-16 gap-y-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-h1">{t("title")}</h2>
            <p className="mt-5 text-body-md text-navy-600">{t("description")}</p>
            <p className="mt-4 flex items-start gap-3 text-body-sm text-navy-600">
              {/* The identity's square, the same device the footer and the
                  partner wall use. */}
              <span className="mt-[0.5em] size-1.5 shrink-0 bg-blue-700" aria-hidden />
              <span>{t("tiersNote")}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-4">
            <Button asChild variant="award" size="cta">
              <Link href="/partner">{t("cta")}</Link>
            </Button>
            <Link
              href="/contact"
              className="font-display text-coord uppercase text-navy-600 underline-offset-4 transition-colors hover:text-navy-900 hover:underline"
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
