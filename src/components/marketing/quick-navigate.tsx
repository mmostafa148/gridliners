import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The three routes the sitemap puts under the featured winners.
 *
 * Tall blocks, each a photograph under a field of the identity's own pixel.
 *
 * The field is a light gradient off one corner, not a cover. The frames are
 * finished graphics rather than photographs, and two of them carry their own
 * type as the subject, so the pixel sits over them as a brand tint and leaves
 * the artwork legible. A scattered third of the cells breathe on a long period.
 *
 * All of it is visible before anything is pointed at, which matters most where
 * nothing can be: a touch screen has no hover, and a block that only resolves
 * on one is a flat rectangle for every phone that loads it. Hover then clears
 * the tint entirely, in a diagonal cascade from the same corner.
 *
 * The motion is the brand's, not a library's. A Lottie or Lordicon loop would
 * cost 150-250KB and a runtime, and both speak in rounded illustrative shapes
 * against an identity built from hard-edged squares and Presicav: it would read
 * as bought rather than designed. The pixel grid already animates, already
 * belongs here, and costs nothing.
 *
 * It is also CSS only. Each cell carries a transition-delay computed from its
 * own position, so the cascade needs no JavaScript, no timeline and no
 * measurement, and it runs on opacity and transform alone.
 *
 * The lower panel never dissolves. Type sitting on a photograph would have to
 * be re-checked against every image; sitting on the block's own colour it holds
 * one contrast in both states.
 */

const COLUMNS = 6;
const ROWS = 7;

const BLOCKS = [
  {
    key: "howToEnter",
    href: "/how-to-enter",
    photo: "/media/winners/gold.webp",
    ground: "bg-blue-700 text-cream-100",
    cell: "bg-blue-700",
    rule: "border-cream-100/30",
    pip: "bg-cream-100",
  },
  {
    key: "categories",
    href: "/categories",
    photo: "/media/winners/silver.webp",
    ground: "bg-navy-900 text-cream-100",
    cell: "bg-navy-900",
    rule: "border-cream-100/25",
    pip: "bg-blue-700",
  },
  {
    key: "winners",
    href: "/winners",
    photo: "/media/winners/bronze.webp",
    // campaign-purple takes cream, not navy. Navy on it is 2.23:1; cream
    // clears 7:1. The panel's ink follows the ground it sits on, which is why
    // this block reads light where the cream one it replaced read dark.
    ground: "bg-campaign-purple text-cream-100",
    cell: "bg-campaign-purple",
    rule: "border-cream-100/30",
    pip: "bg-cream-100",
  },
] as const;

export async function QuickNavigate() {
  const t = await getTranslations("home.quick");

  return (
    <section className="bg-[#f3f3f9] text-navy-900">
      <div className="page-shell section-y">
        <div>
          <h2 className="text-h1">{t("title")}</h2>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {BLOCKS.map((block) => (
            <li key={block.key}>
              <Link
                href={block.href}
                className="group flex aspect-[4/5] flex-col overflow-hidden sm:aspect-[3/4]"
              >
                {/* The picture, and the field that covers it. */}
                <div className="relative flex-1 overflow-hidden">
                  <Image
                    src={block.photo}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />

                  <div
                    aria-hidden
                    className="absolute inset-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                      gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: COLUMNS * ROWS }, (_, i) => {
                      const col = i % COLUMNS;
                      const row = Math.floor(i / COLUMNS);
                      // Diagonal order, so the field peels from one corner
                      // rather than every square leaving at once.
                      const step = col + row;
                      // 0 at the solid corner, 1 at the open one. The field
                      // holds its colour where the pixel row and the panel are,
                      // and thins where the picture can be seen.
                      const away = step / (COLUMNS + ROWS - 2);
                      // A light corner gradient, not a wash. These frames are
                      // finished graphics and two of them carry their own type
                      // as the subject: at the strength a photograph could take,
                      // the field buried "JOIN NOW" and "design" and the block
                      // went back to being a colour rectangle.
                      const base = Math.max(0.08, 0.45 - away * 0.42);
                      // A scattered third breathe; a deterministic pick, so the
                      // server and the client agree on which.
                      const breathes = (col * 7 + row * 5) % 3 === 0;
                      return (
                        // The strength is on the cell and the motion on its
                        // child, so the two multiply. Put together on one
                        // element the animation simply replaces the strength.
                        <span
                          key={i}
                          className={cn(
                            "tile-cell block transition-opacity duration-500 ease-out",
                            "group-hover:opacity-0!",
                          )}
                          style={
                            {
                              "--tile-a": base,
                              transitionDelay: `${step * 45}ms`,
                            } as React.CSSProperties
                          }
                        >
                          <span
                            className={cn("block size-full", block.cell, breathes && "tile-breathe")}
                            style={
                              breathes
                                ? ({
                                    "--tile-dur": `${6 + ((col + row) % 4)}s`,
                                    "--tile-delay": `${((col * 3 + row) % 7) * 0.4}s`,
                                  } as React.CSSProperties)
                                : undefined
                            }
                          />
                        </span>
                      );
                    })}
                  </div>

                  {/* The pixel row, on top of the field and staying put. */}
                  <span className="absolute start-7 top-7 flex gap-1 sm:start-8 sm:top-8" aria-hidden>
                    {[0.9, 0.55, 0.3, 0.15].map((alpha, i) => (
                      <span key={i} className={cn("size-2.5", block.pip)} style={{ opacity: alpha }} />
                    ))}
                  </span>
                </div>

                {/* The panel. Solid in both states, so the type holds one
                    contrast whatever the photograph behind the field is doing. */}
                <div className={cn("p-7 sm:p-8", block.ground)}>
                  <h3 className="font-display text-[clamp(1.375rem,1.9vw,1.875rem)] uppercase leading-[1.05]">
                    {t(`${block.key}.label`)}
                  </h3>
                  <div
                    className={cn(
                      "mt-6 flex items-end justify-between gap-6 border-t pt-5",
                      block.rule,
                    )}
                  >
                    <p className="max-w-[24ch] text-body-sm opacity-80">
                      {t(`${block.key}.body`)}
                    </p>
                    <ArrowRight
                      className="size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5 rtl:-scale-x-100"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
