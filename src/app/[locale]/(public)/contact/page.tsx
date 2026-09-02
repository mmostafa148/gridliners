import type { Metadata } from "next";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SOCIAL_ACCOUNTS } from "@/components/brand/social-icons";
import { EnquiryForm } from "@/components/marketing/enquiry-form";
import { NewsletterBand } from "@/components/marketing/newsletter-band";
import { PageHeader } from "@/components/marketing/page-header";
import type { Locale } from "@/i18n/routing";

/**
 * Contact.
 *
 * **Routes first, form second.** Somebody with a deadline question needs a
 * phone number, not a textarea, and burying four addresses under a form is how
 * a site turns a two-minute answer into a two-day one. The form is for
 * everything the routes do not cover.
 *
 * The addresses are split by what they answer rather than by department, since
 * a visitor knows what they are asking about and does not know how the
 * programme is organised.
 */

/**
 * The four routes, each on its own panel of the campaign palette.
 *
 * They were four rows of a hairline table, which is how a directory looks, not
 * how a choice looks - and choosing the right address is the whole job of this
 * page. The palette is campaign-accent only and never base UI (Consolidated
 * Decisions §3); a marketing page is the campaign, which is the reading
 * `testimonials.tsx` already makes, and `EnquiryForm` reaches for the same lime
 * for its own success state. The pairings and their navy ink are taken from
 * there rather than re-picked, so contrast is the one already proven on Home.
 */
const ROUTES = [
  {
    key: "generalLabel",
    value: "hello@gridliners.example",
    Icon: Mail,
    panel: "bg-campaign-lime",
    quiet: "text-navy-900/75",
  },
  {
    key: "entriesLabel",
    value: "entries@gridliners.example",
    Icon: Mail,
    panel: "bg-campaign-orange",
    quiet: "text-navy-900/80",
  },
  {
    key: "pressLabel",
    value: "press@gridliners.example",
    Icon: Mail,
    panel: "bg-campaign-teal",
    quiet: "text-navy-900/75",
  },
  {
    key: "partnersLabel",
    value: "partners@gridliners.example",
    Icon: Mail,
    panel: "bg-campaign-yellow",
    quiet: "text-navy-900/75",
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("lead") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      {/* ---- the routes: pick the one that fits ------------------------- */}
      <section
        aria-labelledby="contact-details"
        className="bg-white text-navy-900"
      >
        <div className="page-shell section-y">
          <h2
            id="contact-details"
            className="flex items-center gap-4 font-display text-coord uppercase text-navy-600"
          >
            <span aria-hidden className="h-px w-10 shrink-0 bg-blue-700" />
            {t("detailsTitle")}
          </h2>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROUTES.map(({ key, value, Icon, panel, quiet }) => (
              <li key={key}>
                {/* The whole panel is the link, so the target is the panel and
                    not four words inside it. */}
                <a
                  href={`mailto:${value}`}
                  className={`group flex h-full flex-col text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${panel}`}
                >
                  <span className="flex flex-1 flex-col p-7 pb-6">
                    <Icon
                      aria-hidden
                      className="size-5 shrink-0"
                      strokeWidth={1.75}
                    />
                    <span
                      className={`mt-6 font-display text-coord uppercase ${quiet}`}
                    >
                      {t(key)}
                    </span>
                  </span>
                  {/* The address sits on its own dark bar rather than on the
                      colour.
                      Measured, not assumed: on the orange panel it computed at
                      5.97:1 and *composited* at 3.41:1, because Arabic renders
                      this Latin string in a thinner face at 18px and thin
                      strokes on a bright ground blend into it. Weight and a
                      darker ink only reached 3.71. A bar carries every panel at
                      the same ratio whatever the face does, and it reads as the
                      thing you click. */}
                  <span className="flex items-center gap-2 bg-navy-950 px-7 py-4 text-body-md font-medium text-cream-50 [overflow-wrap:anywhere]">
                    {value}
                    <ArrowRight
                      aria-hidden
                      className="ms-auto size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                    />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- the form, and the details that are not an address ----------- */}
      <section className="bg-mist text-navy-900">
        <div className="page-shell section-y">
          <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <dl className="space-y-8">
                <div>
                  <dt className="flex items-center gap-3 font-display text-coord uppercase text-navy-600">
                    <Phone
                      aria-hidden
                      className="size-4 text-blue-700"
                      strokeWidth={1.75}
                    />
                    {t("phoneLabel")}
                  </dt>
                  <dd className="mt-3">
                    <a
                      href="tel:+97140000000"
                      className="font-data text-h3 tabular-nums text-navy-950 underline underline-offset-4 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      dir="ltr"
                    >
                      +971 4 000 0000
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-3 font-display text-coord uppercase text-navy-600">
                    <MapPin
                      aria-hidden
                      className="size-4 text-blue-700"
                      strokeWidth={1.75}
                    />
                    {t("addressLabel")}
                  </dt>
                  <dd className="mt-3 max-w-[34ch] text-body-md text-navy-900">
                    {t("address")}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-3 font-display text-coord uppercase text-navy-600">
                    <Clock
                      aria-hidden
                      className="size-4 text-blue-700"
                      strokeWidth={1.75}
                    />
                    {t("hoursLabel")}
                  </dt>
                  <dd className="mt-3 max-w-[34ch] text-body-md text-navy-900">
                    {t("hours")}
                    <span className="mt-2 block text-body-sm text-navy-600">
                      {t("hoursNote")}
                    </span>
                  </dd>
                </div>
              </dl>

              <div className="mt-10 border-t border-navy-900/12 pt-8">
                <h3 className="font-display text-coord uppercase text-navy-600">
                  {t("socialLabel")}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {SOCIAL_ACCOUNTS.map(({ network, href, Icon }) => (
                    <li key={network}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={network}
                        className="flex size-11 items-center justify-center border border-navy-900/20 bg-white text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      >
                        <Icon className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              {/* The heading sits with the form, not across the band from it.
                  Placed in the first column it read as the title of the phone
                  number and the opening hours. */}
              <h2 className="text-h2 leading-tight">{t("formTitle")}</h2>
              {/* The form keeps its own light ground: it styles its fields and
                  its success card for one, so a dark band would take the
                  labels with it. */}
              <div className="mt-8">
                <EnquiryForm variant="contact" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterBandForContact locale={locale} />
    </>
  );
}

// `tNews` rather than `t`: `check-messages` binds one namespace per variable
// NAME per file, so a second `t` here would rebind every use above it to this
// namespace and report the whole page as missing keys.
async function NewsletterBandForContact({ locale }: { locale: Locale }) {
  const tNews = await getTranslations({ locale, namespace: "news" });
  return (
    <NewsletterBand
      title={tNews("newsletterTitle")}
      lead={tNews("newsletterLead")}
    />
  );
}
