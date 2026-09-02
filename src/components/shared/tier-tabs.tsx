"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TIERS, type Tier } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Tier selector. Full three-tier separation applies everywhere — thresholds,
 * ranking groups and public listings (CD §2), so this is a primary filter on
 * finalists, winners and admin screens rather than a cosmetic toggle.
 */
export function TierTabs({
  value,
  onValueChange,
  includeAll = false,
  className,
}: {
  value: Tier | "all";
  onValueChange: (value: Tier | "all") => void;
  includeAll?: boolean;
  className?: string;
}) {
  const t = useTranslations("tier");
  const tFilters = useTranslations("filters");

  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as Tier | "all")}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full justify-start">
        {includeAll ? <TabsTrigger value="all">{tFilters("allTiers")}</TabsTrigger> : null}
        {TIERS.map((tier) => (
          <TabsTrigger key={tier} value={tier}>
            {t(`short.${tier}`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
