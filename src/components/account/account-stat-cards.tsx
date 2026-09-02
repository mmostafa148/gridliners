import {
  Award,
  BadgePercent,
  Coins,
  Layers,
  ReceiptText,
  Star,
  Wallet,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The account's standing, as cards.
 *
 * **Four, on one row.** An earlier pass put three standing figures above seven
 * entry-state cards, which was ten cards over two rows and no hierarchy at all.
 * What survives is the four facts a participant opens this page for: how much
 * work is on the account, how much of it is live in public voting, how much has
 * been recognised, and what the next entry will cost less. The full state
 * breakdown is still on the page, further down, where it belongs as a
 * breakdown rather than as a headline.
 *
 * **These were three number/label pairs floating in the account bar**, squeezed
 * between the participant's job title and the New entry button, where they had
 * no room and no rank. A figure is the thing on this page a participant is
 * most likely to be looking for; it gets a surface of its own.
 *
 * The icon sits in a tinted square on the end edge and the figure leads, which
 * is the order these are read in. Colour is never the only signal: every card
 * names what its number counts.
 */
const ICON = {
  entries: Layers,
  shortlisted: Star,
  awards: Award,
  discount: BadgePercent,
  // Billing's three. The same component, because the account should have one
  // way of showing a figure, not one per page.
  paid: Wallet,
  payments: ReceiptText,
  credits: Coins,
} as const;

const TONE = {
  entries: { chip: "bg-navy-900/6 text-navy-700", value: "text-navy-900" },
  shortlisted: { chip: "bg-finalist/12 text-finalist", value: "text-navy-900" },
  awards: { chip: "bg-gold/18 text-gold-deep", value: "text-gold-deep" },
  discount: { chip: "bg-blue-700/8 text-blue-700", value: "text-navy-900" },
  paid: { chip: "bg-navy-900/6 text-navy-700", value: "text-navy-900" },
  payments: { chip: "bg-navy-900/6 text-navy-700", value: "text-navy-900" },
  credits: { chip: "bg-blue-700/8 text-blue-700", value: "text-blue-700" },
} as const;

export type StatKey = keyof typeof ICON;

export function AccountStatCards({
  stats,
  className,
}: {
  stats: { key: StatKey; label: string; value: string; hint?: string; href?: string }[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        // The column count follows the number of cards, so three fill the row
        // as evenly as four do.
        "grid gap-4 sm:grid-cols-2",
        stats.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat) => {
        const Icon = ICON[stat.key];
        const tone = TONE[stat.key];
        return (
          <li key={stat.key}>
            <CardBody stat={stat} tone={tone} Icon={Icon} />
          </li>
        );
      })}
    </ul>
  );
}

function CardBody({
  stat,
  tone,
  Icon,
}: {
  stat: { key: StatKey; label: string; value: string; hint?: string; href?: string };
  tone: { chip: string; value: string };
  Icon: typeof Layers;
}) {
  const body = (
    <>
      <div className="min-w-0">
        <p className={cn("font-data text-data-lg leading-none tabular-nums", tone.value)}>
          {stat.value}
        </p>
        <p className="mt-2.5 text-body-sm font-medium text-navy-800">{stat.label}</p>
        {stat.hint ? <p className="mt-0.5 text-caption text-navy-600">{stat.hint}</p> : null}
      </div>
      <span aria-hidden className={cn("grid size-10 shrink-0 place-items-center", tone.chip)}>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
    </>
  );

  const shell = "flex h-full items-start justify-between gap-4 border border-navy-900/10 bg-white p-5";

  if (!stat.href) return <div className={shell}>{body}</div>;
  return (
    <Link
      href={stat.href}
      className={cn(
        shell,
        "transition-colors hover:border-navy-900/30 hover:bg-mist/50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
      )}
    >
      {body}
    </Link>
  );
}
