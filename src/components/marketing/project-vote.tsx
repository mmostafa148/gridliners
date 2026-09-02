"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { OtpModal } from "@/components/shared/otp-modal";
import { Button } from "@/components/ui/button";
import type { VotingState } from "@/lib/project";
import { cn } from "@/lib/utils";

/**
 * One vote, in two places, with one state.
 *
 * The action now appears twice - as the hero's call to action and in the bar
 * that docks under the header - and **both have to be the same vote**. Two
 * components each holding their own `useState` would show 1,420 in one and
 * 1,421 in the other the moment somebody voted, so the count, the voted flag
 * and the modal live here and both surfaces read them.
 *
 * **The bar hides while the hero's button is on screen.** They are the same
 * action; showing both at once is the page asking twice. A sentinel at the foot
 * of the hero drives it, so the bar arrives exactly as the hero's own button
 * leaves - no scroll listener, no measured offsets.
 */

interface VoteState {
  count: number;
  voted: boolean;
  state: VotingState;
  open: () => void;
}

const Ctx = createContext<VoteState | null>(null);

/**
 * The bar watches the hero's own action, not the foot of the hero.
 *
 * It used to watch a sentinel placed just after the hero. That held while the
 * hero was a band; once the hero became full height the sentinel sat a whole
 * screen below the fold at rest, so the bar docked immediately and the page
 * offered the same vote twice, one above the other. Watching the action itself
 * is what the rule always meant, and it holds at any hero height.
 */
const HERO_VOTE_ID = "hero-vote";

function useVote() {
  const value = useContext(Ctx);
  if (!value) throw new Error("Vote surfaces must be inside <ProjectVoteProvider>");
  return value;
}

export function ProjectVoteProvider({
  entryId,
  projectTitle,
  votes,
  state,
  children,
}: {
  entryId: string;
  projectTitle: string;
  votes: number;
  state: VotingState;
  children: React.ReactNode;
}) {
  const [modal, setModal] = useState(false);
  const [count, setCount] = useState(votes);
  const [voted, setVoted] = useState(false);

  return (
    <Ctx.Provider value={{ count, voted, state, open: () => setModal(true) }}>
      {children}
      {/* Mounted only while voting is open, so a page in any other state does
          not carry the vote machinery at all. */}
      {state === "open" ? (
        <OtpModal
          open={modal}
          onOpenChange={setModal}
          entryId={entryId}
          projectTitle={projectTitle}
          onVoted={() => {
            setVoted(true);
            setCount((n) => n + 1);
          }}
        />
      ) : null}
    </Ctx.Provider>
  );
}

/** The count, wherever it is shown. */
function Count({ size }: { size: "hero" | "bar" }) {
  const { count } = useVote();
  const t = useTranslations("project.standing");
  return (
    <p className="flex items-baseline gap-3">
      <span
        className={cn(
          "font-data leading-none tabular-nums text-cream-50",
          size === "hero" ? "text-data-lg" : "text-data-md",
        )}
      >
        <span className="sr-only">{t("votes", { count })}</span>
        <span aria-hidden data-vote-count>{count}</span>
      </span>
      <span aria-hidden className="font-display text-coord uppercase text-cream-200/75">
        {t("votesUnit")}
      </span>
    </p>
  );
}

/**
 * The count, on its own, at the start of the hero's action band.
 *
 * Split from the action so the two can sit at opposite ends of the measure: a
 * figure is a fact about the project and belongs with the rest of its facts,
 * while the button is something to press and belongs with the other things a
 * reader can press.
 *
 * Absent before voting opens - a zero there would read as a result rather than
 * as a window that has not started.
 */
export function HeroVoteCount() {
  const { state } = useVote();
  if (state === "pre_voting") return null;
  return <Count size="hero" />;
}

/**
 * What a reader can do about it, at the end of the measure.
 *
 * **This carries `#hero-vote`, and the docked bar watches it.** The bar is this
 * action's replacement once it scrolls away, so the thing observed has to be
 * the action itself - not the count beside it, and not the foot of the hero,
 * which at full height is a screen below the fold at rest.
 *
 * It always renders something: the button while voting is open, the
 * confirmation once a vote lands, and otherwise the state, because an absence
 * with no explanation reads as a missing button (build-state §32).
 */
export function HeroVoteAction() {
  const { state, voted, open } = useVote();
  const t = useTranslations("project.standing");

  if (state === "pre_voting") {
    return (
      <p id={HERO_VOTE_ID} className="font-display text-coord uppercase text-cream-200/85">
        {t("preVotingTitle")}
      </p>
    );
  }

  if (state !== "open") {
    return (
      <p id={HERO_VOTE_ID} className="font-display text-coord uppercase text-cream-200/85">
        {t("closedTitle")}
      </p>
    );
  }

  return (
    <div id={HERO_VOTE_ID}>
      {voted ? (
        /* Announced here as well as in the modal: the modal closes, and the
           page must still say what happened for a reader who was not watching
           it. */
        <p aria-live="polite" className="font-display text-coord uppercase text-campaign-lime">
          {t("voted")}
        </p>
      ) : (
        <Button size="cta" variant="secondary" onClick={open}>
          {t("vote")}
        </Button>
      )}
    </div>
  );
}

/**
 * The docked bar, which appears once the hero's own button has gone.
 *
 * `sentinel` is an empty element at the foot of the hero: while it is on
 * screen the hero's action is too, and the bar stays out of the way.
 */
export function VoteBar() {
  const { state, voted, open } = useVote();
  const t = useTranslations("project.standing");
  const sentinel = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    // The hero's action where there is one; the sentinel after the hero is the
    // fallback for a page that renders no hero action at all.
    const el = document.getElementById(HERO_VOTE_ID) ?? sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setDocked(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (state === "pre_voting") return null;

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      <div
        id="vote-bar"
        // `--chrome-h` is what the layout says the fixed chrome measures, so
        // the bar docks against it rather than under it - and stays correct
        // on a day when no announcement is live and the bar above is gone.
        // Fixed, not sticky. A sticky bar sits in the flow and holds its
        // height open even when it is faded out, which left a bare navy strip
        // between the hero and the story for as long as the hero was on
        // screen. Fixed, it costs no layout at all until it is wanted.
        className={cn(
          "fixed inset-x-0 top-[var(--chrome-h)] z-30 border-b border-cream-100/15 bg-navy-950/95 backdrop-blur transition-all duration-300 motion-reduce:transition-none",
          docked ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="page-shell flex items-center justify-between gap-6 py-3">
          <p className="hidden min-w-0 truncate font-display text-coord uppercase text-cream-200/75 sm:block">
            {t("title")}
          </p>
          <div className="flex shrink-0 items-center gap-5">
            <Count size="bar" />
            {state === "open" ? (
              voted ? (
                <p aria-live="polite" className="font-display text-coord uppercase text-campaign-lime">
                  {t("voted")}
                </p>
              ) : (
                <Button size="cta-sm" variant="secondary" onClick={open}>
                  {t("vote")}
                </Button>
              )
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
