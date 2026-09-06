import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";

export const SITE_SHARE_IMAGE_SIZE = { width: 1200, height: 630 };
export const SITE_SHARE_IMAGE_TYPE = "image/png";

const LATIN = "Inter";
const ARABIC = "IBM Plex Sans Arabic";

let fontCache: Promise<{ name: string; data: ArrayBuffer }[]> | null = null;

async function faceFor(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@600;700&display=swap`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        },
      },
    ).then((response) => response.text());
    const url = css.match(/src: url\((https:[^)]+\.(?:ttf|otf))\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((response) => response.arrayBuffer());
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

  return (await fontCache).map((font) => ({
    ...font,
    data: font.data.slice(0),
  }));
}

const PIXELS = [
  [0, 0, 2, 1, "#2123bc"],
  [2, 0, 1, 1, "#d4a64a"],
  [3, 0, 2, 2, "#171d3d"],
  [1, 1, 2, 2, "#3031c7"],
  [0, 2, 1, 2, "#f3f3f9"],
  [3, 2, 1, 1, "#fbeecc"],
  [4, 2, 1, 2, "#2123bc"],
  [1, 3, 1, 1, "#d4a64a"],
  [2, 3, 2, 1, "#121936"],
] as const;

export async function createSiteShareImage(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "common" });
  const loadedFonts = await fonts();
  const rtl = locale === "ar";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#01091f",
          color: "#fbeecc",
          fontFamily: rtl ? ARABIC : LATIN,
          direction: "ltr",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 785,
            height: "100%",
            padding: "62px 68px 58px",
            direction: rtl ? "rtl" : "ltr",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 46,
                height: 46,
                border: "12px solid #ffffff",
                borderRightWidth: 0, // rtl-ok: fixed, non-mirroring logo geometry; Satori has no logical border.
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 20,
                  height: 12,
                  marginTop: 12,
                  marginLeft: 18, // rtl-ok: fixed geometry inside the non-mirroring logo mark.
                  background: "#ffffff",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                color: "#ffffff",
                fontSize: 31,
                fontWeight: 700,
                letterSpacing: -1,
              }}
            >
              {t("siteShortName")}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "flex",
                color: "#d4a64a",
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: rtl ? 0 : 4,
                textTransform: rtl ? "none" : "uppercase",
              }}
            >
              {rtl ? "جوائز التصميم في المنطقة" : "THE REGION'S DESIGN AWARDS"}
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 660,
                color: "#fbeecc",
                fontSize: rtl ? 59 : 62,
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: rtl ? 0 : -2.5,
              }}
            >
              {t("tagline")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              color: "rgba(251,238,204,0.72)",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: rtl ? 0 : 2.6,
            }}
          >
            <div style={{ display: "flex", width: 42, height: 3, background: "#2123bc" }} />
            {rtl ? "المشاركات · المرشحون · الفائزون" : "ENTRIES · FINALISTS · WINNERS"}
          </div>
        </div>

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0, // rtl-ok: the brand field is intentionally fixed in the physical end panel.
            display: "flex",
            width: 415,
            height: 630,
            background: "#0a1737",
          }}
        >
          {PIXELS.map(([column, row, columnSpan, rowSpan, color], index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: column * 83, // rtl-ok: coordinates belong to the fixed brand artwork, not page flow.
                top: row * 126,
                width: columnSpan * 83,
                height: rowSpan * 126,
                background: color,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              right: 44, // rtl-ok: fixed inside the physical brand-art panel above.
              bottom: 40,
              display: "flex",
              color: "rgba(251,238,204,0.78)",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            2026
          </div>
        </div>
      </div>
    ),
    {
      ...SITE_SHARE_IMAGE_SIZE,
      fonts: loadedFonts.length ? loadedFonts : undefined,
    },
  );
}
