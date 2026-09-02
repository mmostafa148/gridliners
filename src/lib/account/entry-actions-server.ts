"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { api } from "@/lib/api";
import { requireParticipant } from "@/lib/auth/guard";

/**
 * The mutations Entry Detail offers.
 *
 * **Every one re-reads the session and re-checks ownership.** The id arrives
 * from a form field, which is to say from the client, so it is never trusted:
 * the service checks the entry belongs to the caller and throws `NOT_FOUND`
 * otherwise, and the action asks the guard who the caller is rather than being
 * told.
 */

export async function settleUpgradeAction(formData: FormData): Promise<void> {
  const { participant } = await requireParticipant();
  const id = String(formData.get("entryId") ?? "");
  await api.entries.settleUpgrade(id, participant.id);
  const locale = await getLocale();
  revalidatePath(`/${locale}/entries/${id}`);
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/entries/${id}`);
}

export async function discardDraftAction(formData: FormData): Promise<void> {
  const { participant } = await requireParticipant();
  const id = String(formData.get("entryId") ?? "");
  await api.entries.discardDraft(id, participant.id);
  const locale = await getLocale();
  revalidatePath(`/${locale}/entries`);
  redirect(`/${locale}/entries`);
}
