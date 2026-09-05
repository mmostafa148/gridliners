"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { ParentMark } from "@/components/brand/parent-mark";
import { TierMark } from "@/components/brand/tier-mark";
import { ProjectPlaceholder } from "@/components/shared/project-placeholder";
import { EmptyState } from "@/components/shared/status-patterns";
import { Link } from "@/i18n/navigation";
import type { Tier } from "@/lib/api/types";
import type {
  FilterSubOption,
  FinalistView,
  ParentView,
  ShortlistView,
  TierView,
} from "@/lib/finalists-view";
import { cn } from "@/lib/utils";

/**
 * How many finalists a parent shows before offering the rest.
 *
 * A real cycle puts thirty in one parent inside one tier. Rendered whole that
 * is a wall that buries every parent after it; the overflow is hidden by class
 * rather than withheld, so every finalist stays in the document, crawlable and
 * findable with the browser's own search.
 */
const VISIBLE = 6;

/**
 * The shortlist itself: three tiers, each grouped parent category then
 * sub-category, with a filter across the category axis.
 *
 * **The filter is asymmetric and that is the whole design.** It narrows which
 * parent categories are shown and never touches the tier axis: choose Type and
 * you get Type's groups inside all three tier sections, each saying what it
 * holds. Tier separation is a judging rule - entries are only ever compared
 * inside their own tier - so it may be read through, never hidden by a control.
 * The same reasoning turned the tier tabs into three shown sections (§1.6
 * `[map-update]`), and this is that rule holding under a feature that could
 * easily have broken it.
 *
 * A client component, which this page otherwise avoids. The reason is narrow:
 * the filter has to change the list *and* the counts that describe it, and a
 * filter whose numbers disagree with its own list is worse than no filter.
 * Everything is still rendered to HTML on first paint, so every finalist and
 * every group is in the document before any script runs - the filter refines
 * content that is already there rather than fetching it.
 *
 * The counts are computed from what is on screen. `2 finalists · 2 groups`
 * under a filter means two that match, not two in total.
 */
/**
 * What the reader has narrowed to. `null` is the whole shortlist.
 *
 * Two axes, one selection: a parent shows everything under it, a sub-category
 * shows one group. The tier is a separate selection with its own control, and
 * the two cross-count each other.
 */
type Selection = { parentId: string; subId: string | null } | null;

export function ShortlistBoard({ view }: { view: ShortlistView }) {
  const [selection, setSelection] = useState<Selection>(null);
  const [openParentId, setOpenParentId] = useState<string | null>(null);
  const filterBlockRef = useRef<HTMLDivElement>(null);

  const tFilter = useTranslations("finalists.filter");
  const tTier = useTranslations("tier");
  const tFinalists = useTranslations("finalists");
  const format = useFormatter();

  const selected = selection
    ? (view.options.find((option) => option.id === selection.parentId) ?? null)
    : null;
  const selectedSub =
    selected?.subs.find((sub) => sub.id === selection?.subId) ?? null;

  /**
   * One tier on the page at a time.
   *
   * The three tiers were three stacked sections until 2026-08-27, which put
   * 87% of a 26.6-screen page below the fold - measured, not estimated
   * (§1.6 `[map-update]`). The separation the map protects is intact: all
   * three tiers stay on screen in the selector, named and counted, including
   * a tier a year has none of. What is given up is reading all three
   * shortlists in one scroll.
   *
   * Defaults to the first tier in the model's own order **that has anyone in
   * it**. Plain first-in-order opened 2024 on Students, which that year has
   * none of, so the page landed on an empty state with 3 finalists sitting one
   * click away. Falling through to the first tier keeps a definite answer when
   * a year is empty everywhere.
   */
  const [tierId, setTierId] = useState<Tier>(
    (view.tiers.find((t) => t.finalistCount > 0) ?? view.tiers[0])?.tier,
  );
  const activeTier = view.tiers.find((t) => t.tier === tierId) ?? view.tiers[0];
  const openParent =
    view.options.find((option) => option.id === openParentId) ?? null;

  // One disclosure at a time, dismissed by the same two gestures readers
  // expect from a menu: Escape, or a press anywhere outside the filter block.
  // Keeping this state at board level is also what lets the phone panel live
  // outside the horizontally scrolling row, where it cannot be clipped.
  useEffect(() => {
    if (!openParentId) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenParentId(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !filterBlockRef.current?.contains(event.target)
      ) {
        setOpenParentId(null);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openParentId]);

  /**
   * The category counts are the chosen tier's, not the year's.
   *
   * `view.options` carries each parent's total across all three tiers, which
   * was the right number when all three were on the page. With one tier shown
   * it is the wrong one twice over: the bar said 372 while the tier under it
   * said 143, and clicking a category could land on a parent the tier has none
   * of with no warning. A parent the tier does not hold now reads 0, the same
   * way an empty tier does.
   */
  const tierParent = (id: string) =>
    activeTier?.parents.find((parent) => parent.id === id) ?? null;
  const parentCount = (id: string) => tierParent(id)?.finalistCount ?? 0;
  const subCount = (parentId: string, subId: string) =>
    tierParent(parentId)?.finalists.filter((f) => f.subId === subId).length ??
    0;

  const keep = (parent: ParentView) => !selected || parent.id === selected.id;
  /** A sub-category selection narrows the parent to that one group. */
  const narrow = (parent: ParentView): ParentView => {
    if (!selectedSub) return parent;
    const finalists = parent.finalists.filter(
      (f) => f.subId === selectedSub.id,
    );
    return {
      ...parent,
      finalists,
      slates: parent.slates.filter((slate) => slate.id === selectedSub.id),
      finalistCount: finalists.length,
    };
  };

  return (
    <>
      {/* No heading and no vertical air: the label was naming a control that a
          row of category marks and counts already explains, and the padding was
          holding the shortlist a screen further down.

          Cream, and the cells are cream too, so the band and the bar are one
          ground and the hairlines are what divide it - a single warm slab
          between the navy hero and the white shortlist. Cream is an established
          section ground on this build (`become-partner`, `award-levels`), not a
          colour invented for this bar. It replaced the header's own navy, which
          docked the bar to the hero but left the selected cell reading as a
          hole rather than a choice.

          The first tier section's own top rule draws the boundary beneath. */}
      {/* Tier and category are one cream slab now, not two bands, and the two
          rows are deliberately NOT the same shape.

          They were: both stacked a mark, a large count and a name, so eleven
          cells read as one control at two scales rather than as two axes. Worse,
          the unselected tier cells sat on navy with no boundaries - you could
          not see there were three - while the selected one was cream, the exact
          ground of the row beneath it, so the chosen tier merged downward.

          So the tier is a **switch**: three chips, inline, sized to their words,
          the count trailing at caption scale rather than leading at display
          scale. The category stays the **filter** it was: a full-width grid of
          equal cells with sub-menus. One is a line of choices, the other a grid
          of them, and blue means chosen on both.

          The tier count no longer competes with "All categories", which prints
          the same figure one row down - it is the same fact, and only one of
          them needs to be loud. */}
      {/* One sticky slab from `lg` up, not two sections in flow.
          The shortlist runs 11 screens; a filter that scrolls away means
          scrolling back to the top to change it. It docks under the fixed
          chrome - the announcement bar is 2.5rem and the rail 4.5rem plus its
          hairline - and the two rows travel together, because they are one
          control.
          In flow below `lg`: on a phone the slab is a third of the viewport,
          and a filter that eats a third of every screen is worse than one you
          scroll back to. */}
      <div
        ref={filterBlockRef}
        data-filterblock
        // A hairline at the foot, so the slab has an edge to sit on when it is
        // over the shortlist rather than above it. Harmless in flow, where the
        // first tier heading follows on white anyway.
        /* Offset from `--chrome-h`, not from a hard-coded 2.5rem + 4.5rem.
             The announcement bar is 2.5rem **when there is an announcement** and
             renders nothing when there is not, and `site-frame.tsx` already
             publishes exactly that: `--chrome-h` is `calc(0rem + 4.5rem)` with
             no bar and `calc(2.5rem + 4.5rem)` with one. Hard-coding the bar
             parked this band 40px below the header on every page where no
             announcement was live, with the content scrolling through the gap.
             The fixture's only announcement expired on 2026-08-30, so the site
             had been in that state since. */
        className="border-b border-navy-900/15 lg:sticky lg:top-[calc(var(--chrome-h)+1px)] lg:z-30"
      >
        {view.tiers.length > 1 ? (
          <section className="bg-white">
            <div className="page-shell">
              <ul
                data-tierbar
                aria-label={tFinalists("tier.label")}
                className="-mx-4 flex items-center gap-7 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {view.tiers.map((t) => {
                  const count = t.parents
                    .filter(keep)
                    .map(narrow)
                    .reduce((n, parent) => n + parent.finalistCount, 0);
                  const active = t.tier === tierId;
                  return (
                    <li key={t.tier} className="flex">
                      <button
                        type="button"
                        onClick={() => {
                          setTierId(t.tier);
                          setOpenParentId(null);
                        }}
                        aria-pressed={active}
                        className={cn(
                          "flex shrink-0 items-center gap-2.5 whitespace-nowrap border-b-2 py-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
                          active
                            ? "border-navy-900 text-navy-900"
                            : "border-transparent text-navy-600 hover:text-navy-900",
                        )}
                      >
                        <TierMark tier={t.tier} className="size-4 shrink-0" />
                        {/* The tier is the page's subject, so it is set a step
                          above the category filter under it - `text-h4`
                          against `text-coord`. That size difference is what
                          now separates the two axes; it used to be two grounds
                          and two kinds of box. */}
                        <span className="text-h4">{tTier(t.tier)}</span>
                        <span
                          className={cn(
                            "font-data text-caption tabular-nums",
                            active ? "text-navy-600" : "text-navy-600",
                          )}
                        >
                          {format.number(count)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ) : null}

        {view.options.length > 1 ? (
          <section className="bg-white">
            <div className="page-shell">
              {/* A line, not a grid. The grid forced every category to the same
                width whatever its name, needed a column count that had to be
                computed per year, and left empty tracks on a short year. A row
                that scrolls needs none of that and reads as one sentence of
                choices. */}
              <ul
                aria-label={tFilter("label")}
                // Scrolls on a phone, WRAPS from `sm` up. Scrolling at every
                // width put "Layout" off the end of a 1440 screen with nothing
                // to say it was there - on a desktop that is worse than the grid
                // this replaced, which at least showed every category at once.
                className="-mx-4 flex items-center gap-x-6 overflow-x-auto border-t border-navy-900/12 px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                <li className="flex shrink-0">
                  <FilterCell
                    active={!selected}
                    onSelect={() => {
                      setSelection(null);
                      setOpenParentId(null);
                    }}
                    parentId={null}
                    name={tFilter("all")}
                    count={activeTier?.finalistCount ?? 0}
                    subs={[]}
                    selectedSubId={null}
                    onSelectSub={() => setSelection(null)}
                    open={false}
                    onOpenChange={() => setOpenParentId(null)}
                  />
                </li>
                {view.options.map((option) => (
                  <li key={option.id} className="flex shrink-0">
                    <FilterCell
                      active={selected?.id === option.id}
                      onSelect={() => {
                        setSelection({ parentId: option.id, subId: null })
                      }}
                      parentId={option.id}
                      name={option.name}
                      count={parentCount(option.id)}
                      subs={option.subs.map((sub) => ({
                        ...sub,
                        count: subCount(option.id, sub.id),
                      }))}
                      selectedSubId={
                        selection?.parentId === option.id
                          ? selection.subId
                          : null
                      }
                      onSelectSub={(subId) => {
                        setSelection({ parentId: option.id, subId });
                        setOpenParentId(null);
                      }}
                      open={openParentId === option.id}
                      onOpenChange={(open) =>
                        setOpenParentId(open ? option.id : null)
                      }
                    />
                  </li>
                ))}
              </ul>

              {/* On a phone the category row must scroll sideways, and CSS
                  scroll containers clip absolutely positioned descendants on
                  the other axis too. The old submenu was opening — its
                  chevron even rotated — but it existed below the clipped edge.
                  Render the active submenu as a sibling of the scroller on
                  small screens; desktop keeps the compact anchored menu. */}
              {openParent?.subs.length ? (
                <div
                  data-mobile-subpanel={openParent.id}
                  className="-mx-4 border-t border-navy-900/12 bg-[#f3f3f9] px-4 py-2 sm:hidden"
                >
                  <SubcategoryChoices
                    name={openParent.name}
                    subs={openParent.subs.map((sub) => ({
                      ...sub,
                      count: subCount(openParent.id, sub.id),
                    }))}
                    selectedSubId={
                      selection?.parentId === openParent.id
                        ? selection.subId
                        : null
                    }
                    onSelectSub={(subId) => {
                      setSelection({ parentId: openParent.id, subId });
                      setOpenParentId(null);
                    }}
                    onSelectParent={() => {
                      setSelection({ parentId: openParent.id, subId: null });
                      setOpenParentId(null);
                    }}
                    className="shadow-none"
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      {activeTier ? (
        <TierSection
          key={activeTier.tier}
          tier={activeTier}
          parents={activeTier.parents.filter(keep).map(narrow)}
          filterName={selectedSub?.name ?? selected?.name ?? null}
          labels={{
            name: tTier(activeTier.tier),
            finalists: (count: number) =>
              tFinalists("index.finalists", { count }),
            slates: (count: number) => tFinalists("index.slates", { count }),
            emptyTitle: tFinalists("tier.empty.title"),
            emptyBody: tFinalists("tier.empty.description"),
            noMatchTitle: tFinalists("tier.noMatch.title"),
            noMatchBody: (category: string) =>
              tFinalists("tier.noMatch.description", { category }),
          }}
        />
      ) : null}
    </>
  );
}

/**
 * One category, and the sub-categories inside it.
 *
 * The cell filters to its parent on click. The panel beneath it lists that
 * parent's sub-categories with their own counts, so a reader can narrow to a
 * single group without first loading the parent and hunting for it.
 *
 * **It opens on hover and on focus, and that pairing is the accessibility of
 * it.** A panel that answers only to a pointer is unreachable by keyboard and
 * absent on touch. A tap filters to the parent and reveals its sub-categories,
 * one gesture doing the obvious two things. Escape and an outside press dismiss
 * it, and it stays open while the pointer is inside it, which is what WCAG
 * 1.4.13 asks of content shown on hover.
 */
function FilterCell({
  active,
  onSelect,
  parentId,
  name,
  count,
  subs,
  selectedSubId,
  onSelectSub,
  open,
  onOpenChange,
}: {
  active: boolean;
  onSelect: () => void;
  /** `null` is the whole set. */
  parentId: string | null;
  name: string;
  count: number;
  subs: FilterSubOption[];
  selectedSubId: string | null;
  onSelectSub: (subId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const format = useFormatter();

  return (
    <div
      className="relative flex w-full"
      onPointerEnter={(event) => {
        if (
          event.pointerType === "mouse" &&
          window.matchMedia("(min-width: 640px)").matches &&
          subs.length
        ) {
          onOpenChange(true);
        }
      }}
      onPointerLeave={(event) => {
        // A narrow layout always uses the persistent, full-width disclosure,
        // including in desktop device emulators that still report a mouse.
        // Treating that emulated pointer as desktop hover made the panel close
        // as soon as the result list reflowed beneath it.
        if (
          event.pointerType === "mouse" &&
          window.matchMedia("(min-width: 640px)").matches
        ) {
          onOpenChange(false);
        }
      }}
      onFocus={() => {
        if (subs.length) onOpenChange(true);
      }}
      onBlur={(event) => {
        // On mobile the visible submenu is a sibling of this cell, but it is
        // still inside the shared filter block. Moving focus into that panel
        // must not close it before the option's click can land.
        const block = event.currentTarget.closest("[data-filterblock]");
        if (!block?.contains(event.relatedTarget as Node)) onOpenChange(false);
      }}
    >
      <button
        type="button"
        onClick={() => {
          onSelect();
          if (subs.length) onOpenChange(true);
        }}
        aria-pressed={active}
        aria-expanded={subs.length ? open : undefined}
        className={cn(
          // **No cell.** Three passes at this bar built it out of filled cells
          // - cream, white on hover, blue when chosen - and each pass got the
          // same note back, because the problem was never which colours the
          // cells were. Eleven boxes, eleven large figures and two saturated
          // blues made a control that competed with the shortlist it exists to
          // narrow. A filter should be quieter than its results.
          //
          // So the cell is a line of type. Chosen is blue with a rule under it,
          // the way a chosen thing is marked in print; hover only warms the
          // text. Nothing is filled and nothing is boxed.
          "flex min-h-11 shrink-0 touch-manipulation items-center gap-2.5 whitespace-nowrap border-b-2 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
          active
            ? "border-blue-700 text-blue-700"
            : "border-transparent text-navy-600 hover:text-navy-900",
        )}
      >
        {/* The mark replaced the two-letter code. The code is the group's key
            and belongs on a group - a coordinate, a slate head - not on a
            control, where it was a second name for a category already spelled
            out beside it. */}
        <ParentMark parentId={parentId} className="size-4 shrink-0" />
        <span className="font-display text-coord uppercase">{name}</span>
        {/* The count trails, small and quiet. It led at `text-h4` on every one
            of eleven cells, which is what made the bar read as a dashboard. */}
        <span
          className={cn(
            "font-data text-caption tabular-nums",
            active ? "text-blue-700/70" : "text-navy-600",
          )}
        >
          {format.number(count)}
        </span>
        {/* Only on cells that open. "All categories" has no sub-categories and
            gets no chevron - an indicator on a control that does nothing is
            worse than none. */}
        {subs.length ? (
          <ChevronDown
            aria-hidden
            className={cn(
              "size-3.5 shrink-0 opacity-70 transition-transform duration-200 motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
        ) : null}
      </button>

      {/* Inside the same wrapper the pointer entered, so it can travel from the
          cell into the panel without it closing under the cursor - what WCAG
          1.4.13 means by hoverable. `hidden` rather than a class, so a closed
          panel leaves the accessibility tree as well as the screen. */}
      {subs.length ? (
        <div
          data-subpanel={parentId ?? undefined}
          hidden={!open}
          className="absolute top-full z-20 hidden min-w-full sm:block"
        >
          <SubcategoryChoices
            name={name}
            subs={subs}
            selectedSubId={selectedSubId}
            onSelectSub={(subId) => {
              onSelectSub(subId);
              onOpenChange(false);
            }}
            onSelectParent={() => {
              onSelect();
              onOpenChange(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function SubcategoryChoices({
  name,
  subs,
  selectedSubId,
  onSelectSub,
  onSelectParent,
  className,
}: {
  name: string;
  subs: FilterSubOption[];
  selectedSubId: string | null;
  onSelectSub: (subId: string) => void;
  onSelectParent: () => void;
  className?: string;
}) {
  const format = useFormatter();
  const tFilter = useTranslations("finalists.filter");

  return (
    <ul
      className={cn(
        "mt-px flex flex-col gap-px bg-navy-900/15 shadow-[0_10px_30px_-12px_rgba(1,9,38,0.45)]",
        className,
      )}
    >
      {subs.map((sub) => (
        <li key={sub.id} className="flex">
          <button
            type="button"
            onClick={() => onSelectSub(sub.id)}
            aria-pressed={selectedSubId === sub.id}
            className={cn(
              "flex min-h-11 w-full touch-manipulation items-baseline justify-between gap-6 whitespace-nowrap px-4 py-3 text-start font-sans text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700 sm:px-5",
              selectedSubId === sub.id
                ? "bg-blue-700 text-cream-100"
                : "bg-white text-navy-900 hover:bg-cream-100",
            )}
          >
            <span>{sub.name}</span>
            <span className="font-sans tabular-nums">
              {format.number(sub.count)}
            </span>
          </button>
        </li>
      ))}
      <li className="flex">
        <button
          type="button"
          onClick={onSelectParent}
          className="min-h-11 w-full touch-manipulation bg-white px-4 py-3 text-start font-sans text-body-sm text-navy-600 transition-colors hover:bg-cream-100 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700 sm:px-5"
        >
          {tFilter("allOf", { category: name })}
        </button>
      </li>
    </ul>
  );
}

function TierSection({
  tier,
  parents,
  filterName,
  labels,
}: {
  tier: TierView;
  parents: ParentView[];
  filterName: string | null;
  labels: {
    name: string;
    finalists: (count: number) => string;
    slates: (count: number) => string;
    emptyTitle: string;
    emptyBody: string;
    noMatchTitle: string;
    noMatchBody: (category: string) => string;
  };
}) {
  const shownFinalists = parents.reduce(
    (n, parent) => n + parent.finalistCount,
    0,
  );
  // Distinct sub-categories on screen. The blocks that used to make them
  // countable are gone, but the number is still the honest shape of a tier.
  const shownSlates = parents.reduce(
    (n, parent) => n + parent.slates.length,
    0,
  );

  return (
    <section
      /* The id stays although nothing in the app links to it: a tier is a real,
         nameable subsection of a year's shortlist and a reader may reasonably
         share one. `scroll-mt` keeps an incoming deep link clear of the rail. */
      id={`tier-${tier.tier}`}
      className="scroll-mt-28 border-t border-navy-900/12 bg-white text-navy-900 md:scroll-mt-32"
    >
      <div className="page-shell section-y">
        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
          {/* The mark sits on the tier itself. It identifies, it does not rank:
              same size, weight and colour on all three, only the glyph
              differing. See `TierMark`. */}
          <div className="flex items-center gap-4">
            <TierMark tier={tier.tier} className="size-8 text-navy-600" />
            <h2 className="text-h1 text-balance">{labels.name}</h2>
          </div>
          <p className="font-display text-coord uppercase text-navy-600">
            {labels.finalists(shownFinalists)} · {labels.slates(shownSlates)}
          </p>
        </div>

        {parents.length === 0 ? (
          /* Two different absences, and they are not the same sentence. A tier
             nobody was shortlisted in this year is a fact about the year; a
             tier holding nothing in the chosen category is a fact about the
             filter, and saying the first when the second is true would be
             false. */
          <EmptyState
            className="mt-10"
            title={filterName ? labels.noMatchTitle : labels.emptyTitle}
            description={
              filterName ? labels.noMatchBody(filterName) : labels.emptyBody
            }
          />
        ) : (
          <div className="mt-12 space-y-16 lg:mt-14 lg:space-y-24">
            {parents.map((parent) => (
              <ParentBand key={parent.id} parent={parent} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * One parent category inside one tier: a rail that stays beside its groups.
 *
 * **This replaced a full-width photographic band above the groups, and the
 * reason was structural rather than cosmetic.** Four levels - tier, parent,
 * group, finalist - were each drawn as a heading with a small-caps count beside
 * it, so a reader could not tell from the treatment which level they were on;
 * the same sentence appeared three times at three scales. And the parent band
 * put a 220px photograph of a *category* between every group, fourteen times on
 * one page, which is a great deal of height spent on decoration.
 *
 * A rail beside the groups solves both. The parent is now **spatial** rather
 * than typographic: which category you are in is answered by where you are
 * looking, so it never has to be restated. The category frame comes with it at
 * a fraction of the size, doing identification instead of decoration.
 *
 * The rail is sticky, and honestly: it earns its keep on the parents that need
 * it and does nothing on the ones that do not. Visual Identity x Corporate
 * holds three groups and gives the rail **1103px of travel** - it stays beside
 * the reader for the whole parent. A one-group parent gives it 35 to 215px,
 * where there is nothing to lose track of anyway. Measured, not assumed.
 *
 * The frame depicts the **category**, never any entrant's work - there is no
 * project photography in this build and none is invented. `alt=""`, the house
 * rule for a photograph illustrating something the heading beside it names.
 */
function ParentBand({ parent }: { parent: ParentView }) {
  const tParent = useTranslations("finalists");
  const [expanded, setExpanded] = useState(false);

  // Disclosure sits on the parent now that its sub-categories are one list.
  const overflow = parent.finalists.length - VISIBLE;

  return (
    <section
      data-parent={parent.id}
      className="grid gap-x-12 gap-y-6 lg:grid-cols-12"
    >
      <div className="lg:col-span-3 lg:sticky lg:top-32 lg:self-start">
        {parent.image ? (
          <div className="relative aspect-[5/4] w-28 overflow-hidden bg-navy-950 lg:w-full">
            <Image
              src={parent.image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 22vw, 112px"
              className="object-cover"
            />
          </div>
        ) : null}
        {/* The rail led with the two-letter code above the name; with the
            codes retired the name simply takes the lead position, and there is
            no second, shorter spelling of it underneath. */}
        <h3 className="mt-4 text-h3 text-balance">{parent.name}</h3>
        {parent.description ? (
          <p className="mt-3 max-w-[34ch] text-body-sm text-navy-600">
            {parent.description}
          </p>
        ) : null}
        <p className="mt-4 font-display text-coord uppercase text-navy-600">
          {tParent("index.finalists", { count: parent.finalistCount })} ·{" "}
          {tParent("index.slates", { count: parent.slates.length })}
        </p>
      </div>

      {/* Pulled out by the row's own padding, so the rules and the hover fill
          keep the column's full width while the text inside them sits clear of
          both edges. */}
      <div className="lg:col-span-9 -mx-4 sm:-mx-5">
        <ul>
          {parent.finalists.map((finalist, i) => (
            <li
              key={finalist.id}
              className={cn(
                "border-b border-navy-900/12",
                !expanded && i >= VISIBLE && "hidden",
              )}
            >
              <FinalistRow finalist={finalist} />
            </li>
          ))}
        </ul>

        {overflow > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="mt-4 ms-4 flex items-center gap-2.5 border border-navy-900/20 px-5 py-3 sm:ms-5 font-display text-coord uppercase text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-950 hover:text-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {expanded
              ? tParent("slate.showFewer")
              : tParent("slate.showAll", { count: parent.finalists.length })}
            <ChevronDown
              aria-hidden
              className={cn(
                "size-4 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        ) : null}
      </div>
    </section>
  );
}

/**
 * One finalist, as an entry rather than a table row.
 *
 * It carries its **description** again. The row had been a title, a maker, a
 * country code and a number, which is a spreadsheet line - and the description
 * was sitting unused in the fixture the whole time. Entry copy is the only
 * writing on this page that belongs to the entrants, and a shortlist that
 * withholds it is a shortlist you cannot read.
 *
 * **The vote figure is the anchor and is deliberately never the order.** It is
 * the only number here that moves and the only thing a reader can change, so it
 * is set large at the end of the line, while the lines around it run in slug
 * order and the summary above says so in words.
 */
function FinalistRow({ finalist }: { finalist: FinalistView }) {
  const tProject = useTranslations("project");
  const tVote = useTranslations("vote");
  const format = useFormatter();

  const contentDir = finalist.contentLanguage === "ar" ? "rtl" : "ltr";
  return (
    <Link
      href={`/projects/${finalist.slug}`}
      // The group this finalist competes in, stated in the markup as well as on
      // the line. The per-sub-category blocks used to carry it structurally;
      // once they merged, the row is the only thing that knows.
      data-sub={finalist.subId}
      // Horizontal padding as well as vertical, so the hover fill has room
      // around what it is highlighting. Without it the fill began at the first
      // letter and ended at the last digit, and a row under the cursor read as
      // if it had been cropped to its own contents.
      // `relative hover:z-10`: the tile now grows past the row's own bounds, and
      // rows are siblings without a stacking context, so the next row would
      // paint straight over the part that escapes. The row has to lift, not
      // just the tile inside it.
      className="group relative grid gap-x-8 gap-y-2 px-4 py-6 transition-colors hover:z-10 hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700 sm:grid-cols-[1fr_auto] sm:px-5 sm:py-7"
    >
      <span className="min-w-0">
        <span className="block text-h4 leading-snug group-hover:underline">
          {/* Entry content is never translated (§3.8) and carries its own
              `lang`/`dir`. `<bdi>`, inline, inside a block that keeps the page's
              direction: putting the direction on the row - or on a block-level
              `bdi` - also flips that row's alignment, and a register has to
              align. */}
          <bdi lang={finalist.contentLanguage} dir={contentDir}>
            {finalist.title}
          </bdi>
        </span>
        {/* The sub-category leads the meta line: it was the ruled heading over
            a block of these rows until the groups merged under their parent
            (§1.6 `[map-update]`, 2026-08-25), and it is the group a vote is
            actually cast in - not a detail to lose on the way. */}
        <span className="mt-1.5 flex flex-wrap items-baseline gap-x-3 font-display text-coord uppercase text-navy-600">
          <span className="text-navy-900">{finalist.subName}</span>
          <span aria-hidden className="text-navy-900/25">
            /
          </span>
          {finalist.maker ? (
            <span>{tProject("by", { name: finalist.maker })}</span>
          ) : null}
          <span aria-hidden className="text-navy-900/25">
            /
          </span>
          <span>{finalist.country}</span>
        </span>
        <span className="mt-3 block max-w-[62ch] text-body-sm text-navy-600">
          <bdi lang={finalist.contentLanguage} dir={contentDir}>
            {finalist.description}
          </bdi>
        </span>
      </span>

      {/* `div`, not `span`: `PixelGrid` renders a div, and a div inside a span
          is invalid nesting. The row is an anchor, which takes flow content, so
          this is both legal and unchanged in layout - the element was already
          `display:flex` either way. */}
      <div className="flex items-start gap-x-4 self-stretch sm:justify-end">
        {/* The project's frame, before the figure it belongs to.

            **There is no project photography in this build and none is
            invented.** Every `coverUrl` in the fixtures points into
            `/placeholders`, a directory that does not exist, so rendering them
            would have fired 372 requests at 372 missing files.
            `finalists-view.ts` resolves that to null and the row asks for a
            file only when there is one.

            What stands in is the motif, seeded from the project's own slug, so
            every finalist gets a distinct tile that is stable across renders
            and obviously a pattern rather than a photograph. The category mark
            was here first and was the wrong answer: it is identical for every
            row inside a parent, so it printed what the rail beside it already
            says, once per row, 372 times.

            The tile renders either way, so the column keeps one rhythm whether
            a project has a frame or not. */}
        {/* Two boxes, and the outer one never changes.

            The tile grows and squares off under the cursor, which is a change
            of *shape* rather than of scale - a non-uniform scale would stretch
            the photograph, while a taller box simply lets `object-cover` crop
            it differently. But width and height are laid out, so animating them
            in flow would shove the vote figure and the arrow around every time
            the pointer crossed a row.

            So the outer box holds the row's space and is fixed forever, and the
            inner one is taken out of flow and centred in it. It can then be any
            size it likes without the row noticing.

            The outer box stretches to the row's full height rather than sitting
            at the top of it, which is what centres the tile on the ROW instead
            of on its own 60px. That also decides how large the square can get:
            at the row's middle the tile is beside the description line, which
            is far shorter than the meta line it used to have to clear.
            `overflow-hidden` belongs to the inner box, which is the one being
            clipped; putting it on the outer would crop the growth. */}
        <div className="relative w-20 shrink-0 self-stretch sm:w-24">
          <div
            className={cn(
              // Anchored to the inline end, not centred, and that is what lets
              // it get this big: centred growth ate the 16px gap and ran under
              // the vote figure. Pinned at its end edge it grows the other way,
              // into the whitespace between the description and the tile -
              // about 330px of it at 1440. Vertically it still centres, via
              // `inset-y-0 my-auto`.
              "absolute inset-y-0 end-0 my-auto h-14 w-20 overflow-hidden bg-navy-950 sm:h-15 sm:w-24",
              "transition-all duration-300 ease-out",
              // Landscape to square. The sizes are measured ceilings, not taste:
              // pinned at its end edge the tile grows toward the inline start
              // until it reaches the longest line in the left column, and that
              // headroom depends on how wide the row is. Measured across every
              // visible row, English being the tighter of the two languages:
              // 128px at 768, 153 at 1280, **131 at 1440** - the low point,
              // where the meta line very nearly fills the column - then 197 at
              // 1536 and 462 at 1920.
              //
              // So the size steps with the breakpoint, each one set below the
              // tightest measurement inside its range: 120 from `sm` (768
              // measured 128 and a 128px tile touched the description with 0px
              // to spare), 128 from `xl` (1440's 131 is the floor there), 176
              // from `2xl` (nothing at or above 1536 measured under 197). A
              // 144px square was tried at 1440 first and cropped "Palestinian
              // Territories".
              //
              // It does reach past the row vertically into its neighbours,
              // which is why the row itself takes a stacking context below.
              "motion-safe:group-hover:size-28 sm:motion-safe:group-hover:size-30 xl:motion-safe:group-hover:size-32 2xl:motion-safe:group-hover:size-44",
              // The house rule, expressed as `motion-safe` on the growth rather
              // than `motion-reduce` overrides that undo it. The overrides came
              // first and were wrong: `2xl:group-hover:size-44` outranks
              // `sm:motion-reduce:group-hover:w-24` in the cascade, so from 1536
              // up the tile still grew for a reader who had asked it not to.
              // Gating the growth leaves nothing to override.
              "motion-reduce:transition-none",
            )}
          >
            {finalist.cover ? (
              <Image
                src={finalist.cover}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <ProjectPlaceholder
                slug={finalist.slug}
                title={finalist.title}
                parentId={finalist.parentId}
              />
            )}
          </div>
        </div>
        {/* A fixed measure, because the figure is not: "70" and "1,886" differ
            by about 40px, and with the column merely flex-ended every row put
            its tile somewhere else. `tabular-nums` already keeps the digits on
            one rhythm; this keeps the column on one. */}
        <span className="min-w-[4.5rem] text-end sm:min-w-[5.5rem]">
          <span className="sr-only">
            {tVote("votes", { count: finalist.votes })}
          </span>
          <span
            aria-hidden
            className="block font-data text-h2 leading-none tabular-nums"
          >
            {format.number(finalist.votes)}
          </span>
          <span
            aria-hidden
            className="mt-1.5 block font-display text-coord uppercase text-navy-600"
          >
            {tVote("unit")}
          </span>
        </span>
        <ArrowRight
          aria-hidden
          className="mt-1 size-5 shrink-0 text-navy-600 rtl:-scale-x-100"
        />
      </div>
    </Link>
  );
}
