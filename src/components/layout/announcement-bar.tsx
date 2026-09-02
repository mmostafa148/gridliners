import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";

/**
 * Announcement bar.
 *
 * The one strip that is pinned to the top of the window from first paint and
 * never moves: the site's own header spends the hero at the foot of the screen
 * and only arrives later, and it arrives underneath this.
 *
 * Blue, because this is the identity's field colour and the bar is the only
 * place on the page that is nothing but a field. Static, per the sitemap, so
 * there is no dismiss control and no state to persist.
 *
 * Renders nothing at all when no announcement is live, rather than an empty
 * strip: the layout reads the same element's height, so an empty bar would push
 * the whole page down by 40px to say nothing.
 */
export async function AnnouncementBar() {
  const [announcement, locale, t] = await Promise.all([
    api.content.announcement(),
    getLocale() as Promise<Locale>,
    getTranslations("common"),
  ]);

  if (!announcement) return null;

  const body = (
    <>
      <span className="size-1.5 shrink-0 bg-campaign-lime" aria-hidden />
      <span className="truncate">{announcement.message[locale]}</span>
      {/* The action was hidden below sm, which left a phone with a truncated
          sentence and no way to act on it. The message gives up the room
          instead: it is already truncating, and the action is the point. */}
      {announcement.href && announcement.linkLabel ? (
        <span className="ms-1 inline-flex shrink-0 items-center gap-1.5 underline underline-offset-4">
          {announcement.linkLabel[locale]}
          <ArrowRight className="size-3.5 rtl:-scale-x-100" strokeWidth={2} aria-hidden />
        </span>
      ) : null}
    </>
  );

  return (
    <div
      data-announce-bar
      role="region"
      aria-label={t("announcement")}
      className="fixed inset-x-0 top-0 z-50 h-10 bg-blue-700 text-cream-100"
    >
      <div className="page-shell flex h-10 items-center">
        {announcement.href ? (
          <Link
            href={announcement.href}
            className="flex min-w-0 items-center gap-3 text-nav uppercase transition-colors hover:text-white"
          >
            {body}
          </Link>
        ) : (
          <p className="flex min-w-0 items-center gap-3 text-nav uppercase">{body}</p>
        )}
      </div>
    </div>
  );
}
