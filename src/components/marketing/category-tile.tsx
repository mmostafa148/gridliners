import { getLocale, getTranslations } from "next-intl/server";

import Image from "next/image";

import { Link } from "@/i18n/navigation";
import type { ParentCategory, SubCategory } from "@/lib/api/types";
import type { MediaAsset } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * A parent category, carrying its code and sub-category count.
 *
 * The code is the same one the group coordinates use (VI, PK, TY…), so a
 * visitor who reads "VI·02 / CORP" on a winner's card can trace it back to a
 * category name here. A coordinate system only works if it is legible
 * somewhere.
 *
 * Some tiles carry a photograph. A grid of eight flat cells with nothing but
 * type in them reads as a wireframe however good the type is, so a few cells
 * take real imagery and the rest stay quiet.
 */
export async function CategoryTile({
  parent,
  subCategories,
  image,
}: {
  parent: ParentCategory;
  subCategories: SubCategory[];
  image?: MediaAsset;
}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home.categories")]);
  const children = subCategories.filter((sub) => sub.parentId === parent.id);

  return (
    <Link
      href="/categories"
      className={cn(
        "group relative isolate flex aspect-[5/4] flex-col justify-between overflow-hidden p-7 text-cream-100 transition-colors",
        image ? "bg-navy-950" : "bg-navy-900 hover:bg-blue-700",
      )}
    >
      {image ? (
        <>
          {/* Straight, not graded, and the same reasoning as the hero's frames:
              the duotone exists to pull mixed stage lighting into the palette,
              and these were art-directed for their category. Graded to navy the
              stationery flat-lay loses the red it is built on and the film set
              loses its autumn, which is the only thing either picture is
              saying. */}
          <Image
            src={image.src}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* Shaped rather than flat. A single 55% wash over the whole frame
              costs the picture everywhere to protect type that only sits in two
              corners. */}
          <div
            className="scrim-tile absolute inset-0 transition-opacity duration-300 group-hover:opacity-85"
            aria-hidden
          />
        </>
      ) : null}

      {/* The code sits on its own plate rather than straight on the picture.
          Six of the seven frames are dark where it lands and measured 11:1 or
          better; the film set is bright fog exactly there and measured 3.44:1.
          Darkening the whole top band to cover one frame would cost the other
          six their sky, and the next photograph dropped in could break it
          again. A plate makes the number independent of what is behind it. */}
      <span className="relative w-fit bg-navy-950 px-2.5 py-1 font-data text-data-lg">
        {parent.name[locale as "en" | "ar"]}
      </span>
      <div className="relative space-y-1.5">
        <h3 className="text-h3">{parent.name[locale as "en" | "ar"]}</h3>
        <p className="font-display text-coord uppercase text-cream-200/70">
          {t("subCount", { count: children.length })}
        </p>
      </div>
    </Link>
  );
}
