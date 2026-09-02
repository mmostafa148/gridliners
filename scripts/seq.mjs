import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

/**
 * Walks the hero scroll timeline and reports, at each stop, where the dotted
 * lockup, its solid stand-in and the nav rail actually are.
 *
 * Screenshots alone could not answer "does the mark land exactly on the rail's
 * logo" — that needs numbers, and the numbers are what caught the stale
 * aspect-ratio bug. The shots are for judging it; the table is for trusting it.
 */
const BASE = "http://localhost:3100";
const OUT = ".screens";
// Past 1 the hero is done and the rail is making its way to the top.
const STOPS = [0, 0.08, 0.25, 0.5, 0.75, 1, 1.4];

const locales = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const reduced = process.argv.includes("--reduced");
const wArg = process.argv.find((a) => a.startsWith("--w="));
const width = wArg ? Number(wArg.slice(4)) : 1440;
const height = width < 500 ? 844 : 900;

const box = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    w: Math.round(r.width),
    h: Math.round(r.height),
    x: Math.round(r.left),
    y: Math.round(r.top),
    o: Number(getComputedStyle(el).opacity).toFixed(2),
  };
};

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

for (const locale of locales.length ? locales : ["en"]) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(`${BASE}/${locale}`, { waitUntil: "load" });
  await page.waitForTimeout(900);

  const runway = await page.evaluate(() => {
    const el = document.querySelector("[data-hero-runway]");
    return el ? Math.round(el.getBoundingClientRect().height - window.innerHeight) : 0;
  });

  const tag = `${locale}-${width}${reduced ? "-reduced" : ""}`;
  console.log(`\n${tag} — runway ${runway}px`);

  for (const stop of STOPS) {
    const y = Math.round(runway * stop);
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(700); // let the scrub catch up

    const m = await page.evaluate((boxSrc) => {
      const box = eval(`(${boxSrc})`);
      const q = (s) => box(document.querySelector(s));
      // Geometry comes from the mark, opacity from the element the timeline
      // actually animates — reading both off one node reports the wrapper's
      // box or the child's untouched alpha, and neither is the truth.
      const alpha = (s) => {
        const el = document.querySelector(s);
        return el ? Number(getComputedStyle(el).opacity).toFixed(2) : "—";
      };
      const head = q("[data-hero-headline] h1 div") || q("[data-hero-headline] h1");
      const dotted = q(".dotted-logo");
      const solid = q("[data-hero-standin] img, [data-hero-standin] svg");
      if (dotted) dotted.o = alpha("[data-hero-lockup]");
      if (solid) solid.o = alpha("[data-hero-standin]");
      if (head) head.o = alpha("[data-hero-headline]");
      return {
        dotted,
        head,
        solid,
        rail: q("[data-site-rail]"),
        railA: alpha("[data-site-rail]"),
        railLogo: q("[data-rail-logo]"),
      };
    }, box.toString());

    const f = (b) => (b ? `${b.w}x${b.h} @${b.x},${b.y} α${b.o}` : "—");
    console.log(
      `  ${String(Math.round(stop * 100)).padStart(3)}%  ` +
        `dotted ${f(m.dotted).padEnd(26)} h1 ${f(m.head).padEnd(26)} ` +
        `standin a${m.solid?.o} rail y${String(m.rail?.y).padStart(4)} a${m.railA} logo @${m.railLogo?.x} a${m.railLogo?.o}`,
    );

    await page.screenshot({ path: `${OUT}/seq-${tag}-${Math.round(stop * 100)}.png` });
  }

  if (errors.length) console.log("  page errors:", errors);
  else console.log("  no page errors");
  await ctx.close();
}

await browser.close();
