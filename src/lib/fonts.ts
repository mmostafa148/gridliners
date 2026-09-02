import { Inter, Noto_Sans_Arabic } from "next/font/google";

/**
 * Typography sources (CLAUDE.md):
 *  - Presicav — EN display, via the Adobe Fonts (Typekit) kit. Loaded as a
 *    stylesheet link in the locale layout; the family name is "presicav" and
 *    the kit publishes weights 100/200/300/400/700/900, normal style only.
 *  - Inter — EN body, via next/font.
 *  - Noto Sans Arabic — all Arabic text, display and body, via next/font.
 *
 * The CSS variables below are consumed by the --font-sans / --font-display /
 * --font-arabic stacks in globals.css.
 */

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const fontVariables = `${inter.variable} ${notoSansArabic.variable}`;

/** Adobe Fonts kit that publishes Presicav. Override per environment if needed. */
export const ADOBE_FONTS_KIT_ID =
  process.env.NEXT_PUBLIC_ADOBE_FONTS_KIT_ID ?? "onq1ytv";

export const ADOBE_FONTS_CSS_URL = `https://use.typekit.net/${ADOBE_FONTS_KIT_ID}.css`;
