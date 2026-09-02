import "server-only";

import { notFound, redirect } from "next/navigation";

import { api } from "@/lib/api";
import type { Entry, Participant, SessionUser } from "@/lib/api/types";
import { getSession } from "@/lib/auth/session";
import { getLocale } from "next-intl/server";

/**
 * The authorization boundary for every participant screen.
 *
 * **Read on the server, before anything renders.** A guard that runs in a
 * client effect renders the protected page first and hides it afterwards,
 * which is a flash of exactly the data the guard exists to protect.
 */

export interface ParticipantSession {
  user: SessionUser;
  participant: Participant;
}

/**
 * The signed-in participant, or a redirect to sign in.
 *
 * `returnTo` carries the path being asked for, so signing in lands where the
 * reader was going rather than dropping them on the dashboard.
 */
export async function requireParticipant(returnTo?: string): Promise<ParticipantSession> {
  const locale = await getLocale();
  const user = await getSession();

  if (!user || user.role !== "participant" || !user.participantId) {
    const target = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    // Locale-prefixed by hand: `redirect` from next/navigation does not know
    // about the routing config, and an unprefixed path would bounce through
    // the middleware and lose the query.
    redirect(`/${locale}/login${target}`);
  }

  const participant = await api.participants.getById(user.participantId);
  // An account whose participant record has gone is not a half-usable session;
  // it is a broken one, and every read below it would return nothing.
  if (!participant) redirect(`/${locale}/login`);

  return { user, participant };
}

/**
 * One entry, if it belongs to the signed-in participant.
 *
 * **Anything else is a 404, not a 403.** A "not yours" page confirms that the
 * id exists, which is how somebody enumerates a competitor's entries by
 * changing a number in the URL. Absent and forbidden look identical from
 * outside, which is the only way the id itself stays private.
 */
export async function requireOwnEntry(id: string, participantId: string): Promise<Entry> {
  const entry = await api.entries.getById(id);
  if (!entry || entry.participantId !== participantId) notFound();
  return entry;
}

/** Editing is a draft-only right; everything else is a record. */
export function isEditable(entry: Entry): boolean {
  return entry.state === "draft";
}
