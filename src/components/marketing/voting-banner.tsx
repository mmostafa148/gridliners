import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Voting is open.
 *
 * Rendered only when the **phase** says so. `lib/cycle-phase.ts` settles why:
 * Admin controls phase transitions (§3.1) and a window can be extended before
 * it closes, so the phase is the authority and a date comparison is not.
 *
 * **It publishes no deadline and no countdown, and that is the point.** The
 * phase authorises the open state and nothing more. It does not carry a closing
 * instant, and a stored `votingWindow.end` that has already passed proves
 * nothing: not that the window was extended, not that it was not, and certainly
 * not what any new deadline would be. Printing the expired instant would state
 * a falsehood; narrating an extension would invent one; a `Countdown` would
 * render "Closed" directly beneath a banner saying voting is open. So the band
 * says the two things that are true and verifiable - voting is open, and here
 * is how a vote is cast - and the missing authoritative closing instant is
 * logged as a data gap rather than papered over on the page.
 *
 * Navy, not blue. §1A puts navy where a different system starts, and this is
 * the one block on the page that is about the cycle's state rather than about
 * the shortlist. It also leaves blue to close the page, where it is spent once.
 *
 * **The one action here goes to the jury, and the distinction matters.** This
 * band carried a "Go to the shortlist" anchor once, which scrolled the reader
 * to the section directly beneath it - a call to action for something already
 * on screen, and it was removed for that. The rule that came out of it was
 * about self-reference, not about buttons: an action has to have somewhere to
 * go. It still cannot offer a vote, because voting happens on a project's own
 * page and picking one finalist to link to would be exactly the preference this
 * screen refuses to express. But the first thing the copy says is that the jury
 * decided who is here, and the jury has a page. Sending a reader to it is the
 * one honest destination this band has.
 *
 * Outline rather than solid, and secondary by intent: the page closes on a
 * blue `ClosingCta` with a solid cream primary, and two filled buttons on one
 * page argue about which is the action.
 *
 * "Meet the full panel" is Home's own wording for this exact destination, not a
 * second name invented for it here.
 *
 * **No seam at its head.** It broke out of the white section above it in the
 * pixel motif, the same gesture the closing band uses. Removed on request
 * 2026-08-26, and the reserved dissolve height went with it - that padding
 * existed only to keep the copy clear of cells that are no longer there.
 */
export async function VotingBanner() {
  const t = await getTranslations("finalists.voting");

  return (
    <section className="relative overflow-hidden bg-navy-950 text-cream-100">
      <div className="page-shell section-y relative">
        <p className="font-display text-coord uppercase text-cream-200/75">
          {t("eyebrow")}
        </p>

        {/* Top-aligned. Bottom-aligning a one-line heading against four lines
            of copy pushed the heading down and left a hole above it. */}
        <div className="mt-5 grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-start">
          <h2 className="text-h1 text-balance lg:col-span-6">{t("title")}</h2>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="max-w-[52ch] text-body-md text-cream-200/85">{t("body")}</p>
            <p className="mt-4 max-w-[52ch] text-body-sm text-cream-200/75">{t("how")}</p>

            <Button
              asChild
              variant="outline"
              size="cta"
              className="mt-8 w-full border-cream-100/40 bg-transparent text-cream-100 hover:bg-cream-100/10 hover:text-cream-50 sm:w-auto"
            >
              <Link href="/jury-panel">{t("juryLink")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
