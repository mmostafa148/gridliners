import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { ProjectStanding as Standing, VotingState } from "@/lib/project";
import { cn } from "@/lib/utils";

/**
 * The groups this work stands in, and what each of them awarded it.
 *
 * **This is the page's structural idea.** A project here is not a portfolio
 * piece; it is a work entered into one or more groups and ranked inside each of
 * them by a single shared pool of public votes (Addendum §1.2;
 * consolidated-decisions §20). `e-101` competes in Brand Identity Redesign x
 * Corporate *and* Logo Design x Corporate and took Gold in one and Bronze in
 * the other, off one count. Nothing else on this site says that, and no other
 * awards page has to.
 *
 * **The count and the Vote action are not here.** They are in
 * `ProjectVoteBar`, docked under the header, because the action has to be in
 * reach at every scroll position rather than at one point in the page. One
 * count and one action, however many groups - "one vote per project per email"
 * is the hard constraint (CD §61) and a `GroupResult` carries the same total in
 * each of an entry's groups, so a button per band would state a rule that does
 * not exist.
 *
 * **A card per group, on a grid.** The list version put one band across the
 * full measure per group, which spent a screen on two facts. Cards state the
 * same thing at the size it is worth and let two or three sit in a row.
 *
 * The medal is drawn only where a group actually awarded one. A withheld medal
 * is "simply not awarded" (§36) and carries none, exactly as 1.7 settled.
 *
 * **Four states, and the phase decides which** - resolved in `lib/project.ts`
 * before this component sees anything, never inferred from the voting window's
 * dates. A window may be extended before close (Addendum §40), and a page that
 * read the clock would contradict the platform the moment one was.
 */

const METAL: Record<"gold" | "silver" | "bronze", string> = {
  gold: "bg-gold text-navy-900",
  silver: "bg-silver text-navy-900",
  bronze: "bg-bronze text-white",
};

export async function ProjectStanding({
  standings,
  state,
  locale,
}: {
  standings: Standing[];
  state: VotingState;
  locale: Locale;
}) {
  const [t, tTier, tLevel] = await Promise.all([
    getTranslations("project.standing"),
    getTranslations("tier"),
    getTranslations("winners.level"),
  ]);

  return (
    <section
      id="standing"
      aria-labelledby="standing-title"
      className="bg-navy-950 text-cream-100"
    >
      <div className="page-shell section-y">
        {/* The heading holds one side, the cards the other. A row of cards
            under a full-width heading left an empty cell on the end whenever a
            project stood in fewer groups than the row had columns - which is
            almost every project, since most stand in one or two. */}
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="standing-title" className="text-h1 text-balance">
              {state === "pre_voting"
                ? t("preVotingTitle")
                : state === "closed"
                  ? t("closedTitle")
                  : t("title")}
            </h2>
            <p className="mt-5 max-w-[46ch] text-body-md text-cream-200/85">
              {state === "pre_voting"
                ? t("preVotingDescription")
                : state === "open"
                  ? t("openDescription")
                  : state === "closed"
                    ? t("closedDescription")
                    : t("resultsDescription")}
            </p>
          </div>

          {/* Rows on a rule, not tiles in a box.
              Bordered cards on a grid left a project standing in one group -
              which is most of them - as a single small tile marooned in a
              full-width dark band. A row takes the whole measure it is given
              however many there are, so one reads as deliberate and three read
              as a list. */}
          <ul className="lg:col-span-6 lg:col-start-7">
            {standings.map(({ subCategory, tier, medal }) => (
              <li
                key={`${subCategory.id}-${tier}`}
                data-standing={medal ?? "none"}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-cream-100/25 py-7 last:border-b"
              >
                <span className="flex flex-col gap-2">
                  <span className="text-h2 leading-tight text-cream-50">
                    {subCategory.name[locale]}
                  </span>
                  <span className="font-display text-coord uppercase text-cream-200/75">
                    {tTier(tier)}
                  </span>
                </span>

                {medal ? (
                  <span
                    className={cn(
                      "shrink-0 px-5 py-2 font-display text-coord uppercase",
                      METAL[medal],
                    )}
                  >
                    {tLevel(medal)}
                  </span>
                ) : state === "results" ? (
                  /* The results are out and this group gave it no medal. It
                     says that it was ranked, and nothing about where - a
                     placing this page has no business publishing. */
                  <span className="shrink-0 font-display text-coord uppercase text-cream-200/70">
                    {t("noMedal")}
                  </span>
                ) : (
                  <span className="shrink-0 font-display text-coord uppercase text-cream-200/60">
                    {t("groupLabel")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
