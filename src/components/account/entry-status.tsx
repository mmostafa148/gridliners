import { getTranslations } from "next-intl/server";

import type { EntryState } from "@/lib/api/types";
import { StatusChip } from "@/components/account/system";
import { cn } from "@/lib/utils";

/**
 * An entry's state, readable and semantic.
 *
 * **Not a tiny outlined pill.** Ten identical 11px capsules told a reader
 * nothing about which of them mattered; the states genuinely differ in weight
 * and the treatment says so:
 *
 * - **Waiting on the participant** — pending payment — carries the campaign
 *   yellow as a filled marker, because it is the one state with a clock.
 * - **In progress** — draft, submitted, verified — is a marker and a word.
 * - **Good news** — shortlisted — takes the finalist blue.
 * - **Closed** — not shortlisted, cancelled — is quiet.
 * - **Adverse** — excluded, disqualified — is stated in the error red, because
 *   softening it would be dishonest.
 *
 * The marker is the identity's own square. Colour is never the only signal:
 * every state also carries its name.
 */
/** Which of the six chip tones each state belongs to. */
const CHIP: Record<
  EntryState | "winner",
  "neutral" | "waiting" | "progress" | "good" | "closed" | "adverse"
> = {
  draft: "neutral",
  pending_payment: "waiting",
  submitted: "progress",
  verified: "progress",
  shortlisted: "good",
  not_shortlisted: "closed",
  excluded: "adverse",
  cancelled: "closed",
  disqualified: "adverse",
  winner: "good",
};

const TONE: Record<EntryState | "winner", { dot: string; text: string }> = {
  draft: { dot: "bg-navy-400", text: "text-navy-700" },
  pending_payment: { dot: "bg-campaign-yellow", text: "text-navy-900" },
  submitted: { dot: "bg-blue-400", text: "text-navy-800" },
  verified: { dot: "bg-blue-700", text: "text-navy-900" },
  shortlisted: { dot: "bg-finalist", text: "text-blue-800" },
  not_shortlisted: { dot: "bg-navy-300", text: "text-navy-600" },
  excluded: { dot: "bg-campaign-orange", text: "text-destructive-ink" },
  cancelled: { dot: "bg-navy-300", text: "text-navy-600" },
  disqualified: { dot: "bg-destructive", text: "text-destructive-ink" },
  winner: { dot: "bg-gold", text: "text-navy-900" },
};

export async function EntryStatus({
  state,
  size = "md",
  onNavy,
  markOnly,
  chip,
  className,
}: {
  state: EntryState | "winner";
  size?: "md" | "lg";
  /** On the navy opening, where the ink inverts but the marker does not. */
  onNavy?: boolean;
  /**
   * The marker alone, for places that already name the state beside it — a
   * filter menu's own label, for instance. Never used where the marker would
   * be the only signal.
   */
  markOnly?: boolean;
  /** A tinted chip, for a table column that is scanned rather than read. */
  chip?: boolean;
  className?: string;
}) {
  const t = await getTranslations("entryState");
  const tone = TONE[state];

  if (chip) return <StatusChip label={t(state)} tone={CHIP[state]} className={className} />;

  if (markOnly) {
    return (
      <span
        aria-hidden
        className={cn("size-2 shrink-0", tone.dot, className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn("shrink-0", tone.dot, size === "lg" ? "size-2.5" : "size-2")}
      />
      <span
        className={cn(
          "font-medium leading-none",
          onNavy ? "text-cream-50" : tone.text,
          size === "lg" ? "text-body-md" : "text-body-sm",
        )}
      >
        {t(state)}
      </span>
    </span>
  );
}
