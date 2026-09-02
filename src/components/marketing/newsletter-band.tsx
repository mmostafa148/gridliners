import { NewsletterForm } from "@/components/layout/newsletter-form";

/**
 * The blue close.
 *
 * §1A Tier 1: a public page ends on blue. This is that band for the screens
 * whose own action is a subscription rather than an entry, and it reuses the
 * footer's form rather than growing a second one - two signup forms on one page
 * is two lists waiting to disagree.
 */
export function NewsletterBand({ title, lead }: { title: string; lead: string }) {
  return (
    <section aria-labelledby="newsletter-band-title" className="bg-blue-700 text-cream-50">
      <div className="page-shell section-y">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <h2 id="newsletter-band-title" className="text-h1 text-balance">
              {title}
            </h2>
            <p className="mt-4 max-w-[52ch] text-body-md text-cream-100/90">{lead}</p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
