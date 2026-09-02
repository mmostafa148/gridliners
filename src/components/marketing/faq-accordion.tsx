"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Locale } from "@/i18n/routing";
import type { Faq } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * The questions, as an accordion, per content-map §1.2.
 *
 * The one client component on this page, and it earns it: an accordion is a
 * disclosure widget, and a disclosure widget that works without JavaScript is
 * a `<details>` element with none of the keyboard behaviour or the animation
 * this build's other primitives have.
 *
 * `type="multiple"` rather than `"single"`. These are independent questions,
 * not a set of alternatives, and a reader comparing two answers should not
 * have to close the first to read the second. Nothing opens by default: the
 * list of questions is the thing to scan first.
 *
 * The items come from the API rather than from copy, because content-map §5.11
 * gives the admin an FAQs editor separate from its page editors. Their text is
 * bilingual on the record, so this reads it by locale rather than through the
 * message files.
 */
export function FaqAccordion({ items }: { items: Faq[] }) {
  const t = useTranslations("about.faq");
  const locale = useLocale() as Locale;

  if (!items.length) return null;

  return (
    <section className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          {/* The question anchored on the start columns, the answers beside it
              — the same shape the team section uses, so the page has one way of
              asking and answering rather than two.

              It also fixes what the full-width version got wrong: a question
              set across twelve columns is a line of small type crossing an
              empty room, and the answer that followed it landed four columns
              away from the question it belonged to. */}
          {/* The anchor travels with the list. Seven questions make a column
              several times the height of the heading that introduces them, and
              a heading pinned to the top of 750px of empty ground is the same
              void every other section on this page had to solve.

              Sticky is the useful answer rather than the decorative one: the
              reader keeps the section they are in while they scan. `top` clears
              the rail, which is fixed at 40px and 4.5rem tall, so anything
              under 113px would slide behind it. */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-h1 text-balance">{t("title")}</h2>
            <p className="mt-6 max-w-[38ch] text-body-md text-navy-600">
              {t("description")}
            </p>
          </div>

          <Accordion
            type="multiple"
            className="lg:col-span-7 lg:col-start-6"
          >
            {items.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-t border-navy-900/12 last:border-b"
              >
                {/* No heading element here. Radix's Header renders the h3 and
                    puts the button inside it, which is the arrangement that
                    keeps both the heading outline and a single focusable
                    control; a second h3 within the button would nest a heading
                    inside interactive content. */}
                <AccordionTrigger
                  className={cn(
                    "gap-8 py-6 text-h3 text-navy-800",
                    // Open state carried by weight of colour, not only by a
                    // rotating chevron 700px away from the words. A reader
                    // scanning for the one they opened should find it without
                    // tracking to the end of the row.
                    "hover:text-navy-900 data-[state=open]:text-navy-900",
                  )}
                >
                  {item.question[locale]}
                </AccordionTrigger>

                <AccordionContent className="max-w-[52ch] pb-8 text-body-md text-navy-600">
                  {item.answer[locale]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
