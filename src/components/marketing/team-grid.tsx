import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { PixelMosaic } from "@/components/brand/pixel-mosaic";
import {
  InstagramIcon,
  LinkedInIcon,
} from "@/components/brand/social-icons";
import type { Locale } from "@/i18n/routing";
import type { TeamMember } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Who runs it: the team, as people.
 *
 * Portrait, name, post, and the two accounts a designer would actually look
 * for. Six of them, three across, on a grid that steps: the middle column
 * drops half a frame so the row reads as a considered arrangement rather than
 * three things lined up. It costs nothing and it is the difference between a
 * team section and a table of staff.
 *
 * **On the portraits.** The client supplied a matched greyscale set, one per
 * placeholder person, at 960x1200 — which is 4:5, the ratio this frame was
 * already drawn at, so nothing is cropped and no face is cut. `object-top`
 * stays anyway: it costs nothing and it is the difference between a safe frame
 * and one that beheads the first portrait somebody swaps in at a different
 * ratio.
 *
 * `photoUrl` is still nullable and the `PixelMosaic` fallback still stands
 * behind it. A team list that renders a hole when one row has no picture is a
 * team list that will render a hole the week somebody joins.
 *
 * `alt=""` on the portrait. The name is set directly under it in text, so a
 * screen reader that also announced the picture would hear the person twice.
 *
 * Each account link is nullable and a null renders nothing at all. Two of these
 * six are missing one, which is what a real team looks like, and a dead icon is
 * worse than an absent one.
 */
export async function TeamGrid({ members }: { members: TeamMember[] }) {
  const [t, locale] = await Promise.all([
    getTranslations("about.team"),
    getLocale() as Promise<Locale>,
  ]);

  if (!members.length) return null;

  return (
    <section className="bg-mist text-navy-900">
      <div className="page-shell section-y">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-end">
          <h2 className="text-h1 text-balance lg:col-span-5">{t("title")}</h2>
          <p className="max-w-[46ch] text-body-md text-navy-600 lg:col-span-5 lg:col-start-7">
            {t("description")}
          </p>
        </div>

        <ul className="mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {members.map((member) => (
            <li
              key={member.id}
              // The middle column of each row of three sits half a frame low.
              // A vertical offset, so it mirrors without a second rule.
              className="lg:[&:nth-child(3n+2)]:mt-16"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-navy-950">
                {member.photoUrl ? (
                  <Image
                    src={member.photoUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                    className="object-cover object-top"
                  />
                ) : (
                  // Sparse and fine, not dense and coarse. At 0.85 across a
                  // 7x9 grid each frame was a saturated blue artwork, and six
                  // of them side by side competed with the people they are
                  // standing in for. Half the density on twice the cells reads
                  // as a treated ground.
                  <PixelMosaic
                    tone="blue"
                    seed={member.id}
                    columns={10}
                    rows={13}
                    from="end-top"
                    density={0.5}
                    className="absolute inset-0"
                  />
                )}
              </div>

              <h3 className="mt-6 text-h2 text-balance">
                {member.name[locale]}
              </h3>
              <p className="mt-2 font-display text-coord uppercase text-blue-700">
                {member.role[locale]}
              </p>
              <p className="mt-4 max-w-[34ch] text-body-sm text-navy-600">
                {member.bio[locale]}
              </p>

              <ul className="mt-5 flex items-center gap-2">
                {(
                  [
                    ["linkedin", "LinkedIn", LinkedInIcon],
                    ["instagram", "Instagram", InstagramIcon],
                  ] as const
                ).map(([key, network, Icon]) =>
                  member.links[key] ? (
                    <li key={key}>
                      <a
                        href={member.links[key]!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("socialLabel", {
                          name: member.name[locale],
                          network,
                        })}
                        className={cn(
                          "flex size-9 items-center justify-center border border-navy-900/20 text-navy-700 transition-colors",
                          "hover:border-navy-900 hover:bg-navy-900 hover:text-cream-100",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900",
                        )}
                      >
                        <Icon className="size-4" />
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
