import { api } from "@/lib/api";
import type { Entry, GroupResult, Payment } from "@/lib/api/types";
import { effectiveTier } from "@/lib/api/types";

/**
 * What each entry is waiting for, and what the participant can do about it.
 *
 * **This is the module's one idea.** A participant dashboard that reports
 * counts by state tells somebody they have four Submitted entries and leaves
 * them to work out whether that is good news. Every screen here asks the other
 * question instead - *what is this waiting for* - and this file is the single
 * place that answers it, so My Entries, the dashboard queue and Entry Detail
 * cannot disagree.
 *
 * The order below is the order of urgency, and it is deliberate: money that
 * expires beats money that has a deadline, which beats work that is unfinished,
 * which beats good news.
 */

export type ActionKind =
  | "cash_expiring"
  | "settlement_due"
  | "resume_draft"
  | "share_shortlisted"
  | "review_results";

export interface NextAction {
  kind: ActionKind;
  entryId: string;
  entryTitle: string;
  /** Where the action is taken. Always a real route in this build. */
  href: string;
  /** Set where the action has a clock: an expiry or a settlement deadline. */
  deadline?: string;
  /** Set where the action carries a figure: what is owed. */
  amountUsd?: number;
  /** Set where one row stands for several entries. */
  count?: number;
}

const URGENCY: ActionKind[] = [
  "cash_expiring",
  "settlement_due",
  "resume_draft",
  "share_shortlisted",
  "review_results",
];

/**
 * Every open action for one participant, most urgent first.
 *
 * Scoped by `participantId` at the service call, not filtered afterwards: a
 * read that fetches everything and narrows it in the page is one refactor away
 * from leaking somebody else's entry.
 */
export async function nextActions(participantId: string): Promise<NextAction[]> {
  const [entries, payments] = await Promise.all([
    api.entries.list({ participantId }),
    api.payments.forParticipant(participantId),
  ]);

  const paymentsByEntry = new Map<string, Payment[]>();
  for (const payment of payments) {
    const list = paymentsByEntry.get(payment.entryId) ?? [];
    list.push(payment);
    paymentsByEntry.set(payment.entryId, list);
  }

  const out: NextAction[] = [];
  const shortlisted: Entry[] = [];

  for (const entry of entries) {
    const base = { entryId: entry.id, entryTitle: entry.title };

    if (entry.state === "draft") {
      out.push({ ...base, kind: "resume_draft", href: `/entries/${entry.id}/edit` });
      continue;
    }

    if (entry.state === "pending_payment") {
      const cash = (paymentsByEntry.get(entry.id) ?? []).find(
        (p) => p.method === "cash" && p.status === "pending",
      );
      if (cash) {
        out.push({
          ...base,
          kind: "cash_expiring",
          href: `/entries/${entry.id}`,
          deadline: cash.expiresAt,
          amountUsd: cash.amountUsd,
        });
      }
      continue;
    }

    // A settlement is owed on any entry still in play. An excluded entry's
    // unresolved settlement is history - the deadline has passed and the
    // outcome is recorded - so it is not offered as something to do.
    const settlement = entry.verification?.settlement;
    if (
      settlement &&
      settlement.kind === "payment_link" &&
      settlement.status !== "settled" &&
      entry.state !== "excluded" &&
      entry.state !== "cancelled" &&
      entry.state !== "disqualified"
    ) {
      out.push({
        ...base,
        kind: "settlement_due",
        href: `/entries/${entry.id}`,
        deadline: settlement.deadline,
        amountUsd: settlement.amountUsd,
      });
      continue;
    }

    if (entry.state === "shortlisted") shortlisted.push(entry);
  }

  /**
   * Shortlisted projects collapse to one row.
   *
   * Measured, not guessed: Qamar Studio holds nine, and nine identical
   * "share it" rows pushed the two rows that actually have a deadline off the
   * top of the queue. A queue whose most urgent item is buried under good news
   * is not a queue. One row, and it goes to the filtered list.
   */
  if (shortlisted.length) {
    out.push({
      kind: "share_shortlisted",
      entryId: shortlisted[0].id,
      entryTitle: shortlisted[0].title,
      href:
        shortlisted.length === 1
          ? `/entries/${shortlisted[0].id}`
          : "/entries?state=shortlisted",
      count: shortlisted.length,
    });
  }

  // Results are an account-level fact rather than a per-entry one: one visit
  // to My Awards reviews all of them, so a row per medal would be five rows
  // asking for the same click.
  const wins = await winningResults(participantId, entries);
  if (wins.length) {
    out.push({
      kind: "review_results",
      entryId: wins[0].entryId,
      entryTitle: entries.find((e) => e.id === wins[0].entryId)?.title ?? "",
      href: "/my-awards",
      count: wins.length,
    });
  }

  return out.sort((a, b) => URGENCY.indexOf(a.kind) - URGENCY.indexOf(b.kind));
}

/** How many actions are open. What the shell's badge counts. */
export async function countActions(participantId: string): Promise<number> {
  const actions = await nextActions(participantId);
  // Sharing and reviewing are good news, not a queue. A permanent badge on
  // "you have awards" is a notification nobody can clear.
  return actions.filter((a) => a.kind !== "share_shortlisted" && a.kind !== "review_results").length;
}

/**
 * Every published medal this participant holds.
 *
 * **The publication boundary is `results.published`**, the same door 1.7 and
 * 1.8 use. A proposed ranking is not a result and must not reach a participant
 * any earlier than it reaches the public.
 */
export async function winningResults(
  participantId: string,
  known?: Entry[],
): Promise<GroupResult[]> {
  const entries = known ?? (await api.entries.list({ participantId }));
  const mine = new Set(entries.map((e) => e.id));
  const cycles = await api.cycles.list();

  const rows: GroupResult[] = [];
  for (const cycle of cycles) {
    for (const result of await api.results.published(cycle.id)) {
      if (!mine.has(result.entryId)) continue;
      if (result.withheld || result.level === "did_not_place") continue;
      rows.push(result);
    }
  }
  return rows;
}

/** The tier an entry is judged in, for display beside what was declared. */
export function judgedTier(entry: Entry) {
  return effectiveTier(entry);
}
