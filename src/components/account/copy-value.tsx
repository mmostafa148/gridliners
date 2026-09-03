"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { accountAction } from "@/components/account/system";
import { cn } from "@/lib/utils";

/** Copy a short account reference without making it look like navigation. */
export function CopyValue({
  value,
  label,
  copiedLabel,
  className,
}: {
  value: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
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
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          // The visible reference remains available for manual copying.
        }
      }}
      className={cn(accountAction.onNavy, "min-h-11 gap-2", className)}
    >
      {copied ? (
        <Check aria-hidden className="size-4" strokeWidth={2.5} />
      ) : (
        <Copy aria-hidden className="size-4" />
      )}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
