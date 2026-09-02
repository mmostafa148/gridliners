import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { LegalDoc } from "@/lib/fixtures/legal";

/**
 * A legal document, built for reading rather than for filing.
 *
 * **The contents list and the headings come from the same data**, so a section
 * cannot appear in the navigation and be missing from the document, or be
 * renamed in one and not the other.
 *
 * The measure is `page-shell-prose`. A terms page set across a 1,600px column
 * is a terms page nobody finishes, and "nobody read it" is the failure mode
 * this kind of document is most prone to.
 *
 * **The provisional notice is on the page, not only in the repository.** Text
 * that has not been through legal review should say so to the person relying
 * on it, and it is placed before the first clause rather than after the last.
 */
export async function LegalDocument({
  doc,
  locale,
}: {
  doc: LegalDoc;
  locale: Locale;
}) {
  const t = await getTranslations("legal");
  const updated = new Date(doc.updatedAt).toLocaleDateString(
    locale === "ar" ? "ar" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="bg-white text-navy-900">
      <div className="page-shell section-y">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          {/* The contents stick beside the document on a wide screen, because a
              reader who wants clause six should not have to scroll to find out
              there is one. */}
          <nav aria-labelledby="contents-title" className="lg:col-span-3">
            <div className="lg:sticky lg:top-[calc(var(--chrome-h)+2rem)]">
              <h2
                id="contents-title"
                className="font-display text-coord uppercase text-navy-600"
              >
                {t("contents")}
              </h2>
              <ol className="mt-5 border-t border-navy-900/15">
                {doc.sections.map((s, i) => (
                  <li key={s.id} className="border-b border-navy-900/15">
                    <a
                      href={`#${s.id}`}
                      className="flex gap-3 py-3 text-body-sm text-navy-600 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      <span aria-hidden className="font-data tabular-nums text-navy-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.heading[locale]}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="mt-6 font-display text-coord uppercase text-navy-600">
                {t("updated", { date: updated })}
              </p>
            </div>
          </nav>

          <div className="lg:col-span-8 lg:col-start-5">
            <aside className="border-s-2 border-blue-700 bg-mist p-6 lg:p-7">
              <p className="font-display text-coord uppercase text-blue-700">
                {t("provisionalTitle")}
              </p>
              <p className="mt-3 max-w-[62ch] text-body-md text-navy-600">
                {t("provisionalBody")}
              </p>
            </aside>

            {doc.sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="mt-14 scroll-mt-[calc(var(--chrome-h)+2rem)]"
              >
                <h2 className="flex items-baseline gap-4 text-h2 leading-tight">
                  <span aria-hidden className="font-data text-data-sm tabular-nums text-navy-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading[locale]}
                </h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="mt-5 max-w-[68ch] text-body-md leading-relaxed text-navy-600">
                    {p[locale]}
                  </p>
                ))}
              </section>
            ))}

            <p className="mt-14 border-t border-navy-900/15 pt-6">
              <a
                href="#main-content"
                className="font-display text-coord uppercase text-navy-600 underline underline-offset-4 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {t("backToTop")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
