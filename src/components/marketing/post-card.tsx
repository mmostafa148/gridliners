import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { NewsItem, PostCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * One post in a listing.
 *
 * **The whole card is one link, and the kind and the date are inside it.** A
 * card that carries a separate "read more" gives a keyboard two stops for one
 * destination and a screen reader two announcements of the same thing.
 *
 * `h-full` with the cover on a fixed ratio is what keeps a row level: peers get
 * equal treatment, and a three-up row where one cover is taller than its
 * neighbours reads as a ranking nobody intended.
 */
export async function PostCard({
  post,
  categories,
  locale,
  featured = false,
}: {
  post: NewsItem;
  categories: PostCategory[];
  locale: Locale;
  /** The one card that opens a listing, set larger and on its own row. */
  featured?: boolean;
}) {
  const t = await getTranslations("post");
  const category = categories.find((c) => c.id === post.categoryId);
  const date = new Date(post.publishedAt).toLocaleDateString(
    locale === "ar" ? "ar" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <article data-motion-card className="h-full">
      <Link
        href={`/news/${post.slug}`}
        className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
      >
        <div
          data-motion-media
          className={cn(
            "relative w-full overflow-hidden bg-navy-950",
            featured ? "aspect-[16/9]" : "aspect-[8/5]",
          )}
        >
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt=""
              fill
              sizes={featured ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : null}
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-coord uppercase text-blue-700">
          {t(`kind.${post.kind}`)}
          {category ? (
            <>
              <span aria-hidden className="size-[3px] shrink-0 bg-navy-900/45" />
              <span className="text-navy-600">{category.name[locale]}</span>
            </>
          ) : null}
        </p>

        <h3
          className={cn(
            "mt-3 text-balance text-navy-900 transition-colors group-hover:text-blue-700",
            featured ? "text-h1 leading-tight" : "text-h3 leading-snug",
          )}
        >
          {post.title[locale]}
        </h3>

        <p className={cn("mt-3 text-body-md text-navy-600", featured ? "max-w-[56ch]" : "")}>
          {post.excerpt[locale]}
        </p>

        {/* Pushed to the foot so every card in a row ends on the same line. */}
        <p className="mt-auto pt-5 font-display text-coord uppercase text-navy-600">
          <time dateTime={post.publishedAt}>{date}</time>
          {post.readMinutes ? (
            <>
              <span aria-hidden className="mx-2 inline-block size-[3px] align-middle bg-navy-900/45" />
              {t("readTime", { minutes: post.readMinutes })}
            </>
          ) : null}
        </p>
      </Link>
    </article>
  );
}
