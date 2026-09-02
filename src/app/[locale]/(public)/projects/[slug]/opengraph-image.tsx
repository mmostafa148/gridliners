import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { projectBySlug } from "@/lib/project";

/**
 * The share card, generated per project.
 *
 * §1.8 bullet 6 asks for a per-project social preview image, and build-state
 * §15 called it a gap with "no model and no generator". **It needs no model.**
 * A route segment is a generator: this is deterministic, unique per project and
 * per locale, and adds nothing to `Entry`.
 *
 * **It carries the project's own cover.** The earlier card drew geometry only,
 * on the reasoning that no photograph on this build is the entrant's own; that
 * direction was rejected with the rest of the no-photography approach
 * (build-state §16). The card now composites the same frame the page opens on,
 * so a shared link previews the work rather than a pattern - and the frame is
 * registered as temporary in `docs/temporary-media.md` exactly as the page's is.
 *
 * The cover sits under a scrim rather than beside the type: a 1200x630 card has
 * room for one image and three lines, and a split would give neither enough.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Gridliners Awards";

/**
 * **The Arabic face here is not the site's, and that is not a slip.**
 *
 * The site sets Noto Sans Arabic through `next/font`. Satori - what
 * `ImageResponse` renders with - cannot shape it: every Noto Arabic build
 * throws `lookupType: 5 - substFormat: 3 is not yet supported`, and so does
 * Amiri. Verified against the real renderer rather than assumed, after every
 * Arabic card failed by closing the connection with no response at all.
 *
 * Cairo, Tajawal, Almarai and IBM Plex Sans Arabic all shape correctly, and
 * IBM Plex Sans Arabic is the humanist sans among them - the nearest thing to
 * Noto Sans Arabic that can actually be drawn.
 *
 * The substitution is confined to this one 1200x630 image. The alternative was
 * no share card for the 15 Arabic-authored projects, which is worse: an Arabic
 * title is exactly the case a generated card exists to serve.
 */
const LATIN = "Inter";
const ARABIC = "IBM Plex Sans Arabic";

/**
 * One fetch per build, not one per card - and a fresh copy per card.
 *
 * 390 projects across two locales is 780 cards; without the cache the build
 * would ask Google Fonts for the same two files 1,560 times. **The copy is not
 * an optimisation.** `ImageResponse` takes ownership of the `ArrayBuffer` it is
 * handed and detaches it, so a cached buffer would work exactly once.
 *
 * Fetching at build adds no new class of dependency: `next/font/google` already
 * downloads these families for the site itself.
 */
let fontCache: Promise<{ name: string; data: ArrayBuffer }[]> | null = null;

async function faceFor(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@700&display=swap`,
      // A desktop UA is what makes Google serve TTF rather than WOFF2, which
      // `ImageResponse` cannot read.
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((https:[^)]+\.(?:ttf|otf))\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

async function fonts() {
  fontCache ??= (async () => {
    const [latin, arabic] = await Promise.all([
      faceFor(LATIN.replace(/ /g, "+")),
      faceFor(ARABIC.replace(/ /g, "+")),
    ]);
    return [
      ...(latin ? [{ name: LATIN, data: latin }] : []),
      ...(arabic ? [{ name: ARABIC, data: arabic }] : []),
    ];
  })();
  const cached = await fontCache;
  return cached.map((font) => ({ ...font, data: font.data.slice(0) }));
}

const METAL: Record<string, { fill: string; ink: string }> = {
  gold: { fill: "#d4a64a", ink: "#0a1a3c" },
  silver: { fill: "#9ea2ab", ink: "#0a1a3c" },
  bronze: { fill: "#a06842", ink: "#ffffff" },
};

export default async function Image({
  params,
}: {
  // A Promise in Next 15, the same as a page's. Read as a plain object it
  // yields `undefined` for both fields, and `getTranslations` throws on an
  // undefined locale.
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = await projectBySlug(decodeURIComponent(slug));
  const loaded = await fonts();
  const tStanding = await getTranslations({ locale, namespace: "project.standing" });

  const title = project?.entry.title ?? "Gridliners";
  const group = project?.standings[0]?.subCategory.name[locale] ?? "";
  const rtl = project?.contentDir === "rtl";
  // Medals only in the finalized-results variant. A card for a project still in
  // voting must not carry one, and `standings` only holds a medal once
  // `results.published` has one.
  const medal =
    project?.votingState === "results"
      ? (project.standings.find((s) => s.medal)?.medal ?? null)
      : null;
  const showsCount = project ? project.votingState !== "pre_voting" : false;
  // Absolute, because satori fetches it over HTTP rather than off disk.
  // Only a file-backed cover can be composited: satori fetches over HTTP, and a
  // drawn artefact exists only as inline SVG in the page. A generated project's
  // card falls back to the brand field, which is honest - there is no photograph
  // of it to show.
  const cover =
    project?.cover?.kind === "file"
      ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100"}${project.cover.src}`
      : null;
  /**
   * Final client media is shown whole, beside the type.
   *
   * The card composites the cover full-bleed under a scrim, which crops it to
   * 1200x630 and sets the title over it. For media the client has supplied as
   * final - "use exactly as supplied, no crop, no overlay" - that is not
   * allowed, and the format cannot be argued with: a 4:3 picture does not fill
   * a 1.9:1 card. So the card gives way instead of the asset, and splits.
   */
  const protectedMedia =
    project?.cover?.kind === "file" &&
    !project.cover.temporary &&
    project.cover.origin === "client";

  // The whole card takes the Arabic face when either the page or the work is
  // Arabic, so a Latin title on an Arabic page still finds glyphs for its own
  // label text.
  const family = rtl || locale === "ar" ? ARABIC : LATIN;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#01091f",
          padding: 72,
          fontFamily: family,
          // On the root, not only on the block that holds the title: the group
          // line above it is authored text too and has to order its words the
          // same way.
          direction: rtl ? "rtl" : "ltr",
        }}
      >
        {/* The project's own cover, full-bleed, with a scrim heavy enough for
            the type to clear it at any frame. */}
        {/* A bare `img`, not `next/image`: satori renders this, not a browser,
            and `next/image` has no meaning inside an `ImageResponse`. */}
        {cover && !protectedMedia ? (
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            // rtl-ok: satori has no logical insets, and a full-bleed cover is
            // the same rectangle in either direction.
            style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} // rtl-ok: satori has no logical insets; a full-bleed cover does not mirror
          />
        ) : null}
        {cover && !protectedMedia ? (
          <div
            style={{
              position: "absolute",
              // Explicit bounds, not `inset: 0`: satori does not implement the
              // shorthand, so the scrim had zero size and the cover's own
              // lettering competed with the card's type at full strength.
              top: 0,
              left: 0, // rtl-ok: satori has no logical insets; a full-bleed scrim does not mirror
              width: 1200,
              height: 630,
              // Light at the top so the artwork reads, near-solid where the
              // type sits: a cover that is itself a design artefact carries its
              // own lettering, and a flat scrim let the two collide.
              background:
                "linear-gradient(180deg, rgba(1,9,31,0.30) 0%, rgba(1,9,31,0.52) 44%, rgba(1,9,31,0.97) 76%)",
            }}
          />
        ) : null}

        {protectedMedia && cover ? (
          <img
            src={cover}
            alt=""
            width={520}
            height={630}
            // rtl-ok: satori has no logical insets; the plate mirrors with the
            // card's own direction below.
            style={{
              position: "absolute",
              top: 0,
              ...(rtl ? { left: 0 } : { right: 0 }), // rtl-ok: mirrored above; satori has no logical insets
              width: 520,
              height: 630,
              objectFit: "contain",
            }}
          />
        ) : null}

        {/* The identity's field, hung off the end corner the way the site's own
            page headers hang theirs - but never over protected media, where it
            would land on the client's picture as a tinted overlay. */}
        {protectedMedia ? null : (
        <div
          style={{
            position: "absolute",
            top: 0,
            // Satori implements a CSS subset with no logical inset properties,
            // so the mirroring `PageHeader` gets free from `end-0` is written
            // out by hand. The field still flips with the content.
            ...(rtl ? { left: 0 } : { right: 0 }), // rtl-ok: mirrored above; satori has no logical insets
            display: "flex",
            flexWrap: "wrap",
            width: 480,
            opacity: cover && !protectedMedia ? 0.55 : 1,
          }}
        >
          {[0.14, 0.3, 0.1, 0.22, 0.08, 0.34, 0.16, 0.26, 0.12].map((alpha, i) => (
            <div
              key={i}
              style={{
                width: 160,
                height: 120,
                background:
                  i % 3 === 1
                    ? `rgba(33,35,188,${alpha + 0.2})`
                    : `rgba(251,238,204,${alpha})`,
              }}
            />
          ))}
        </div>
        )}

        <div
          style={{
            display: "flex",
            position: "relative",
            fontSize: 26,
            letterSpacing: 4,
            color: "rgba(251,238,204,0.85)",
          }}
        >
          {group.toUpperCase()}
        </div>

        <div
          style={{
            display: "flex",
            position: "relative",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 76,
              lineHeight: 1.1,
              color: "#fbeecc",
              maxWidth: protectedMedia ? 600 : 900,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {medal ? (
              <div
                style={{
                  display: "flex",
                  background: METAL[medal].fill,
                  color: METAL[medal].ink,
                  padding: "10px 26px",
                  fontSize: 26,
                  letterSpacing: 3,
                }}
              >
                {medal.toUpperCase()}
              </div>
            ) : null}
            {/* The count says what it is - a bare figure on a share card reads
                as anything - and it is absent before voting opens, where a zero
                would read as a result rather than a window that has not
                started. */}
            {showsCount && project ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  letterSpacing: 2,
                  color: "rgba(251,238,204,0.75)",
                }}
              >
                {`${project.votes} ${tStanding("votesUnit").toUpperCase()}`}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: loaded.length ? loaded : undefined },
  );
}
