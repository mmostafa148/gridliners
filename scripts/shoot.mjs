#!/usr/bin/env node
/**
 * Screenshot the running dev server.
 *
 * Exists because the design work on this project was being done blind: code
 * written, screenshot requested from the user, guess again. A parchment
 * texture, a broken staircase layout and four identical gold frames all
 * shipped that way and all would have been obvious on sight.
 *
 * Usage:
 *   pnpm shoot                    all routes, both locales, all widths
 *   pnpm shoot /                  one route
 *   pnpm shoot / --w 2050         one route at one width
 *   pnpm shoot / --locale ar      one locale
 *
 * Output: .screens/<locale><route>-<width>.png (gitignored)
 */
import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, ".screens");
const BASE = process.env.SHOOT_BASE ?? "http://localhost:3100";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const positional = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));

const ROUTES = positional.length > 0 ? positional : ["/"];
const LOCALES = flag("locale") ? [flag("locale")] : ["en", "ar"];
const WIDTHS = flag("w") ? [Number(flag("w"))] : [390, 1440, 2050];
const FULL = flag("full", "1") !== "0";

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const shots = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: Math.round(width * 0.62) },
    deviceScaleFactor: width <= 500 ? 2 : 1,
    // Motion is verified separately; a screenshot should catch the settled
    // state, not a frame halfway through an entrance animation.
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const url = `${BASE}/${locale}${route === "/" ? "" : route}`;
      // `networkidle` is unreliable against the dev server's HMR socket, which
      // never goes quiet. Load, then wait on the things that actually matter.
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForLoadState("load", { timeout: 60_000 }).catch(() => {});

      // Let fonts settle so Presicav is measured, not the fallback.
      await page.evaluate(() => document.fonts.ready);

      // Scroll the whole page first. next/image lazy-loads by default, so a
      // straight fullPage capture photographs empty boxes where every
      // below-the-fold image should be, which is exactly the false negative
      // this script exists to prevent.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
      });

      // Then wait for every image to actually decode.
      await page.waitForFunction(
        () => [...document.querySelectorAll("img")].every((i) => i.complete && i.naturalWidth > 0),
        undefined,
        { timeout: 25_000 },
      ).catch(() => console.warn("    (some images never loaded)"));

      await page.waitForTimeout(300);

      const name = `${locale}${route === "/" ? "-home" : route.replace(/\//g, "-")}-${width}.png`;
      const file = join(OUT, name);
      await mkdir(dirname(file), { recursive: true });
      await page.screenshot({ path: file, fullPage: FULL });

      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );

      shots.push({ name, status: response?.status(), height, overflow });
      console.log(
        `  ${name.padEnd(26)} ${response?.status()}  ${String(height).padStart(6)}px tall` +
          (overflow ? "  ⚠ HORIZONTAL OVERFLOW" : ""),
      );
    }
  }

  await context.close();
}

await browser.close();

const bad = shots.filter((s) => s.status !== 200 || s.overflow);
console.log(`\n${shots.length} screenshot(s) in .screens/`);
if (bad.length > 0) {
  console.error(`✖ ${bad.length} with problems: ${bad.map((b) => b.name).join(", ")}`);
  process.exit(1);
}
