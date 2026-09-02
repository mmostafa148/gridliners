#!/usr/bin/env node
/**
 * Dictionary checks for the bilingual build:
 *
 *  1. en.json and ar.json must have identical key sets — a key that exists in
 *     one language only is a half-translated screen waiting to ship.
 *  2. Every literal translation key used in src/ must exist. next-intl only
 *     reports a missing key when the component actually renders, which is how
 *     a missing `status.retry` survived into a shipped component.
 *
 * Dynamic keys (template literals) are skipped and counted, not failed.
 * Run via `pnpm lint` (or `pnpm lint:messages` on its own).
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const MESSAGES = join(SRC, "messages");

const load = (locale) => JSON.parse(readFileSync(join(MESSAGES, `${locale}.json`), "utf8"));

function flatten(value, prefix = "") {
  const keys = new Set();
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      for (const nested of flatten(child, path)) keys.add(nested);
    } else {
      keys.add(path);
    }
  }
  return keys;
}

const en = load("en");
const ar = load("ar");
const enKeys = flatten(en);
const arKeys = flatten(ar);

const errors = [];

// --- 1. Dictionary parity ---------------------------------------------------
const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));
for (const key of missingInAr) errors.push(`Key "${key}" exists in en.json but not ar.json`);
for (const key of missingInEn) errors.push(`Key "${key}" exists in ar.json but not en.json`);

// --- 1b. Dash discipline ----------------------------------------------------
// Em and en dashes are the clearest typographic tell of machine-written copy,
// and they also break Arabic line composition. Only the plain hyphen ships.
for (const [locale, dict] of [["en", en], ["ar", ar]]) {
  const walk = (node, path) => {
    if (node && typeof node === "object") {
      for (const [key, child] of Object.entries(node)) walk(child, path ? `${path}.${key}` : key);
    } else if (typeof node === "string" && /[\u2014\u2013]/.test(node)) {
      errors.push(`${locale}.json "${path}" contains an em/en dash: ${node.slice(0, 60)}`);
    }
  };
  walk(dict, "");
}

// --- 2. Key usage -----------------------------------------------------------
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(entry.name)) yield full;
  }
}

// `const t = useTranslations("ns")`, `const t = await getTranslations("ns")`,
// and `getTranslations({ locale, namespace: "ns" })`.
const DECLARE = [
  /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*["'`]([\w.]+)["'`]\s*\)/g,
  /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?getTranslations\(\s*\{[^}]*namespace:\s*["'`]([\w.]+)["'`]/g,
];
// `const [a, b] = await Promise.all([getTranslations("x"), getTranslations("y")])`
const DESTRUCTURED =
  /(?:const|let)\s*\[([^\]]+)\]\s*=\s*await\s+Promise\.all\(\s*\[([\s\S]*?)\]\s*\)/g;

let dynamicSkipped = 0;

for await (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  const source = readFileSync(file, "utf8");
  const namespaces = new Map();

  for (const pattern of DECLARE) {
    for (const match of source.matchAll(pattern)) namespaces.set(match[1], match[2]);
  }
  for (const match of source.matchAll(DESTRUCTURED)) {
    const names = match[1].split(",").map((n) => n.trim());
    const calls = [...match[2].matchAll(/getTranslations\(\s*["'`]([\w.]+)["'`]\s*\)/g)];
    names.forEach((name, i) => {
      if (calls[i]) namespaces.set(name, calls[i][1]);
    });
  }

  if (namespaces.size === 0) continue;

  for (const [variable, namespace] of namespaces) {
    const call = new RegExp(`\\b${variable}\\(\\s*(["'\`])([^"'\`$]*?)\\1`, "g");
    for (const match of source.matchAll(call)) {
      const key = `${namespace}.${match[2]}`;
      if (!enKeys.has(key)) {
        errors.push(`${rel}: uses "${key}" (via ${variable}) — not in en.json`);
      }
    }
    // Template-literal keys cannot be resolved statically.
    dynamicSkipped += [...source.matchAll(new RegExp(`\\b${variable}\\(\\s*\`[^\`]*\\$\\{`, "g"))]
      .length;
  }
}

if (errors.length > 0) {
  console.error(`\n✖ lint:messages — ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  ${error}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✔ lint:messages — ${enKeys.size} keys, en/ar in parity, all literal usages resolve` +
    (dynamicSkipped > 0 ? ` (${dynamicSkipped} dynamic key(s) skipped)` : ""),
);
