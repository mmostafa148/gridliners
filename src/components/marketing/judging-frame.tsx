import { getTranslations } from "next-intl/server";

/**
 * How judging works, and the framework it works through.
 *
 * Four facts in order, because they are a sequence and not a list: a juror
 * scores 0 to 100, against criteria published in advance, an entry that clears
 * its tier's threshold is shortlisted, and the public then decides the rank.
 * The last one matters most and is the one an entrant is most likely to have
 * wrong: jury scoring decides who is shortlisted, not who wins.
 *
 * Then the framework itself. "Published weighted criteria" is a claim, and the
 * only honest way to make it on a public page is to publish them, so all seven
 * parent sets are here with their weights, straight from `api.taxonomy`. Each
 * set sums to 100 and is shown per parent rather than pooled, because a
 * criterion belongs to a category and an entry is only ever scored against its
 * own.
 *
 * The three threshold numbers are deliberately NOT repeated here. Fact 03 says
 * that a threshold exists and is per tier; the numbers themselves belong to the
 * fairness section below, where each sits with its own tier and with the
 * sentence explaining why three different bars are not a ranking. Printed twice
 * a screen apart they were the same fact stated once too often, and the second
 * telling is the one that carries the meaning.
 *
 * The framework itself moved to its own section below the panel when the juror
 * grid was promoted (§1.5 `[map-update]`, 2026-08-23). This block is the four
 * facts alone.
 */
export async function JudgingFrame() {
  const t = await getTranslations("jury.judging");

  const facts = ["scale", "criteria", "threshold", "rank"] as const;

  return (
    <section className="bg-white text-navy-900">
      <div className="page-shell section-y">
        <h2 className="text-h1 text-balance">{t("title")}</h2>

        {/* Numbered because it is genuinely a sequence: score, then compare
            against the threshold, then hand the ranking to the public. */}
        <ol className="mt-10 grid gap-x-14 gap-y-9 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {facts.map((fact, i) => (
            <li key={fact}>
              <p
                aria-hidden
                className="font-data text-data-md leading-none tabular-nums text-blue-700"
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 text-h4 text-balance">{t(`${fact}Title`)}</h3>
              <p className="mt-2 max-w-[38ch] text-body-sm text-navy-600">
                {t(`${fact}Body`)}
              </p>
            </li>
          ))}
        </ol>

      </div>
    </section>
  );
}
