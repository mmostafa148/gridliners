"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { SystemState, systemPrimary, systemSecondary } from "@/components/marketing/system-state";
import { Link } from "@/i18n/navigation";

/**
 * The error boundary.
 *
 * **Retrying is the point of this page**, and it is the first action: it
 * re-renders the segment that failed without a full navigation, so a transient
 * failure costs a click rather than a reload. The home link is the fallback for
 * when retrying does not help.
 *
 * **`reset()` on its own does not retry a server failure.** It re-renders the
 * boundary against the router cache, and for a segment that failed on the
 * server that cache still holds the failure - so the button appeared to work
 * and the same error came straight back. Measured, not assumed: a route that
 * throws once and then succeeds stayed on the error state through every press.
 * `router.refresh()` discards the cached payload and asks the server again;
 * `reset()` then re-mounts the boundary against the fresh answer. Both, in one
 * transition, so the button stays responsive while the request is in flight.
 *
 * The digest is printed only where it exists. It is the one thing that lets
 * somebody match a report to a log line, and it is meaningless to the reader,
 * so it is set small and last rather than presented as an explanation.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("system");
  const router = useRouter();
  const [retrying, startRetry] = useTransition();

  useEffect(() => {
    // Reported once per failure. A boundary that swallows the error silently
    // is a boundary that makes the next one impossible to find.
    console.error("[route error]", error);
  }, [error]);

  return (
    <SystemState
      code={t("error.code")}
      title={t("error.title")}
      body={t("error.body")}
      actions={
        <>
          <button
            type="button"
            onClick={() =>
              startRetry(() => {
                router.refresh();
                reset();
              })
            }
            disabled={retrying}
            aria-busy={retrying || undefined}
            className={systemPrimary}
          >
            {t("error.retry")}
          </button>
          <Link href="/" className={systemSecondary}>
            {t("error.home")}
          </Link>
        </>
      }
    >
      {error.digest ? (
        <p className="mt-8 font-data text-data-sm tabular-nums text-cream-200/55">
          {error.digest}
        </p>
      ) : null}
    </SystemState>
  );
}
