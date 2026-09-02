import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { CardTrack } from "@/components/marketing/card-track";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Entry, GroupResult, HonoraryDesignation, SubCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Featured winners.
 *
 * The text field is the supplied artwork, transcribed rather than approximated:
 * winner-card-background-gold.svg is a 7 x 5 grid on a 51.15 unit, and it is
 * rebuilt here as a grid so each card takes its own metal from a class and the
 * type inside it stays real text on a real box. No mosaic on the sheet.
 *
 * Honorary is the black colorway per addendum 1.4, not the teal the deck prints,
 * which is the mislabeled swatch already logged as brand-file errata.
 */

type Sheet = "gold" | "silver" | "bronze" | "honorary";

const SHEET: Record<Sheet, { photo: string; metal: string; ink: string; sub: string }> = {
  // Ink per metal follows MedalBadge, where the pairings are already settled.
  // The artwork specifies the field and carries no type; gold and silver are too
  // light to take white (2.24:1 and 2.6:1), and bronze and black too dark to
  // take navy.
  gold: {
    photo: "/media/winners/gold.webp",
    metal: "bg-gold",
    ink: "text-navy-900",
    sub: "text-navy-900/85",
  },
  silver: {
    photo: "/media/winners/silver.webp",
    metal: "bg-silver",
    ink: "text-navy-900",
    sub: "text-navy-900/85",
  },
  bronze: {
    photo: "/media/winners/bronze.webp",
    metal: "bg-bronze",
    ink: "text-white",
    sub: "text-white/90",
  },
  honorary: {
    photo: "/media/winners/honorary.webp",
    metal: "bg-honorary",
    ink: "text-white",
    sub: "text-white/90",
  },
};

/**
 * The card's text field, transcribed from winner-card-background-gold.svg.
 *
 * The artwork is a 7 x 5 grid on a 51.15 unit: a stepped solid polygon, and
 * eight loose cells around it at four strengths with one on overlay. Rebuilt as
 * a grid rather than shipped as four SVGs, so a card takes its own metal from a
 * class and the type inside it is real text on a real box.
 *
 * Cells are [column, row], zero-indexed from the field's top start corner.
 */
const SOLID: [number, number][] = [
  [0, 1], [1, 1], [2, 1],
  [0, 2], [1, 2], [2, 2], [3, 2],
  [0, 3], [1, 3], [2, 3], [3, 3],
  [0, 4], [1, 4], [2, 4],
];

/** [column, row, opacity, overlay?] */
const LOOSE: [number, number, number, boolean?][] = [
  [0, 0, 0.4], [1, 0, 0.7],
  [4, 2, 0.7], [5, 2, 0.7, true],
  [4, 3, 0.9], [6, 3, 0.2],
  [3, 4, 0.7], [5, 4, 0.7],
];

export interface FeaturedWin {
  result: GroupResult;
  entry: Entry;
  subCategory?: SubCategory;
  creator?: string;
}

function Blocks({ sheet, children }: { sheet: Sheet; children: React.ReactNode }) {
  const { metal } = SHEET[sheet];
  return (
    // Shorter than the artwork's own 358.06 x 255.85. The sheet is 2:3 and the
    // field at its native proportion took nearly half of it; the rows are
    // squatter than the columns here so the same 7 x 5 composition sits on the
    // foot of a portrait card without swallowing the figure.
    <div className="absolute inset-x-0 bottom-0 grid aspect-[358.06/205] grid-cols-7 grid-rows-5">
      {SOLID.map(([col, row]) => (
        <span
          key={`s${col}-${row}`}
          aria-hidden
          className={metal}
          style={{ gridColumn: col + 1, gridRow: row + 1 }}
        />
      ))}
      {LOOSE.map(([col, row, opacity, overlay]) => (
        <span
          key={`l${col}-${row}`}
          aria-hidden
          className={metal}
          style={{
            gridColumn: col + 1,
            gridRow: row + 1,
            opacity,
            mixBlendMode: overlay ? "overlay" : undefined,
          }}
        />
      ))}
      {/* The type sits on the three columns the solid shape holds through all
          four of its rows, and stands on the foot of the box rather than
          spreading across it. Last in the DOM, so it stacks over the field. */}
      <div className="col-span-3 col-start-1 row-span-4 row-start-2 flex flex-col justify-end gap-[6%] pb-[13%] pe-[7%] ps-[12%] pt-[7%]">
        {children}
      </div>
    </div>
  );
}

export async function FeaturedWinner({
  wins,
  honorary,
  year,
}: {
  wins: FeaturedWin[];
  /** The fourth sheet. A designation, not a placed result. */
  honorary?: HonoraryDesignation;
  year: number;
}) {
  const locale = (await getLocale()) as Locale;
  const [tWinners, tHonorary] = await Promise.all([
    getTranslations("home.winners"),
    getTranslations("honoraryType"),
  ]);

  if (!wins.length) return null;

  return (
    <section className="bg-white text-navy-900">
      <div className="page-shell section-y">
        <CardTrack
          heading={
            <div className="max-w-2xl">
        <h2 className="text-h1">{tWinners("title", { year })}</h2>
        <p className="mt-4 text-body-md text-navy-600">{tWinners("description")}</p>
            </div>
          }
          prevLabel={tWinners("prev")}
          nextLabel={tWinners("next")}
          action={
            <Button asChild variant="outline" size="cta">
              <Link href="/winners">{tWinners("link")}</Link>
            </Button>
          }
        >
          {wins.map(({ result, entry, subCategory, creator }) => {
            const sheet = result.level as Sheet;
            const category = subCategory ? subCategory.name[locale] : "";

            return (
              <li key={result.id} className="shrink-0 snap-start basis-[78%] sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]">
                <Link href={`/projects/${entry.slug}`} className="group block">
                  <div className="@container relative aspect-[2/3] overflow-hidden bg-[#f3f3f9]">
                    <Image
                      src={SHEET[sheet].photo}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <Blocks sheet={sheet}>
                      <p className={cn("text-body-sm leading-[1.3]", SHEET[sheet].sub)}>
                        {category}
                        <span className="block">/{tWinners("category")}</span>
                      </p>
                      {/* Sized off the sheet, not the window, and capped where
                          the longest of the three words fits: BRONZE WINNER
                          needed 153px inside a 131px block before this. */}
                      <p
                        className={cn(
                          "max-w-[7ch] font-display uppercase leading-[0.95]",
                          "text-[clamp(0.75rem,6.4cqw,1.375rem)]",
                          SHEET[sheet].ink,
                        )}
                      >
                        {tWinners(sheet)}
                      </p>
                    </Blocks>
                  </div>

                  <h3 className="mt-5 text-h4 transition-colors group-hover:text-blue-700">
                    {entry.title}
                  </h3>
                  <p className="mt-1.5 text-body-sm text-navy-600">{creator ?? entry.country}</p>
                </Link>
              </li>
            );
          })}

          {/* The fourth sheet. Honorary is a designation rather than a placed
              result: not enterable, never paid, attached to a person or an
              entity, so it takes a subject and a citation where the others take
              a project and a maker. */}
          {honorary ? (
            <li className="shrink-0 snap-start basis-[78%] sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]">
              <Link href="/winners" className="group block">
                <div className="@container relative aspect-[2/3] overflow-hidden bg-[#f3f3f9]">
                  <Image
                    src={SHEET.honorary.photo}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <Blocks sheet="honorary">
                    <p className={cn("text-body-sm leading-[1.3]", SHEET.honorary.sub)}>
                      {tHonorary(honorary.type)}
                      <span className="block">/{tWinners("designation")}</span>
                    </p>
                    {/* Smaller: HONORARY is eight characters against WINNER's
                        six and will not set at the metals' size in this block. */}
                    <p
                      className={cn(
                        "max-w-[9ch] font-display uppercase leading-[1]",
                        "text-[clamp(0.625rem,4.6cqw,1rem)]",
                        SHEET.honorary.ink,
                      )}
                    >
                      {tWinners("honorary")}
                    </p>
                  </Blocks>
                </div>

                <h3 className="mt-5 text-h4 transition-colors group-hover:text-blue-700">
                  {honorary.subject.name}
                </h3>
                <p className="mt-1.5 text-body-sm text-navy-600">{honorary.citation[locale]}</p>
              </Link>
            </li>
          ) : null}
        </CardTrack>
      </div>
    </section>
  );
}
