#!/usr/bin/env node
/**
 * RTL safety net for the places ESLint cannot see: raw CSS declarations, and
 * inline `style` objects. Pairs with the `no-restricted-syntax` rule in
 * eslint.config.mjs, which covers Tailwind utilities in className.
 *
 * Run via `pnpm lint` (or `pnpm lint:rtl` on its own).
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

/** Vendored code we do not own; see eslint.config.mjs for the rationale. */
const IGNORED_PATHS = [join("src", "components", "ui")];

const RULES = [
  {
    // Physical CSS box properties.
    re: /(^|[^-\w])(margin|padding|border|scroll-margin|scroll-padding)-(left|right)\s*:/i,
    hint: "use the -inline-start / -inline-end form",
  },
  {
    // Physical offsets as CSS declarations (skips `data-[side=left]` etc.).
    re: /(^|[;{\s])(left|right)\s*:\s*(?!auto\s*;?\s*\/\* physical-ok)/i,
    hint: "use inset-inline-start / inset-inline-end",
  },
  {
    re: /text-align\s*:\s*(left|right)/i,
    hint: "use text-align: start / end",
  },
  {
    re: /(^|[^-\w])(float|clear)\s*:\s*(left|right)/i,
    hint: "use float/clear: inline-start / inline-end",
  },
  {
    // Inline style objects in TSX.
    re: /\b(marginLeft|marginRight|paddingLeft|paddingRight|borderLeft|borderRight|textAlign\s*:\s*["'](left|right)["'])/,
    hint: "use the logical JS property (marginInlineStart, paddingInlineEnd, …)",
  },
];

/** Lines carrying this marker are accepted, provided they explain themselves. */
const ALLOW_MARKER = "rtl-ok";

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (/\.(tsx?|css)$/.test(entry.name)) {
      yield full;
    }
  }
}

const findings = [];

for await (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  if (IGNORED_PATHS.some((p) => rel.startsWith(p))) continue;

  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes(ALLOW_MARKER)) return;
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        findings.push({ file: rel, line: i + 1, text: line.trim(), hint: rule.hint });
        break;
      }
    }
  });
}

if (findings.length > 0) {
  console.error(`\n✖ lint:rtl — ${findings.length} physical-direction declaration(s) found:\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    ${f.text}`);
    console.error(`    → ${f.hint}\n`);
  }
  console.error(
    `Every screen mirrors in Arabic. If a physical value is genuinely required,\n` +
      `append a "${ALLOW_MARKER}" comment on the line explaining why.\n`,
  );
  process.exit(1);
}

console.log("✔ lint:rtl — no physical-direction CSS found in src/");
