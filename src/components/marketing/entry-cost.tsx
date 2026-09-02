import {
  BadgePercent,
  Building2,
  GraduationCap,
  Layers,
  Ticket,
  Undo2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import { PixelGrid } from "@/components/brand/pixel-grid";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type {
  Cycle,
  PricingConfig,
  PricingWindow,
  SubCategory,
  Tier,
} from "@/lib/api/types";
import { PRICING_WINDOWS, TIERS } from "@/lib/api/types";
import { currentPricingWindow } from "@/lib/cycle-phase";
import { usd } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * What an entry costs — the whole of it, in one section.
 *
 * This was four: an eligibility strip, a price matrix, an add-ons note and a
 * fees explainer. They were one answer to one question broken into four
 * headings, and the seams showed — the tier names were stated twice, every
 * "entry from" floor was a number already in the matrix beneath it, and the
 * add-on fee sat in the pricing section while the loyalty discount that
 * modifies the same number sat in the next one.
 *
 * So the section is built the way the money actually works, in three movements:
 *
 *  1. **The price.** Tier-first, because the question a reader arrives with is
 *     "I am a freelancer, what does this cost me". A tier is a column and its
 *     three windows are rows inside it, so each column is self-contained and
 *     nothing has to be read across a header.
 *  2. **What changes it.** The three things that move that number, each marked
 *     with the direction it moves in: an add-on is the only one that adds, and
 *     loyalty and promo are the two that take away. The sign is not decoration
 *     — it is the one fact these three items do not otherwise state, and it is
 *     why they belong in a row together at all.
 *  3. **What does not come back.** Refunds, held apart from the modifiers,
 *     because it is a policy rather than a lever and reading it as a third
 *     discount would be worse than not reading it.
 *
 * Three surfaces carry that: navy for the price, mist for the levers, the
 * section's own white for the policy. A reader can see the shape of the answer
 * before reading a word of it.
 *
 * Each tier carries a mark from `lucide-react`, which is already a dependency
 * here and ISC-licensed with no attribution to carry. They identify rather than
 * rank — a student, a person working alone, an organisation — which is the
 * actual distinction between the three and the only thing a mark here may say.
 * The tiers are peers, so anything implying seniority or scale would be a lie
 * dressed as decoration.
 *
 * Each plate's foot breaks into the page rather than stopping on a ruled edge —
 * cells in the section's own ground, solid along the bottom and thinning
 * upward, so the navy dissolves into the page. It is the motif working
 * subtractively, and it is the one place in this section where the identity
 * gets to be structural rather than typographic. Seeded per tier, so three
 * edges break three different ways.
 *
 * **This drops the price `<table>`, deliberately.** The matrix was real table
 * markup so a screen reader could say "this cell is the crossing of that row
 * and that column", which is right for a matrix and the wrong shape for a
 * tier-first layout. Each tier is now a heading with a definition list under
 * it — window is the term, price is the definition — which is what the old
 * layout already did below `sm`. Comparing tiers costs a heading jump instead
 * of a column scan.
 *
 * **The three tiers are peers, not a ladder.** Entries are only ever ranked
 * against others in the same tier, so nothing may imply an order: equal
 * columns, equal type, equal weight, and no ascending device however neatly
 * 100/200/400 would sit on one.
 *
 * Loyalty is rendered from `loyaltyRules`, including its wording: each rule
 * carries its own bilingual label in the fixture, so a table that is
 * admin-configurable does not need a second, hand-written copy of itself in
 * the message files that would drift the first time a threshold moves.
 *
 * Refunds are a summary, not the policy. Four lines: the two a reader needs
 * before paying, and the two that answer the questions people actually ask
 * afterwards. `/terms` carries the rest, and the link says so rather than
 * pretending this is all of it.
 *
 * The live window is resolved from the cycle rather than assumed, and the
 * `null` branch is the normal one for most of the year: `currentPricingWindow`
 * returns nothing outside the participation period, and this page is read
 * mostly when submissions are closed. Nothing is marked then, and a line says
 * why rather than leaving a reader to guess which price applies to them.
 *
 * Dates render in UTC, the zone the windows are authored in. A window ends at
 * 23:59:59Z and the app displays in Asia/Dubai, so formatting locally rolled
 * the early-bird close from 14 Dec to the 15th and pushed late past the cycle's
 * own end. Starts are 00:00:00Z and survive the shift, which is why only half
 * the dates ever looked wrong.
 */
/**
 * One mark per tier, from `lucide-react` — already a dependency, so no new
 * package, and ISC-licensed with no attribution to carry.
 *
 * They identify rather than rank: a student, a person working alone, an
 * organisation. That is the actual distinction between the three, and it is
 * the only thing a mark here may say — the tiers are peers, and anything
 * implying seniority or scale would be a lie dressed as decoration.
 *
 * Set at 1.5 stroke rather than lucide's default 2: at 40px the default reads
 * heavy against Presicav, which is a wide face with fine joins.
 */
/**
 * One seed per tier, so each plate's foot breaks its own way and always the
 * same way. Fixed rather than hashed from the tier string, because a hash
 * would silently redraw all three the day a tier is renamed.
 */
const TIER_SEED: Record<Tier, number> = {
  students: 4,
  freelancers: 12,
  corporate: 23,
};

const TIER_ICON: Record<Tier, LucideIcon> = {
  students: GraduationCap,
  freelancers: UserRound,
  corporate: Building2,
};

export async function EntryCost({
  cycle,
  basePrices,
  loyaltyRules,
  subCategories,
}: {
  cycle: Cycle;
  basePrices: PricingConfig["basePrices"];
  loyaltyRules: PricingConfig["loyaltyRules"];
  subCategories: SubCategory[];
}) {
  const [tTiers, tPricing, tFees, tTier, tWindow, tCommon, locale, format] =
    await Promise.all([
      getTranslations("enter.eligibility"),
      getTranslations("enter.pricing"),
      getTranslations("enter.fees"),
      getTranslations("tier"),
      getTranslations("pricingWindow"),
      getTranslations("common"),
      getLocale() as Promise<Locale>,
      getFormatter(),
    ]);

  const live = currentPricingWindow(cycle, new Date());

  const range = (window: PricingWindow) => {
    const { start, end } = cycle.submissionWindows[window];
    return format.dateTimeRange(new Date(start), new Date(end), {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  };

  const fees = subCategories.map((sub) => sub.additionalFeeUsd);
  const refunds = ["refund1", "refund2", "refund3", "refund4"] as const;

  // `id` only, so the header's Awards menu can point at fees rather than at the
  // top of the page. Nothing here changes but the anchor and its rail clearance.
  return (
    <section id="fees" className="scroll-mt-[calc(var(--chrome-h)+2rem)] bg-mist text-navy-900">
      <div className="page-shell section-y">
        <div className="grid gap-x-16 gap-y-5 lg:grid-cols-12 lg:items-end">
          <h2 className="text-h1 text-balance lg:col-span-5">
            {tTiers("title")}
          </h2>
          {/* Both sentences survive the merge: one explains that a tier is
              declared and verified, the other that a price is per entry and
              fixed at checkout. Neither was said anywhere else. */}
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-[54ch] text-body-md text-navy-600">
              {tTiers("description")}
            </p>
            {/* What happens to a proof, said once, next to the sentence about
                declaring and verifying a tier — which is the moment a proof
                changes hands.

                Not inside a plate: there are three of them and this is one fact
                about all three, so a plate would state it three times. Not under
                the plate grid either, where it would sit beneath three columns
                of prices, beside the currency and closed-window lines, and read
                as a fourth pricing footnote. This column is the eligibility
                portion of the section, so the note belongs in it.

                body-sm rather than body-md marks it as the qualifier it is, in
                the register this section already uses for factual small print.
                Wording is the approved string, restored verbatim. */}
            <p className="mt-3 max-w-[54ch] text-body-sm text-navy-600">
              {tTiers("note")}
            </p>
            <p className="mt-3 max-w-[54ch] text-body-md text-navy-600">
              {tPricing("description")}
            </p>
          </div>
        </div>

        {/* ---- 1. The price ------------------------------------------------
            Three plates with air between them, not one plate ruled into
            thirds. A tier is a thing a reader picks between; separate objects
            say that, where interior hairlines said "three parts of one table".

            Each plate carries its own dissolving foot, seeded from its tier, so
            three edges break three different ways. One dissolve across a
            shared plate could not survive the split, and three copies of the
            same one would read as a repeat. */}
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-16">
          {TIERS.map((tier) => (
            <div
              key={tier}
              className="relative overflow-hidden bg-navy-950 text-cream-100"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
              >
                {/* Three rows and a smaller cell: about half the depth it
                    was, which is enough for the edge to break without the
                    dissolve becoming a feature of its own.

                    Not two rows. The dissolve axis is vertical, so a lane is a
                    column and its boundary can only land on one of `rows`
                    steps — at two that is three levels, which reads as
                    castellation rather than as the motif breaking up. */}
                <PixelGrid
                  direction="up"
                  seed={TIER_SEED[tier]}
                  cols={34}
                  rows={3}
                  density={0.44}
                  cellSize="clamp(0.75rem, 1.4vw, 1.375rem)"
                  cellClassName="bg-mist"
                />
              </div>

              <div className="relative px-8 pt-10 pb-[calc(2.5rem+clamp(0.75rem,1.4vw,1.375rem)*3)] sm:px-9 sm:pt-12">
                {/* Plain, not on a filled block. The levers below already use a
                    filled square to carry their sign, and repeating that
                    treatment here would make a tier look like a fourth thing
                    that moves the price. */}
                <TierMark tier={tier} />

                {/* A two-line floor on the name. "Companies / Agencies" wraps
                    while the other two do not, which pushed a whole column of
                    prices 42px out of line with its neighbours. */}
                <h3 className="mt-7 min-h-[2.6em] text-h3 text-balance text-cream-50">
                  {tTier(tier)}
                </h3>

                <p className="mt-4 min-h-[3.2em] max-w-[30ch] text-body-sm text-cream-200/75">
                  {tTier(`eligibility.${tier}`)}
                </p>

                {/* Price-led rows. The number is what a reader came for, so it
                    leads its row at data scale and the window it applies to is
                    the label attached to it. */}
                <dl className="mt-2">
                  {PRICING_WINDOWS.map((window) => (
                    <div
                      key={window}
                      className={cn(
                        "flex items-baseline gap-5 border-t border-cream-100/12 py-5",
                        // The live window is marked by weight and by its own
                        // chip, never by a wash: a warm tint at low alpha over
                        // navy goes muddy the same way it did over the route's
                        // cool near-white.
                        window === live && "border-t-gold-deep",
                      )}
                    >
                      <dd
                        className={cn(
                          // `min-w`, never `w`. A fixed 4.5ch holds "$650" and
                          // does not hold "‏650 US$" — Arabic renders the
                          // currency after the figure, so the price overflowed
                          // its own box and sat on top of the window name.
                          "order-first min-w-[4.5ch] shrink-0 font-data text-h2 leading-none tabular-nums",
                          window === live ? "text-gold" : "text-cream-50",
                        )}
                      >
                        {usd(format, basePrices[tier][window])}
                      </dd>
                      <dt className="min-w-0">
                        <span
                          className={cn(
                            "flex flex-wrap items-center gap-2 font-display text-coord uppercase",
                            window === live ? "text-gold" : "text-cream-100",
                          )}
                        >
                          {tWindow(window)}
                          {window === live ? (
                            <span className="bg-gold-deep px-2 py-0.5 text-cream-50">
                              {tPricing("now")}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1.5 block font-data text-caption text-cream-200/60">
                          {range(window)}
                        </span>
                      </dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
          {live ? <span /> : (
            <p className="max-w-[60ch] text-body-sm text-navy-600">
              {tPricing("closedNote")}
            </p>
          )}
          <p className="font-display text-coord uppercase text-navy-600">
            {tCommon("currencyNote")}
          </p>
        </div>

        {/* ---- 2 and 3. The notes ------------------------------------------
            Everything below the plate is an appendix to it, and reads like
            one. It was a tinted plate of its own carrying three padded boxes
            and a headed refunds block, which gave footnote-level information
            the same weight as the prices it annotates — two plates competing
            where there is one answer and its small print.

            No plate, no boxes, no filled sign blocks: ruled bands on the
            section's own ground, small type, one column per note. The rules
            separate the two kinds of note; nothing else is drawn. */}
        <div className="mt-14 border-t border-navy-900/15 pt-9 lg:mt-16">
          <p className="font-display text-coord uppercase text-navy-600">
            {tFees("title")}
          </p>

          <div className="mt-7 grid gap-x-14 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            <Note icon={Layers} title={tPricing("addOnsTitle")}>
              <p>{tPricing("addOnsBody")}</p>
              <p className="mt-3 font-data text-data-sm tabular-nums text-navy-900">
                {tPricing("addOnsRange", {
                  min: usd(format, Math.min(...fees)),
                  max: usd(format, Math.max(...fees)),
                })}
              </p>
            </Note>

            <Note icon={BadgePercent} title={tFees("loyaltyTitle")}>
              <p>{tFees("loyaltyBody")}</p>
              {/* Sorted by the threshold they start at, not by fixture order:
                  a discount table read out of order is a puzzle. */}
              {/* One rate per line. Wrapped inline they broke two-then-one at
                  this measure, which reads as the column running out of room
                  rather than as three rates. */}
              <dl className="mt-3 flex flex-col gap-1">
                {[...loyaltyRules]
                  .sort(
                    (a, b) => a.fromSubmissionNumber - b.fromSubmissionNumber,
                  )
                  .map((rule) => (
                    <div key={rule.id} className="flex items-baseline gap-1.5">
                      <dt className="font-data text-data-sm tabular-nums text-navy-900">
                        {rule.percentOff}%
                      </dt>
                      <dd className="text-caption text-navy-600">
                        {rule.label[locale]}
                      </dd>
                    </div>
                  ))}
              </dl>
            </Note>

            <Note icon={Ticket} title={tFees("promoTitle")}>
              <p>{tFees("promoBody")}</p>
            </Note>
          </div>
        </div>

        <div className="mt-10 border-t border-navy-900/12 pt-9">
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
            <h3 className="flex items-center gap-2 font-display text-coord uppercase text-navy-600">
              <Undo2
                aria-hidden
                className="size-4 shrink-0 text-blue-700"
                strokeWidth={1.75}
              />
              {tFees("refundTitle")}
            </h3>
            <Link
              href="/terms"
              className="font-display text-coord uppercase text-blue-700 underline-offset-4 transition-colors hover:text-blue-800 hover:underline"
            >
              {tFees("termsLink")}
            </Link>
          </div>

          <ul className="mt-6 grid gap-x-14 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {refunds.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 text-body-sm text-navy-600"
              >
                <span
                  className="mt-[0.5em] size-1.5 shrink-0 bg-blue-700"
                  aria-hidden
                />
                <span>{tFees(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TierMark({ tier }: { tier: Tier }) {
  const Icon = TIER_ICON[tier];
  return <Icon aria-hidden className="size-10 text-cream-200" strokeWidth={1.5} />;
}

/**
 * One note about the price, under its own mark.
 *
 * These replaced a filled `+` / `−` block, which encoded the direction each
 * note moves the price in. The direction is not lost: every one of these
 * sentences already says it — "each with its own fee", "the less each entry
 * costs" — so the sign was reinforcing copy rather than carrying anything the
 * copy did not. What it was not doing was telling a reader what the note is
 * *about* at a glance, which is the job a mark in a scannable row actually
 * has.
 *
 * `size-5` against an 18px title: an icon that outgrows its own heading stops
 * being a mark and becomes an illustration, and this whole band is an
 * appendix. Stroke 1.75 rather than lucide's 2, for the reason the tier marks
 * use 1.5 — the default reads heavy beside Presicav's fine joins, and these sit
 * on a lighter ground at a smaller size.
 *
 * `aria-hidden`, because the title beside it names the thing.
 */
function Note({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2.5 text-h4">
        <Icon
          aria-hidden
          className="size-5 shrink-0 text-blue-700"
          strokeWidth={1.75}
        />
        {title}
      </h3>
      <div className="mt-3 max-w-[42ch] text-body-sm text-navy-600">
        {children}
      </div>
    </div>
  );
}


