import { notFound } from "next/navigation";

/**
 * Catch-all inside the locale segment so an unknown path renders the branded,
 * localized 404 (`[locale]/not-found.tsx`) instead of falling through to the
 * unlocalized root not-found.
 */
export default function CatchAllNotFound() {
  notFound();
}
