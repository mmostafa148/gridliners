"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

import { api } from "@/lib/api";
import type { ContentLanguage, PaymentMethod, Tier } from "@/lib/api/types";
import { requireParticipant } from "@/lib/auth/guard";
import type { WizardDraft } from "@/lib/account/wizard";

/**
 * The wizard's writes.
 *
 * **The draft entry is the storage.** Saving writes the real `Entry` through
 * the real service, so resuming is just reading it back — there is no parallel
 * draft store to reconcile, and a draft that exists is visible in My Entries
 * the moment it is created, which is what the participant expects.
 *
 * Every action re-reads the session. The entry id comes from the client and is
 * checked against the caller on the way in.
 */

function proofFor(draft: WizardDraft, tier: Tier, cycleYear: number) {
  return {
    tier,
    ...(draft.proof.studentId ? { studentId: draft.proof.studentId } : {}),
    ...(draft.proof.university ? { university: draft.proof.university } : {}),
    ...(draft.proof.portfolioUrl ? { portfolioUrl: draft.proof.portfolioUrl } : {}),
    ...(draft.proof.freelanceLicence ? { freelanceLicence: draft.proof.freelanceLicence } : {}),
    ...(draft.proof.companyName ? { companyName: draft.proof.companyName } : {}),
    ...(draft.proof.tradeLicence ? { tradeLicence: draft.proof.tradeLicence } : {}),
    // Six months past the cycle, which is what the field's own note specifies.
    retentionUntil: `${cycleYear + 1}-08-31T23:59:59Z`,
  };
}

/** Media the mock can hold. Names only: no file leaves the browser. */
function mediaFor(draft: WizardDraft) {
  return {
    coverUrl: draft.media.coverName ? `/placeholders/draft-cover.jpg` : "",
    galleryUrls: draft.media.gallery.map((_, i) => `/placeholders/draft-${i + 1}.jpg`),
    documentUrls: draft.media.documents.map((_, i) => `/placeholders/draft-doc-${i + 1}.pdf`),
    ...(draft.media.videoUrl ? { videoUrl: draft.media.videoUrl } : {}),
  };
}

export async function saveDraftAction(
  entryId: string | null,
  draft: WizardDraft,
): Promise<{ ok: true; entryId: string } | { ok: false; reason: string }> {
  const { participant } = await requireParticipant();
  const cycles = await api.cycles.list();
  const cycle = cycles.find((c) => c.status === "active");
  if (!cycle) return { ok: false, reason: "no_open_cycle" };

  const tier = (draft.tier || "students") as Tier;
  const credits = draft.credits
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (entryId) {
    const existing = await api.entries.getById(entryId);
    // Ownership and state, both checked server-side. A submitted entry is a
    // record; the same URL must refuse to mutate it.
    if (existing && existing.participantId !== participant.id) {
      return { ok: false, reason: "not_found" };
    }
    if (existing) {
      if (existing.state !== "draft") return { ok: false, reason: "notDraft" };

      await api.entries.update(entryId, {
        title: draft.title,
        description: draft.description,
        contentLanguage: draft.contentLanguage as ContentLanguage,
        country: draft.country,
        credits,
        ...(draft.client ? { client: draft.client } : {}),
        ...(draft.externalUrl ? { externalUrl: draft.externalUrl } : {}),
        declaredTier: tier,
        baseSubCategoryId: draft.baseSubCategoryId,
        additionalSubCategoryIds: draft.additionalSubCategoryIds,
        eligibilityProof: proofFor(draft, tier, cycle.year),
        media: mediaFor(draft),
      });
      return { ok: true, entryId };
    }

    // The demo store is memory-backed. A serverless instance may receive the
    // next step without the draft created by the previous instance, so a
    // missing own draft is recreated from the client-held wizard data below.
  }

  /**
   * Caught and reported, not thrown.
   *
   * A save that fails silently is worse than one that fails loudly: the wizard
   * showed "Draft saved" over a write that never happened, because the throw
   * was swallowed inside the transition and the screen had nothing to say
   * about it. The reason now comes back and the step shows it.
   */
  try {
    const created = await api.entries.create({
      cycleId: cycle.id,
      participantId: participant.id,
      title: draft.title || "Untitled entry",
      description: draft.description,
      contentLanguage: draft.contentLanguage as ContentLanguage,
      country: draft.country || participant.country || "AE",
      declaredTier: tier,
      baseSubCategoryId: draft.baseSubCategoryId,
      additionalSubCategoryIds: draft.additionalSubCategoryIds,
    });

    // `create` takes the fields it takes; the rest are written straight after
    // so a resumed draft is complete rather than half of what was typed.
    await api.entries.update(created.id, {
      credits,
      ...(draft.client ? { client: draft.client } : {}),
      ...(draft.externalUrl ? { externalUrl: draft.externalUrl } : {}),
      eligibilityProof: proofFor(draft, tier, cycle.year),
      media: mediaFor(draft),
    });

    return { ok: true, entryId: created.id };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "save_failed" };
  }
}

/**
 * Checkout.
 *
 * **The quote is re-taken on the server and frozen there.** A total posted from
 * the browser is a number the browser chose; the snapshot that ends up on the
 * payment is the one this action asked the pricing service for.
 */
export async function checkoutAction(
  entryId: string | null,
  draft: WizardDraft,
  method: PaymentMethod,
  promoCode: string | null,
  creditCode: string | null,
): Promise<{ ok: false; reason: string } | never> {
  const { participant } = await requireParticipant();
  const existing = entryId ? await api.entries.getById(entryId) : null;
  if (existing && existing.participantId !== participant.id) {
    return { ok: false, reason: "not_found" };
  }

  // Idempotence: an entry that has already left draft has been paid for. A
  // second POST — a double click, a resubmitted form — must not charge again.
  if (existing && existing.state !== "draft") {
    const locale = await getLocale();
    redirect(`/${locale}/entries/${existing.id}/checkout`);
  }

  // Persist once more in the same request that checks out. Besides ensuring
  // the latest fields are used, this recreates a memory-backed demo draft when
  // Vercel routes the request to a fresh serverless instance.
  const saved = await saveDraftAction(existing?.id ?? null, draft);
  if (!saved.ok) return saved;
  const entry = await api.entries.getById(saved.entryId);
  if (!entry || entry.participantId !== participant.id) {
    return { ok: false, reason: "not_found" };
  }

  const snapshot = await api.pricing.quote({
    cycleId: entry.cycleId,
    participantId: participant.id,
    tier: entry.declaredTier,
    baseSubCategoryId: entry.baseSubCategoryId,
    additionalSubCategoryIds: entry.additionalSubCategoryIds,
    promoCode: promoCode ?? undefined,
    creditCode: creditCode ?? undefined,
  });

  await api.entries.submit(entry.id, method, snapshot);
  const locale = await getLocale();
  redirect(`/${locale}/entries/${entry.id}/checkout`);
}
