import { SiteFrame } from "@/components/layout/site-frame";

/**
 * The four 2.1 screens — inside the website, like everything else.
 *
 * **They first had a frame of their own**: a split navy panel with a second
 * logo, no announcement bar, no navigation and no footer. Signing in is not a
 * departure from the site, so the site's own frame stays up (build-state §47).
 *
 * They deliberately carry **no account navigation** — the visitor is not signed
 * in yet, and offering the seven private destinations to somebody who cannot
 * reach any of them is an interface lying about what it can do. The header's
 * account control shows the logged-out pair instead, which is correct here.
 *
 * The focused composition lives inside the page, in `AuthScreen`.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
