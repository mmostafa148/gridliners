import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * Logical-properties enforcement (CLAUDE.md: "logical properties only — never
 * left/right utilities"). Every screen mirrors in Arabic, so a physical
 * utility is a latent RTL bug.
 *
 * Tailwind v4's `space-x-*` and `divide-x-*` already compile to
 * margin-inline / border-inline, so they stay allowed.
 */
const PHYSICAL_UTILITY =
  "(^|[\\s:\\[])-?(ml|mr|pl|pr|left|right|inset-l|inset-r|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|scroll-ml|scroll-mr|scroll-pl|scroll-pr|float-left|float-right|clear-left|clear-right|text-left|text-right|origin-left|origin-right)(-[^\\s\"'`]*)?($|[\\s\"'`])";

const LOGICAL_MESSAGE =
  "Physical direction utility found. Use the logical equivalent so the UI mirrors in Arabic: ms-/me- (margin), ps-/pe- (padding), start-/end- (inset), border-s/border-e, rounded-s*/rounded-e*, text-start/text-end, scroll-ms/scroll-me, float-start/float-end, origin-start/origin-end. If a physical value is genuinely required (e.g. a Radix popper side), disable this rule on the line with a comment explaining why.";

const classNameSelectors = [
  `JSXAttribute[name.name=/^(className|class)$/] Literal[value=/${PHYSICAL_UTILITY}/]`,
  `JSXAttribute[name.name=/^(className|class)$/] TemplateElement[value.raw=/${PHYSICAL_UTILITY}/]`,
  // cva()/cn()/clsx() variant maps live outside JSX, so catch them too.
  `CallExpression[callee.name=/^(cva|cn|clsx|twMerge|tv)$/] Literal[value=/${PHYSICAL_UTILITY}/]`,
  `CallExpression[callee.name=/^(cva|cn|clsx|twMerge|tv)$/] TemplateElement[value.raw=/${PHYSICAL_UTILITY}/]`,
];

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...classNameSelectors.map((selector) => ({
          selector,
          message: LOGICAL_MESSAGE,
        })),
      ],
    },
  },
  {
    // Vendored shadcn primitives. Their remaining physical values are Radix
    // popper sides (data-[side=left|right]) and Sheet's visual side variants,
    // which are direction-aware at runtime — shadcn was initialized with
    // rtl: true. Application code stays under the rule above.
    files: ["src/components/ui/**"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      // Where a verification build goes when the dev server owns `.next`.
      ".next-verify/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
