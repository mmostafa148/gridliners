import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

/**
 * /dev/boom — a route that fails, so the error boundary can be proven.
 *
 * `error.tsx` offers a retry, and a retry that re-renders the same broken tree
 * only looks like it works. This fails the first time a given token is asked
 * for and succeeds every time after, so the boundary has to actually recover
 * for the page to appear.
 *
 * **The throw is on the server, not in a client component.** React re-renders a
 * client component that threw before the boundary commits, so a client-side
 * throw-once recovers by itself and the boundary is never seen. A server render
 * happens once per request, which is exactly the granularity `reset()` works at.
 *
 * The token keeps it repeatable: module state lives as long as the dev server,
 * so a fixed flag would fail once and never again. A fresh `?t=` fails again.
 *
 * Dev-only on the same terms as the kitchen sink: 404s in production unless
 * NEXT_PUBLIC_ENABLE_DEV_ROUTES=1.
 */

const seen = new Set<string>();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function BoomPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_ROUTES !== "1"
  ) {
    notFound();
  }

  const { t = "default" } = await searchParams;
  if (!seen.has(t)) {
    seen.add(t);
    throw new Error(`Deliberate failure from /dev/boom (${t})`);
  }

  return (
    <div className="page-shell py-24">
      <h1 className="text-h1">Recovered</h1>
      <p className="mt-4 text-body-md text-navy-600">
        The boundary retried this segment and it rendered.
      </p>
    </div>
  );
}
