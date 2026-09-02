import { Film, FileText, Images, Square } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * What to have ready, and why bother.
 *
 * The four items are the four fields an entry's media actually has
 * (`EntryMedia`: cover, gallery, documents, video), not a general checklist
 * written for a marketing page. Nothing here states a count, a file size or a
 * format, because none of those exist in the model yet and inventing them here
 * would put a number on the public site that the wizard would then have to
 * honour.
 *
 * Ceremonial ground, and the only section on the page that is. Everything
 * above it is a fact a reader is checking themselves against; this is the part
 * that argues, and it should not look like more table.
 *
 * The benefits are four claims the platform can actually keep, each traceable
 * to a rule: tier separation, published criteria, entry content shown as
 * submitted and never translated, and the winner assets. No superlatives,
 * because the numbers above have already done the persuading.
 *
 * **The gold is gone from both halves.** Gold means *current or awarded* on
 * this build — the live phase, the live window, the live edition — and it was
 * being spent here on four file-format icons and four bullet squares, which
 * are neither. That is the token's meaning diluted across a page that uses it
 * correctly three sections earlier. Cream carries the marks now, blue carries
 * the claims.
 *
 * **No rules between the four items.** A hairline lattice around four
 * equal cells is a table with its borders half rubbed out, and there is
 * nothing here for it to be structure *of*: these are four separate things to
 * go and find, not four cells of one grid. Space separates them instead.
 *
 * The two halves are deliberately treated differently. Four icons above four
 * icons would read as one list of eight; the claims get scale and a rule of
 * their own instead, because they are the part of this page that argues.
 */

const PREPARE = [
  { key: "cover", Icon: Square },
  { key: "gallery", Icon: Images },
  { key: "documents", Icon: FileText },
  { key: "video", Icon: Film },
] as const;

const BENEFITS = ["benefit1", "benefit2", "benefit3", "benefit4"] as const;

export async function SubmissionGuidelines() {
  const t = await getTranslations("enter.prepare");

  return (
    <section className="bg-navy-950 text-cream-100">
      <div className="page-shell section-y">
        <h2 className="text-h1 text-cream-100">{t("title")}</h2>
        <p className="mt-5 max-w-2xl text-body-md text-cream-200/75">
          {t("description")}
        </p>

        <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {PREPARE.map(({ key, Icon }) => (
            <li key={key}>
              {/* The mark sits on a square of its own ground, one shade off the
                  section. It gives four small glyphs on a large dark field
                  something to sit on, which is what the hairline lattice was
                  doing badly. */}
              <span
                aria-hidden
                className="flex size-12 items-center justify-center bg-cream-100/8"
              >
                <Icon className="size-5 text-cream-100" strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 min-h-[1.4em] text-h4 text-cream-50">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-3 max-w-[34ch] text-body-sm text-cream-200/75">
                {t(`${key}.body`)}
              </p>
            </li>
          ))}
        </ul>

        {/* Anchored for the Awards menu's "Benefits" item - the sitemap names
            it as its own branch, and this is where that content lives. */}
        <div id="benefits" className="scroll-mt-[calc(var(--chrome-h)+2rem)] mt-16 border-t border-cream-200/20 pt-12 lg:mt-20">
          <h3 className="text-h2 text-cream-50">{t("benefitsTitle")}</h3>
          {/* Four across at `lg`, not two. In two columns these four claims
              stopped at the halfway line and left the other half of a
              full-width section empty under them. */}
          <ul className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((key) => (
              <li key={key}>
                {/* The identity's square rather than a second icon set: these
                    are claims, not things you go and find, and four more
                    glyphs directly under four glyphs would read as one list of
                    eight. Above the claim rather than beside it, so the type
                    starts on the column's own edge. */}
                <span
                  aria-hidden
                  className="block h-1 w-8 bg-blue-500"
                />
                {/* A two-line floor, so four claims put their prose on the
                    same baseline whether the title wraps or not. "Scores with
                    criteria attached" wraps at this measure and the other
                    three do not, which dropped its body a line below its
                    neighbours. */}
                <h4 className="mt-5 min-h-[2.8em] text-h4 text-cream-50">
                  {t(`${key}.title`)}
                </h4>
                <p className="mt-3 max-w-[34ch] text-body-sm text-cream-200/75">
                  {t(`${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
