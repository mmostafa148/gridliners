"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { accountAction } from "@/components/account/system";
import { cn } from "@/lib/utils";

/**
 * Copy an absolute URL to the clipboard.
 *
 * The origin is read in the browser rather than passed in, because the server
 * does not reliably know the public host in this build and a half-formed URL
 * pasted into a message is worse than no button.
 *
 * The confirmation is announced and then withdrawn, so a screen reader hears
 * it once rather than finding a permanent "Copied" wherever it lands next.
 */
export function CopyLink({ path }: { path: string }) {
  const t = useTranslations("entry");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`);
          setCopied(true);
        } catch {
          // A denied clipboard permission is not an error worth a dialog: the
          // link is beside this control and can be copied by hand.
        }
      }}
      className={cn(accountAction.quiet, "gap-2")}
    >
      {copied ? (
        <Check aria-hidden className="size-4" strokeWidth={2.5} />
      ) : (
        <Copy aria-hidden className="size-4" />
      )}
      <span aria-live="polite">{copied ? t("copied") : t("copyLink")}</span>
    </button>
  );
}
