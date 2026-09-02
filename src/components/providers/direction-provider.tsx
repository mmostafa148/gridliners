"use client";

import { Direction } from "radix-ui";

/**
 * Tells Radix which way the page reads.
 *
 * Radix overlays render through a portal on document.body and do not consult
 * the document's own dir, so without this they lay out left to right whatever
 * the page is doing. In Arabic that put the account menu's icon on the wrong
 * side of its label and sent `ms-auto` the wrong way — and it applies to every
 * menu, popover, tooltip and sheet in the app, not only the one it was noticed
 * on.
 */
export function DirectionProvider({
  dir,
  children,
}: {
  dir: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  return <Direction.DirectionProvider dir={dir}>{children}</Direction.DirectionProvider>;
}
