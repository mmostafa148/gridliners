import { notFound, redirect } from "next/navigation";

import { __dev } from "@/lib/api";

/**
 * Reseed the mock store from the fixtures.
 *
 * **`api.__dev.reset()` already existed; it just had no door.** The mock holds
 * its state in memory for the life of the server process, so a review session
 * that settles a tier difference or submits an entry has permanently changed
 * what the next reviewer sees — and the only way back was restarting the dev
 * server.
 *
 * Dev-only on the same terms as the kitchen sink and `/dev/boom`: it 404s in
 * production unless `NEXT_PUBLIC_ENABLE_DEV_ROUTES=1`, so there is no route
 * that can wipe real data.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_ROUTES !== "1"
  ) {
    notFound();
  }
  const { locale } = await params;
  __dev.reset();
  redirect(`/${locale}/dashboard`);
}
