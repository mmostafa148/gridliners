"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { EntryFilter } from "@/lib/api/services";
import type { Tier } from "@/lib/api/types";

import { queryKeys } from "./keys";

/**
 * Read hooks per service. Screens never touch the store directly, so replacing
 * the mock layer with HTTP does not reach into any component.
 */

export const useCycles = () =>
  useQuery({ queryKey: queryKeys.cycles.all, queryFn: () => api.cycles.list() });

export const useActiveCycle = () =>
  useQuery({ queryKey: queryKeys.cycles.active, queryFn: () => api.cycles.getActive() });

export const useParentCategories = () =>
  useQuery({ queryKey: queryKeys.taxonomy.parents, queryFn: () => api.taxonomy.parentCategories() });

export const useSubCategories = (parentId?: string) =>
  useQuery({
    queryKey: queryKeys.taxonomy.subs(parentId),
    queryFn: () => api.taxonomy.subCategories(parentId),
  });

export const useCriteria = (parentId: string) =>
  useQuery({
    queryKey: queryKeys.taxonomy.criteria(parentId),
    queryFn: () => api.taxonomy.criteria(parentId),
    enabled: Boolean(parentId),
  });

export const useHonoraryOptions = () =>
  useQuery({ queryKey: queryKeys.taxonomy.honorary, queryFn: () => api.taxonomy.honoraryOptions() });

export const usePricingConfig = (cycleId: string) =>
  useQuery({
    queryKey: queryKeys.pricing.config(cycleId),
    queryFn: () => api.pricing.config(cycleId),
    enabled: Boolean(cycleId),
  });

export const useEntries = (filter: EntryFilter = {}) =>
  useQuery({ queryKey: queryKeys.entries.list(filter), queryFn: () => api.entries.list(filter) });

export const useEntry = (id: string) =>
  useQuery({
    queryKey: queryKeys.entries.byId(id),
    queryFn: () => api.entries.getById(id),
    enabled: Boolean(id),
  });

export const usePublishedResults = (cycleId: string) =>
  useQuery({
    queryKey: queryKeys.results.published(cycleId),
    queryFn: () => api.results.published(cycleId),
    enabled: Boolean(cycleId),
  });

export const useGroupResults = (cycleId: string, subCategoryId: string, tier: Tier) =>
  useQuery({
    queryKey: queryKeys.results.group(cycleId, subCategoryId, tier),
    queryFn: () => api.results.forGroup(cycleId, subCategoryId, tier),
    enabled: Boolean(cycleId && subCategoryId),
  });

export const useWinnerSummary = (entryId: string) =>
  useQuery({
    queryKey: queryKeys.results.winnerSummary(entryId),
    queryFn: () => api.results.winnerSummary(entryId),
    enabled: Boolean(entryId),
  });

export const useHonoraryDesignations = (cycleId: string) =>
  useQuery({
    queryKey: queryKeys.results.honorary(cycleId),
    queryFn: () => api.results.honorary(cycleId),
    enabled: Boolean(cycleId),
  });

export const useVoteCount = (entryId: string) =>
  useQuery({
    queryKey: queryKeys.votes.count(entryId),
    queryFn: () => api.votes.countForEntry(entryId),
    enabled: Boolean(entryId),
  });

export const useJurors = () =>
  useQuery({ queryKey: queryKeys.jury.all, queryFn: () => api.jury.jurors() });

export const useJuryQueue = (jurorId: string, cycleId: string) =>
  useQuery({
    queryKey: queryKeys.jury.queue(jurorId, cycleId),
    queryFn: () => api.jury.queue(jurorId, cycleId),
    enabled: Boolean(jurorId && cycleId),
  });

export const useNotificationTemplates = () =>
  useQuery({ queryKey: queryKeys.notifications.all, queryFn: () => api.notifications.templates() });

export const useParticipants = () =>
  useQuery({ queryKey: queryKeys.participants.all, queryFn: () => api.participants.list() });

export const usePaymentsForParticipant = (participantId: string) =>
  useQuery({
    queryKey: queryKeys.payments.forParticipant(participantId),
    queryFn: () => api.payments.forParticipant(participantId),
    enabled: Boolean(participantId),
  });

export const useAuditLog = () =>
  useQuery({ queryKey: queryKeys.governance.audit, queryFn: () => api.governance.auditLog() });

export const useSession = () =>
  useQuery({ queryKey: queryKeys.auth.session, queryFn: () => api.auth.session() });
