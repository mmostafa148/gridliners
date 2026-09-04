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
 * The light field is deliberately free of rails and boxes. The following
 * testimonial section is dark, so this section creates the pause between the
 * partner wall and those stories without adding another visual system. The
 * award moment is not decorative stock: sponsor marks are visible on stage,
 * so the image demonstrates the promise in the copy instead of repeating it.
 */
export async function BecomePartner() {
  const t = await getTranslations("home.becomePartner");
  const tiers = ["supporter", "partner", "principal"] as const;

  return (
    <section className="overflow-hidden bg-[#f3f3f9] text-navy-900">
      <div className="page-shell">
        <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(25rem,0.92fr)]">
          <div
            data-motion-heading
            className="flex flex-col items-start justify-center py-16 sm:py-20 lg:pe-16 lg:py-24 xl:pe-24"
          >
            <div className="flex items-center gap-3 font-display text-coord uppercase tracking-[0.16em] text-blue-700">
              <span className="size-1.5 bg-blue-700" aria-hidden />
              <span>{t("cycleLabel")}</span>
              <span className="text-gold-600" aria-hidden>/</span>
              <span className="font-data text-navy-600">2026</span>
            </div>

            <h2 className="mt-8 max-w-[15ch] text-display-md leading-[1.02] text-balance">
              {t("title")}
            </h2>
            <p className="mt-6 max-w-[42rem] text-body-lg text-navy-600">
              {t("description")}
            </p>

            <div className="mt-8 flex w-full flex-nowrap items-center gap-x-3 text-caption font-semibold uppercase tracking-[0.04em] text-navy-900 sm:gap-x-4">
              {tiers.map((tier, index) => (
                <span key={tier} className="flex items-center gap-3 whitespace-nowrap sm:gap-4">
                  {index > 0 ? (
                    <span className="text-gold-600" aria-hidden>/</span>
                  ) : null}
                  <span>{t(tier)}</span>
                </span>
              ))}
            </div>

            <Button asChild variant="award" size="cta" className="mt-10">
              <Link href="/partner">{t("cta")}</Link>
            </Button>
          </div>

          <div
            data-motion-media
            className="relative -mx-5 min-h-[22rem] overflow-hidden bg-navy-950 sm:-mx-8 sm:min-h-[30rem] lg:mx-0 lg:min-h-[40rem]"
          >
            <Image
              src="/media/award-moment.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
