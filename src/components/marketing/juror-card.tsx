import Image from "next/image";

import {
  BehanceIcon,
  InstagramIcon,
  LinkedInIcon,
  XMarkIcon,
  YouTubeIcon,
} from "@/components/brand/social-icons";
import type { Locale } from "@/i18n/routing";
import type { Juror } from "@/lib/api/types";
import { languageName } from "@/lib/display-names";
import { cn } from "@/lib/utils";

/**
 * A juror, published as a scope.
 *
 * The card was already most of the way here, and the reason is worth keeping:
 * a face, a name, a job title and a country is a team grid, and every company's
 * team grid looks like it. What makes this page a jury panel rather than a
 * staff page is that each juror is accountable for something specific, so the
 * card carries the parent categories they actually score, named the same way
 * the category sections name them. A reader who met Visual Identity there meets
 * it again on the people who judge it.
 *
 * Now it carries the rest of the scope too: the company they practise at, one
 * paragraph of standing, and the languages they can read an entry in. That last
 * one is real: entries are published in the language they were written in and
 * are never translated (§3.8), so who can read Arabic is a fact about what this
 * panel can judge, not a flag decoration.
 *
 * A server component. There is nothing interactive on it and the page is
 * prerendered, so six cards' worth of JavaScript would buy nothing.
 *
 * **The portrait carried navy plates with the parent codes and no longer does.**
 * The codes were retired site-wide (§1.3 `[map-update]`, 2026-08-25), and names
 * could not simply take their place: "Visual Identity" and "Packaging" laid
 * across a photograph is a caption, not a plate, and the card already names
 * exactly those parents in words a few lines below. What was two spellings of
 * one fact is now one.
 */
const SOCIAL_ICON: Record<
  string,
  (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element
> = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  x: XMarkIcon,
  behance: BehanceIcon,
  youtube: YouTubeIcon,
};

export function JurorCard({
  juror,
  locale,
  scopeNames,
  labels,
  className,
}: {
  juror: Juror;
  locale: Locale;
  /** The juror's assigned parents, named. Resolved by the panel, which holds
   *  the taxonomy; the card stays a pure view over one juror. */
  scopeNames: string[];
  /** Passed in rather than read here, so the card stays a pure server view. */
  labels: {
    scope: string;
    languages: string;
    /** `social(name, platform)` builds the link's accessible name. */
    social: (name: string, platform: string) => string;
  };
  className?: string;
}) {
  const name = juror.name[locale];

  return (
    <article
      className={cn(
        // A rule over every card, so the row reads as a grid of units rather
        // than six pictures that happen to sit side by side.
        "flex flex-col border-t border-navy-900/20 pt-5",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
        <Image
          src={juror.photoUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top"
        />

      </div>

      <h3 className="mt-5 text-h4">{name}</h3>
      <p className="mt-1 text-body-sm text-navy-600">{juror.title[locale]}</p>
      <p className="font-display text-coord uppercase text-navy-900">
        {juror.company[locale]}
      </p>

      <p className="mt-4 max-w-[42ch] text-body-sm text-navy-600">
        {juror.bio[locale]}
      </p>

      {/* mt-auto, so the scope line lands on one baseline across the row
          however many lines a name or a bio takes above it. */}
      <div className="mt-auto pt-6">
        {/* Languages only. The country code used to sit beside them and read
            as a third language: "READS EN AR LB" is a list of three, and LB is
            not a language. Every title already carries the city, so the code
            was saying nothing the card did not already say. */}
        {/* No rule over this block. Cards in a row stretch to the tallest, and
            the scope sits at the bottom of each — but three of six jurors carry
            a social row and three do not, so the blocks end at different
            heights. A rule made that difference look like a broken alignment;
            without one the same variation reads as ordinary text flow. The card
            keeps exactly one rule, its own top edge, and those do align. */}
        <dl className="font-display text-coord uppercase text-navy-600">
          {/* Named, not just coded. The plates on the portrait carry the codes,
              which are compact and visual; this is the same fact in words, so a
              reader meeting the panel first is never shown bare jargon. */}
          {scopeNames.length ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <dt>{labels.scope}</dt>
              <dd className="text-navy-900">{scopeNames.join(" · ")}</dd>
            </div>
          ) : null}
          <div className="mt-2 flex items-baseline gap-2">
            <dt>{labels.languages}</dt>
            {/* Named, not coded. "EN · AR" was a pair of abbreviations a
                reader had to expand, and which language a juror can read an
                entry in is a fact about what this panel can judge (§3.8), not a
                label. Resolved through `Intl.DisplayNames`, so Arabic reads
                "الإنجليزية · العربية" without a second table. */}
            <dd className="font-data tabular-nums text-navy-900">
              {juror.languages.map((l) => languageName(l, locale)).join(" · ")}
            </dd>
          </div>
        </dl>

        {/* Three of six jurors carry a handle, so the row has to read as
            complete when it is empty rather than leaving a gap under the card. */}
        {juror.socials.length ? (
          <ul className="mt-4 flex flex-wrap items-center gap-2">
            {juror.socials.map((social) => {
              const Icon = SOCIAL_ICON[social.platform];
              return (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={labels.social(name, social.platform)}
                    className="grid size-9 place-items-center border border-navy-900/20 text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-950 hover:text-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    {Icon ? (
                      <Icon className="size-4" aria-hidden />
                    ) : (
                      <span aria-hidden className="font-display text-coord uppercase">
                        {social.platform.slice(0, 2)}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
