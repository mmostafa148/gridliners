import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught about this project's type scale.
 *
 * Every font size here is a custom token (`text-display-lg`, `text-h1`,
 * `text-body-md`, `text-data-sm`, `text-coord`, `text-nav`). tailwind-merge
 * only knows Tailwind's built-in sizes, so it classified all of ours as text
 * COLOUR utilities. A component combining a size and a colour then lost the
 * colour: `cn("text-navy-900", "text-data-sm")` returned only the size, and
 * the element silently inherited whatever colour its ancestor had.
 *
 * That shipped: the header's gold CTA rendered cream-on-gold at roughly 2.2:1
 * because the button's `text-navy-900` was being stripped by its own size
 * class. Declaring the scale fixes it everywhere at once.
 */
const FONT_SIZES: readonly string[] = [
  "display-xl",
  "display-lg",
  "display-md",
  "h1",
  "h2",
  "h3",
  "h4",
  "body-lg",
  "body-md",
  "body-sm",
  "caption",
  "overline",
  "data-lg",
  "data-md",
  "data-sm",
  "coord",
  "nav",
  // The participant module's three headings. Same trap, caught the same way:
  // `cn("font-display text-account-section text-navy-900")` returned only the
  // colour, so every section heading in the account area silently rendered at
  // the inherited 16px instead of 27.4.
  "account-title",
  "account-section",
  "account-card",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
