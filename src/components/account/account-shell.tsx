import { getTranslations } from "next-intl/server";

import { AccountMasthead } from "@/components/account/account-masthead";
import type { Locale } from "@/i18n/routing";
import { api } from "@/lib/api";
import { countActions } from "@/lib/account/next-actions";
import { countryName } from "@/lib/display-names";

/**
 * The account's frame: identity, standing and destinations, at the scale the
 * route needs.
 *
 * Replaces `AccountPage`, which gave every route the same navy opening and the
 * same title slot whether it had anything to put in them or not. This supplies
 * the masthead and **nothing else** — the page owns its own composition below,
 * which is what "give each route its own composition" requires.
 *
 * **The masthead itself is identical on every route.** It is chrome: who is
 * signed in, where they can go, and the one action. Chrome that changes shape
 * between tabs is chrome somebody has to re-read.
 */
export async function AccountShell({
  participantId,
  locale,
  action,
  children,
}: {
  participantId: string;
  locale: Locale;
  /** The route's own action, beside New entry. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = await getTranslations("account");

  const [participant, mine, cycles, waiting] = await Promise.all([
    api.participants.getById(participantId),
    api.entries.list({ participantId }),
    api.cycles.list(),
    countActions(participantId),
  ]);

  const active = cycles.find((c) => c.status === "active");
  const openEntries = mine.filter(
    (e) => e.cycleId === active?.id && e.state !== "cancelled" && e.state !== "disqualified",
  ).length;

  return (
    // The module's ground is tinted, so the white panels above it have an edge.
    // A panel on white is a rectangle nobody can see.
    <div data-account className="bg-mist">
      <AccountMasthead
        identity={{
          name: participant?.name ?? "",
          role:
            [participant?.jobTitle, participant?.companyName].filter(Boolean).join(", ") || null,
          country: participant?.country ? countryName(participant.country, locale) : null,
          photoUrl: participant?.photoUrl ?? null,
        }}
        primary={{ href: "/entries/new", label: t("nav.newEntry") }}
        action={action}
        items={[
          { href: "/dashboard", label: t("nav.overview"), count: waiting, urgent: waiting > 0 },
          { href: "/entries", label: t("nav.entries"), count: openEntries },
          { href: "/my-awards", label: t("nav.awards") },
          { href: "/billing", label: t("nav.billing") },
          { href: "/my-votes", label: t("nav.votes") },
          { href: "/profile", label: t("nav.profile") },
        ]}
      />
      {children}
    </div>
  );
}
