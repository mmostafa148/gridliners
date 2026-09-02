import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { awardById } from "@/lib/award";

/**
 * The award's share card.
 *
 * The same generator shape as 1.8's project card, and for the same reasons —
 * a route segment is a generator, it is deterministic per award and per locale,
 * and it needs no field on any record. What it carries is different: the award
 * is the subject, so the metal, the level and the year lead, and the project is
 * the line beneath.
 *
 * **The Arabic face is IBM Plex Sans Arabic, not the site's Noto.** Satori
 * cannot shape Noto Sans Arabic — every build throws
 * `lookupType: 5 - substFormat: 3 is not yet supported`. That was established
 * and recorded for 1.8; the same substitution applies here, confined to this
 * 1200x630 image.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Gridliners Awards";

const LATIN = "Inter";
const ARABIC = "IBM Plex Sans Arabic";

/** One fetch per build, and a fresh copy per card: `ImageResponse` detaches
 *  the buffer it is handed, so a cached one would work exactly once. */
let fontCache: Promise<{ name: string; data: ArrayBuffer }[]> | null = null;

async function faceFor(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@700&display=swap`,
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
  return (await fontCache).map((font) => ({ ...font, data: font.data.slice(0) }));
}

const METAL: Record<string, { fill: string; ink: string; ground: string }> = {
  gold: { fill: "#d4a64a", ink: "#0a1a3c", ground: "#01091f" },
  silver: { fill: "#9ea2ab", ink: "#0a1a3c", ground: "#01091f" },
  bronze: { fill: "#a06842", ink: "#ffffff", ground: "#01091f" },
  honorary: { fill: "#ffffff", ink: "#111111", ground: "#111111" },
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; resultId: string }>;
}) {
  const { locale, resultId } = await params;
  const award = await awardById(decodeURIComponent(resultId), locale);
  const loaded = await fonts();

  const [tLevel, tType, t] = await Promise.all([
    getTranslations({ locale, namespace: "awardLevel" }),
    getTranslations({ locale, namespace: "honoraryType" }),
    getTranslations({ locale, namespace: "award" }),
  ]);

  const metal = METAL[award?.colorway ?? "gold"];
  const name = award
    ? award.kind === "medal"
      ? tLevel(award.level)
      : tType(award.type)
    : "Gridliners";
  const rtl = locale === "ar";
  const family = rtl ? ARABIC : LATIN;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: metal.ground,
          padding: 72,
          fontFamily: family,
          direction: rtl ? "rtl" : "ltr",
        }}
      >
        {/* The metal, as a plate. Satori has no logical insets, so the bar is
            drawn full width rather than anchored to one edge. */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              background: metal.fill,
              color: metal.ink,
              padding: "12px 30px",
              fontSize: 30,
              letterSpacing: 3,
            }}
          >
            {name.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(251,238,204,0.8)" }}>
            {award?.cycle.year ?? ""}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(251,238,204,0.7)" }}>
            {t("holder")}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.1,
              color: "#fbeecc",
              maxWidth: 980,
            }}
          >
            {award?.holder ?? ""}
          </div>
          {award?.entry ? (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: "rgba(251,238,204,0.75)",
                maxWidth: 980,
              }}
            >
              {award.entry.title}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size, fonts: loaded.length ? loaded : undefined },
  );
}
