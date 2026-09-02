import { getFormatter, getTranslations } from "next-intl/server";

import { Meta } from "@/components/account/system";
import type { Cycle, Entry, GroupResult } from "@/lib/api/types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * What has happened to this entry, and when.
 *
 * **Only the steps that apply, and each one dated from the record rather than
 * inferred.** An entry that was never submitted has no submission row; one
 * that was not shortlisted gets that row rather than a greyed-out "Shortlisted"
 * it never reached. A step with no date is shown as still to come rather than
 * hidden, because "not yet" is the answer to a question the participant is
 * actually asking.
 *
 * Voting and Result are cycle-level facts, so they are dated from the cycle -
 * an entry does not carry its own voting window.
 */
export async function EntryTimeline({
  entry,
  cycle,
  results,
  locale,
}: {
  entry: Entry;
  cycle: Cycle | null;
  results: GroupResult[];
  locale: Locale;
}) {
  const [t, format] = await Promise.all([getTranslations("entry"), getFormatter()]);
  void locale;

  const at = (value?: string | null) =>
    value ? format.dateTime(new Date(value), { dateStyle: "medium" }) : null;

  const steps: { key: string; date: string | null; done: boolean }[] = [
    { key: "created", date: at(entry.createdAt), done: true },
  ];

  if (entry.checkoutCompletedAt || entry.state !== "draft") {
    steps.push({
      key: "checkout",
      date: at(entry.checkoutCompletedAt),
      done: Boolean(entry.checkoutCompletedAt),
    });
  }

  if (entry.state !== "draft") {
    steps.push({ key: "submitted", date: at(entry.submittedAt), done: Boolean(entry.submittedAt) });
  }

  if (entry.verification) {
    steps.push({
      key: "verified",
      date: at(entry.verification.verifiedAt),
      done: Boolean(entry.verification.verifiedAt),
    });
  }

  if (entry.juryFinalScore !== null || ["shortlisted", "not_shortlisted"].includes(entry.state)) {
    steps.push({ key: "scored", date: null, done: entry.juryFinalScore !== null });
  }

  if (entry.state === "shortlisted") {
    steps.push({ key: "shortlisted", date: null, done: true });
  } else if (entry.state === "not_shortlisted") {
    steps.push({ key: "not_shortlisted", date: null, done: true });
  }

  if (entry.state === "shortlisted" && cycle) {
    steps.push({
      key: "voting",
      date: at(cycle.votingWindow.end),
      done: Date.parse(cycle.votingWindow.end) < Date.now(),
    });
  }

  if (results.length && cycle) {
    steps.push({ key: "result", date: at(cycle.resultsAnnouncementAt), done: true });
  }

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.key} className="flex gap-4">
          {/* The rail: a filled pixel for what has happened, hollow for what
              has not, and a hairline joining them. */}
          <span aria-hidden className="flex w-2.5 shrink-0 flex-col items-center">
            <span
              className={cn(
                "mt-2 size-2.5 shrink-0",
                step.done ? "bg-blue-700" : "border border-navy-900/35 bg-white",
              )}
            />
            {i < steps.length - 1 ? <span className="w-px flex-1 bg-navy-900/15" /> : null}
          </span>
          <div className={cn("flex min-w-0 flex-1 flex-col gap-1", i < steps.length - 1 && "pb-7")}>
            <span
              className={cn(
                "text-body-md",
                step.done ? "font-medium text-navy-900" : "text-navy-600",
              )}
            >
              {t(`tl.${step.key}`)}
            </span>
            <Meta>{step.date ?? (step.done ? "" : t("tlPending"))}</Meta>
          </div>
        </li>
      ))}
    </ol>
  );
}
