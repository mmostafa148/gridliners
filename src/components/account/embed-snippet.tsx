"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The badge markup, as a code block.
 *
 * **A code block has a header.** This was a caption, a bare `<pre>`, and a blue
 * link floating underneath — three loose parts that did not read as one object.
 * It is now a bordered block whose header carries what the code is and the
 * control that copies it, which is where every code block a developer has ever
 * used puts them.
 *
 * The `<pre>` is pinned LTR: HTML is not prose. In an Arabic page the bidi
 * algorithm reorders the tags and the snippet reads as scrambled markup — the
 * closing tag lands on the wrong side and a reader cannot tell whether what
 * they are about to copy is correct. Code has one direction.
 */
export function EmbedSnippet({ snippet }: { snippet: string }) {
  const t = useTranslations("awards");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div>
      <p className="mb-2.5 text-caption font-semibold uppercase tracking-[0.06em] text-navy-600">
        {t("embed")}
      </p>

      <div className="border border-navy-900/12">
        <div className="flex items-center justify-between gap-4 border-b border-navy-900/10 bg-mist px-3 py-1.5">
          <span className="font-data text-[0.6875rem] font-bold tracking-[0.06em] text-navy-600">
            HTML
          </span>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(snippet);
                setCopied(true);
              } catch {
                // Denied clipboard permission is not worth a dialog: the snippet
                // is on the screen and can be selected by hand.
              }
            }}
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 text-[0.8125rem] font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700",
              copied ? "text-blue-700" : "text-navy-700 hover:text-navy-900",
            )}
          >
            {copied ? (
              <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
            ) : (
              <Copy aria-hidden className="size-3.5" />
            )}
            <span aria-live="polite">{copied ? t("copied") : t("copyEmbed")}</span>
          </button>
        </div>

        <pre
          dir="ltr"
          className="overflow-x-auto bg-white p-3.5 text-start font-data text-[0.8125rem] leading-relaxed tracking-normal text-navy-800"
        >
          <code>{snippet}</code>
        </pre>
      </div>
    </div>
  );
}
