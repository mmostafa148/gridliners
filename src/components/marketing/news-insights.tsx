import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { CardTrack } from "@/components/marketing/card-track";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { NewsItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * News & Insights, on a track.
 *
 * Everything before this stacked: a lead and a list, a lead across and a row
 * along, a column each by kind, then an index and a frame. All of them read as
 * another block in a page of blocks. Sideways is the one rhythm the section can
 * have that nothing around it has.
 *
 * It shares the winners row's track rather than carrying its own. The scroll
 * arithmetic that makes a page step exactly one card, and makes it step the
 * right way in Arabic, is worth having in one place.
 *
 * Interviews first, then the diary by soonest, because the two do not sort the
 * same way: something written is most useful when it is the most recent, and
 * something not yet happened when it is the next one. The service returns one
 * list newest-first and cannot know that.
 */
export async function NewsInsights({ items }: { items: NewsItem[] }) {
  const locale = (await getLocale()) as Locale;
  const [t, format] = await Promise.all([getTranslations("home.news"), getFormatter()]);

  const interviews = items
    .filter((i) => i.kind === "interview")
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const events = items
    .filter((i) => i.kind === "event")
    .sort(
      (a, b) => Date.parse(a.startsAt ?? a.publishedAt) - Date.parse(b.startsAt ?? b.publishedAt),
    );
  const cards = [...interviews, ...events];
  if (!cards.length) return null;

  return (
    <section className="bg-white text-navy-900">
      <div className="page-shell section-y">
        <CardTrack
          heading={
            <div className="max-w-2xl">
        <h2 className="text-h1">{t("title")}</h2>
        <p className="mt-4 text-body-md text-navy-600">{t("description")}</p>
            </div>
          }
          prevLabel={t("prev")}
          nextLabel={t("next")}
          action={
            <Button asChild variant="outline" size="cta">
              <Link href="/news">{t("link")}</Link>
            </Button>
          }
        >
          {cards.map((item) => {
            // An event is read by when it happens, an article by when it ran.
            const stamp = item.startsAt ?? item.publishedAt;
            return (
              <li
                key={item.id}
                className={cn(
                  "shrink-0 snap-start",
                  "basis-[80%] sm:basis-[calc((100%-1.5rem)/2)]",
                  "lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]",
                )}
              >
                <Link href={`/news/${item.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 80vw, (max-width: 1280px) 45vw, 24vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <span
                      className={cn(
                        "absolute start-4 top-4 px-2.5 py-1 font-display text-coord uppercase text-cream-100",
                        item.kind === "event" ? "bg-blue-700" : "bg-navy-900",
                      )}
                    >
                      {t(item.kind)}
                    </span>
                  </div>

                  <p className="mt-5 font-data text-data-sm text-navy-600">
                    {format.dateTime(new Date(stamp), { dateStyle: "medium" })}
                    {item.venue ? (
                      <span className="text-navy-600"> · {item.venue[locale]}</span>
                    ) : null}
                  </p>
                  <h3 className="mt-2 text-h4 text-balance transition-colors group-hover:text-blue-700">
                    {item.title[locale]}
                  </h3>
                </Link>
              </li>
            );
          })}
        </CardTrack>
      </div>
    </section>
  );
}
