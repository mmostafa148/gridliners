import { SiteFrame } from "@/components/layout/site-frame";
import { requireParticipant } from "@/lib/auth/guard";

/**
 * The participant area — inside the website, not beside it.
 *
 * **The same `SiteFrame` every public page renders**, so the announcement bar,
 * the header, its global navigation, the language control, the account control,
 * the chrome-height variables, the single skip link, the single `<main>` and
 * the footer are all the site's own. None of it is copied here; if the public
 * frame changes, this changes with it (build-state §47).
 *
 * **The guard stays at this boundary.** Every route under this layout is
 * private, it runs on the server before any child renders, and a guard repeated
 * in ten pages is a guard that will eventually be forgotten once.
 *
 * The `(dashboard)` folder name is implementation organisation and reaches
 * neither the URL nor the rendered frame; the area is "My account" everywhere a
 * reader can see.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireParticipant();
  return <SiteFrame>{children}</SiteFrame>;
}
