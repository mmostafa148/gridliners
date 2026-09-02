import type { Entry } from "@/lib/api/types";

/**
 * The one action an entry offers, and whether it may be edited.
 *
 * **Truthful per state, and derived in one place.** The brief is explicit that
 * a locked, excluded, cancelled or disqualified entry must not show an edit
 * action, and the only way to guarantee that across My Entries, the dashboard
 * and Entry Detail is for all three to ask the same function.
 *
 * The settlement overrides the state's own action: an entry that is Submitted
 * but owes a tier difference is not waiting to be viewed, it is waiting to be
 * paid, and saying "View entry" would bury the only thing that matters.
 */
export type EntryActionKey =
  | "draft"
  | "pending_payment"
  | "submitted"
  | "verified"
  | "shortlisted"
  | "not_shortlisted"
  | "excluded"
  | "cancelled"
  | "disqualified"
  | "settlement"
  | "results";

export interface EntryAction {
  key: EntryActionKey;
  href: string;
  /** True where the action is the participant's next move rather than a look. */
  primary: boolean;
}

export function entryAction(entry: Entry, hasResults = false): EntryAction {
  const settlement = entry.verification?.settlement;
  const owes =
    settlement?.kind === "payment_link" &&
    settlement.status !== "settled" &&
    entry.state !== "excluded" &&
    entry.state !== "cancelled" &&
    entry.state !== "disqualified";

  if (entry.state === "draft") {
    return { key: "draft", href: `/entries/${entry.id}/edit`, primary: true };
  }
  if (owes) return { key: "settlement", href: `/entries/${entry.id}`, primary: true };
  if (entry.state === "pending_payment") {
    return { key: "pending_payment", href: `/entries/${entry.id}`, primary: true };
  }
  if (hasResults) return { key: "results", href: `/entries/${entry.id}`, primary: false };

  return { key: entry.state, href: `/entries/${entry.id}`, primary: false };
}

/**
 * Editing is a draft-only right.
 *
 * Stated as its own function rather than inlined, because the wizard's edit
 * route asks the same question the list does and the two must not drift: once
 * an entry is paid for it is a record, and the record is what was judged.
 */
export function canEdit(entry: Entry): boolean {
  return entry.state === "draft";
}
