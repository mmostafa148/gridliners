import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * The partnership invitation on the Home page.
 *
 * This is intentionally an invitation, not a miniature pricing page. The
 * partner wall immediately above supplies the proof; this section gives that
 * proof a human setting, names the three ways to take part and offers one clear
 * next step. The detailed inclusions remain on /partner.
 *
 * One continuous navy field replaces the old cream-and-card split. The award
 * moment is not decorative stock: sponsor marks are visible on the stage, so
 * the image demonstrates the promise in the copy instead of repeating it.
 */
export async function BecomePartner() {
  const t = await getTranslations("home.becomePartner");
  const tiers = ["supporter", "partner", "principal"] as const;

  return (
    <section className="overflow-hidden bg-navy-900 text-cream-100">
      <div className="page-shell py-16 sm:py-20 lg:py-28">
        <div className="relative border-y border-cream-100/20">
          <span
            className="absolute start-0 top-0 z-20 h-1 w-24 bg-blue-500 after:absolute after:start-full after:top-0 after:h-full after:w-8 after:bg-gold-500"
            aria-hidden
          />

          <div className="flex items-center justify-between gap-6 border-b border-cream-100/20 py-5 font-display text-coord uppercase tracking-[0.16em]">
            <div className="flex items-center gap-3 text-gold-500">
              <span className="size-1.5 bg-gold-500" aria-hidden />
              <span>{t("cycleLabel")}</span>
            </div>
            <span className="font-data text-cream-100/70">2026</span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.18fr)_minmax(25rem,0.82fr)]">
            <div
              data-motion-heading
              className="relative z-10 flex flex-col items-start justify-center py-12 sm:py-16 lg:pe-16 lg:py-20 xl:pe-24"
            >
              <h2 className="max-w-[13ch] text-display-lg leading-[0.98] text-balance text-cream-50">
                {t("title")}
              </h2>
              <p className="mt-7 max-w-[44rem] text-body-lg text-cream-200/80">
                {t("description")}
              </p>

              <Button asChild variant="award-invert" size="cta" className="mt-10">
                <Link href="/partner">{t("cta")}</Link>
              </Button>
            </div>

            <div
              data-motion-media
              className="relative min-h-[20rem] overflow-hidden border-t border-cream-100/20 bg-navy-950 sm:min-h-[26rem] lg:min-h-[34rem] lg:border-s lg:border-t-0"
            >
              <Image
                src="/media/award-moment.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-center"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/5 to-transparent"
                aria-hidden
              />
              <p className="absolute bottom-6 start-6 end-6 font-display text-coord uppercase tracking-[0.14em] text-cream-100 sm:bottom-8 sm:start-8 sm:end-8">
                {t("imageCaption")}
              </p>
            </div>
          </div>

          <div className="relative z-10 grid border-t border-cream-100/20 sm:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier}
                className="flex min-h-20 items-center gap-4 border-b border-cream-100/20 py-5 last:border-b-0 sm:min-h-24 sm:border-b-0 sm:border-s sm:px-7 sm:first:border-s-0 lg:px-10"
              >
                <span className="size-2 shrink-0 border border-gold-500" aria-hidden />
                <span className="font-display text-data-sm uppercase tracking-[0.12em] text-cream-50">
                  {t(tier)}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10 flex flex-col gap-3 border-t border-cream-100/20 py-5 text-body-sm text-cream-200/70 sm:flex-row sm:items-center sm:justify-between">
            <p>{t("tiersNote")}</p>
            <Link
              href="/contact"
              className="w-fit font-display text-coord uppercase tracking-[0.12em] text-cream-100 underline-offset-4 transition-colors hover:text-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
