import { ENTRY_STATES } from "../api/types";
import type { EntryState } from "../api/types";

import { cycles } from "./cycles";
import { entries } from "./entries";
import { auditLog, disqualifications } from "./governance";
import { jurors, scores } from "./jury";
import { notificationTemplates } from "./notifications";
import { participants } from "./participants";
import { payments } from "./payments";
import { credits, pricingConfigs } from "./pricing";
import { groupResults, honoraryDesignations } from "./results";
import { criteria, honoraryOptions, parentCategories, subCategories } from "./taxonomy";
import { votes } from "./votes";

/**
 * Fixture coverage and invariants.
 *
 * The screen map requires fixtures covering every entry state, group-scoped
 * results including multi-medal and thin-group cases, and bilingual templates.
 * Rather than asserting that in prose, this module checks it — and the kitchen
 * sink renders the result, so fixture drift shows up as a failed check instead
 * of a silently missing state.
 */

export interface CoverageCheck {
  label: string;
  detail: string;
  ok: boolean;
}

export interface CoverageSection {
  title: string;
  count: number;
  checks: CoverageCheck[];
}

function check(label: string, ok: boolean, detail: string): CoverageCheck {
  return { label, ok, detail };
}

export function buildCoverage(): CoverageSection[] {
  const subById = new Map(subCategories.map((s) => [s.id, s]));
  const entryById = new Map(entries.map((e) => [e.id, e]));
  const participantIds = new Set(participants.map((p) => p.id));

  // --- Entry states -------------------------------------------------------
  const presentStates = new Set(entries.map((e) => e.state));
  const missingStates = ENTRY_STATES.filter((s) => !presentStates.has(s));

  // --- Taxonomy -----------------------------------------------------------
  const weightsByParent = new Map<string, number>();
  for (const c of criteria) {
    weightsByParent.set(c.parentCategoryId, (weightsByParent.get(c.parentCategoryId) ?? 0) + c.weight);
  }
  const badWeights = [...weightsByParent.entries()].filter(([, total]) => total !== 100);
  const parentsWithoutCriteria = parentCategories.filter((p) => !weightsByParent.has(p.id));
  const duplicateLabels = subCategories.filter(
    (sub, _, all) => all.filter((other) => other.name.en === sub.name.en).length > 1,
  );

  // --- Entry integrity ----------------------------------------------------
  const badSubRefs = entries.filter(
    (e) =>
      !subById.has(e.baseSubCategoryId) ||
      e.additionalSubCategoryIds.some((id) => !subById.has(id)),
  );
  const crossParentAdditions = entries.filter((e) => {
    const base = subById.get(e.baseSubCategoryId);
    return (
      base &&
      e.additionalSubCategoryIds.some((id) => subById.get(id)?.parentId !== base.parentId)
    );
  });
  const orphanEntries = entries.filter((e) => !participantIds.has(e.participantId));
  const multiSubEntries = entries.filter((e) => e.additionalSubCategoryIds.length > 0);
  const settlementEntries = entries.filter((e) => e.verification?.settlement);
  const upgradeSettlements = settlementEntries.filter(
    (e) => e.verification?.settlement?.kind === "payment_link",
  );
  const creditSettlements = settlementEntries.filter(
    (e) => e.verification?.settlement?.kind === "credit",
  );
  const arabicEntries = entries.filter((e) => e.contentLanguage === "ar");
  const movedEntries = entries.filter((e) => e.categoryMove);

  // --- Results ------------------------------------------------------------
  const finalized = groupResults.filter((r) => r.finalized);
  const medalsByEntry = new Map<string, number>();
  for (const r of finalized) {
    if (r.withheld || r.level === "did_not_place") continue;
    medalsByEntry.set(r.entryId, (medalsByEntry.get(r.entryId) ?? 0) + 1);
  }
  const multiMedal = [...medalsByEntry.entries()].filter(([, count]) => count > 1);

  const groupSizes = new Map<string, number>();
  for (const r of finalized) {
    const key = `${r.cycleId}|${r.subCategoryId}|${r.tier}`;
    groupSizes.set(key, (groupSizes.get(key) ?? 0) + 1);
  }
  const thinGroups = [...groupSizes.entries()].filter(([, size]) => size < 3);
  const withheld = groupResults.filter((r) => r.withheld);
  const withTiebreak = groupResults.filter((r) => r.tiebreakTrace?.length);
  const didNotPlace = finalized.filter((r) => r.level === "did_not_place" && !r.withheld);
  const badResultRefs = groupResults.filter(
    (r) => !entryById.has(r.entryId) || !subById.has(r.subCategoryId),
  );
  const tierMismatches = groupResults.filter((r) => {
    const entry = entryById.get(r.entryId);
    if (!entry) return false;
    const tier = entry.verification?.verifiedTier ?? entry.declaredTier;
    return tier !== r.tier;
  });
  const proposedOnly = groupResults.filter((r) => !r.finalized);

  // --- Jury ---------------------------------------------------------------
  const adminEntered = scores.filter((s) => s.enteredByAdmin);
  const jurorsWithScores = new Set(scores.map((s) => s.jurorId));
  const partialCoverage = jurors.some((j) => !jurorsWithScores.has(j.id));

  // --- Votes --------------------------------------------------------------
  const voided = votes.filter((v) => v.voided);
  const unverified = votes.filter((v) => !v.otpVerifiedAt);

  // --- Payments -----------------------------------------------------------
  const mismatchedTotals = payments.filter(
    (p) => p.snapshot && Math.abs(p.snapshot.totalUsd - p.amountUsd) > 0.001,
  );
  const supplements = payments.filter((p) => p.kind === "tier_supplement");
  const snapshotted = payments.filter((p) => p.snapshot);

  // --- Notifications ------------------------------------------------------
  const missingArabic = notificationTemplates.filter(
    (t) => !t.subject.ar.trim() || !t.body.ar.trim(),
  );
  const missingEnglish = notificationTemplates.filter(
    (t) => !t.subject.en.trim() || !t.body.en.trim(),
  );
  const byAudience = notificationTemplates.reduce<Record<string, number>>((acc, t) => {
    acc[t.audience] = (acc[t.audience] ?? 0) + 1;
    return acc;
  }, {});

  return [
    {
      title: "Cycles",
      count: cycles.length,
      checks: [
        check("1 active + 2 archived", cycles.filter((c) => c.status === "active").length === 1 && cycles.filter((c) => c.status === "archived").length === 2, `${cycles.filter((c) => c.status === "active").length} active, ${cycles.filter((c) => c.status === "archived").length} archived`),
        check("Pricing config for the active cycle", pricingConfigs.some((p) => p.cycleId === "cycle-2026"), `${pricingConfigs.length} config(s)`),
      ],
    },
    {
      title: "Taxonomy & criteria",
      count: subCategories.length,
      checks: [
        check("7 parent categories", parentCategories.length === 7, `${parentCategories.length} parents`),
        check("23 sub-categories (Appendix A)", subCategories.length === 23, `${subCategories.length} sub-categories`),
        check("Every parent has criteria", parentsWithoutCriteria.length === 0, parentsWithoutCriteria.map((p) => p.id).join(", ") || "all covered"),
        check("Weights sum to 100 per parent", badWeights.length === 0, badWeights.map(([id, total]) => `${id}=${total}`).join(", ") || "all 100"),
        check("Duplicate labels are parent-namespaced", duplicateLabels.every((s) => s.id.startsWith(s.parentId)), duplicateLabels.map((s) => s.id).join(", ") || "none"),
        check("7 honorary designations (not enterable)", honoraryOptions.length === 7, `${honoraryOptions.length} options`),
      ],
    },
    {
      title: "Entries",
      count: entries.length,
      checks: [
        check("Every entry state present", missingStates.length === 0, missingStates.length ? `missing: ${missingStates.join(", ")}` : ENTRY_STATES.map((s: EntryState) => `${s}=${entries.filter((e) => e.state === s).length}`).join(", ")),
        check("Sub-category references resolve", badSubRefs.length === 0, badSubRefs.map((e) => e.id).join(", ") || "all resolve"),
        check("Additional sub-categories share the base parent", crossParentAdditions.length === 0, crossParentAdditions.map((e) => e.id).join(", ") || "all same-parent"),
        check("Participant references resolve", orphanEntries.length === 0, orphanEntries.map((e) => e.id).join(", ") || "all resolve"),
        check("Multi-sub-category entries", multiSubEntries.length > 0, multiSubEntries.map((e) => e.id).join(", ")),
        check("Tier upgrade settlement (payment link)", upgradeSettlements.length > 0, upgradeSettlements.map((e) => e.id).join(", ")),
        check("Tier downgrade settlement (credit)", creditSettlements.length > 0 && credits.length > 0, `${creditSettlements.map((e) => e.id).join(", ")} · ${credits.length} credit(s)`),
        check("Re-categorized entry", movedEntries.length > 0, movedEntries.map((e) => e.id).join(", ")),
        check("Arabic-authored entries", arabicEntries.length > 0, arabicEntries.map((e) => e.id).join(", ")),
      ],
    },
    {
      title: "Group results",
      count: groupResults.length,
      checks: [
        check("Entry and sub-category references resolve", badResultRefs.length === 0, badResultRefs.map((r) => r.id).join(", ") || "all resolve"),
        check("Result tier matches the entry's effective tier", tierMismatches.length === 0, tierMismatches.map((r) => r.id).join(", ") || "all match"),
        check("Multi-medal entry (one pool, several groups)", multiMedal.length > 0, multiMedal.map(([id, n]) => `${id}=${n} medals`).join(", ")),
        check("Thin group (fewer than three Cadets)", thinGroups.length > 0, thinGroups.map(([key, size]) => `${key.split("|").slice(1).join(" × ")}=${size}`).join(", ")),
        check("Withheld medal", withheld.length > 0, withheld.map((r) => r.id).join(", ")),
        check("Tiebreak trace recorded", withTiebreak.length > 0, withTiebreak.map((r) => r.id).join(", ")),
        check("Did-not-place result", didNotPlace.length > 0, didNotPlace.map((r) => r.id).join(", ")),
        check("Proposed (not yet finalized) results", proposedOnly.length > 0, `${proposedOnly.length} pending Admin review`),
        check("Honorary designations", honoraryDesignations.length > 0, honoraryDesignations.map((h) => h.type).join(", ")),
      ],
    },
    {
      title: "Jury & scoring",
      count: scores.length,
      checks: [
        check("Jury cohort seeded", jurors.length >= 5, `${jurors.length} jurors`),
        check("Partial scoring (gaps remain)", partialCoverage, `${jurorsWithScores.size} of ${jurors.length} jurors have scored`),
        check("Admin-entered score with provenance", adminEntered.length > 0, adminEntered.map((s) => s.id).join(", ")),
      ],
    },
    {
      title: "Votes",
      count: votes.length,
      checks: [
        check("Voided votes (silent by design)", voided.length > 0, voided.map((v) => v.id).join(", ")),
        check("Requested but never verified", unverified.length > 0, unverified.map((v) => v.id).join(", ")),
      ],
    },
    {
      title: "Payments & pricing",
      count: payments.length,
      checks: [
        check("Every payment amount matches its snapshot", mismatchedTotals.length === 0, mismatchedTotals.map((p) => p.id).join(", ") || "all match"),
        check("Pricing snapshots stored", snapshotted.length > 0, `${snapshotted.length} of ${payments.length} payments`),
        check("Tier supplement payments", supplements.length > 0, supplements.map((p) => p.id).join(", ")),
      ],
    },
    {
      title: "Notifications",
      count: notificationTemplates.length,
      checks: [
        check("27 templates (17 carried + 10 new)", notificationTemplates.length === 27, `${notificationTemplates.length} templates`),
        check("Every template has English copy", missingEnglish.length === 0, missingEnglish.map((t) => t.id).join(", ") || "all present"),
        check("Every template has Arabic copy", missingArabic.length === 0, missingArabic.map((t) => t.id).join(", ") || "all present"),
        check("All four audiences covered", Object.keys(byAudience).length === 4, Object.entries(byAudience).map(([k, v]) => `${k}=${v}`).join(", ")),
      ],
    },
    {
      title: "Governance",
      count: auditLog.length,
      checks: [
        check("Disqualification record", disqualifications.length > 0, disqualifications.map((d) => d.id).join(", ")),
        check("Audit log covers the required actions", new Set(auditLog.map((a) => a.action)).size >= 8, `${new Set(auditLog.map((a) => a.action)).size} distinct actions`),
      ],
    },
  ];
}

export function coverageSummary(sections: CoverageSection[]) {
  const checks = sections.flatMap((s) => s.checks);
  return {
    total: checks.length,
    passed: checks.filter((c) => c.ok).length,
    failed: checks.filter((c) => !c.ok),
  };
}
