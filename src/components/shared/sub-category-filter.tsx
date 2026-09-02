"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/i18n/routing";
import type { ParentCategory, SubCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Sub-category filter, grouped under its parent category.
 *
 * Grouping is not cosmetic: "Commercial Ad" exists under both Photography and
 * Film, so the parent heading is what disambiguates the two options.
 */
export function SubCategoryFilter({
  parents,
  subCategories,
  value,
  onValueChange,
  className,
}: {
  parents: ParentCategory[];
  subCategories: SubCategory[];
  value: string | "all";
  onValueChange: (value: string) => void;
  className?: string;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("filters");

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-full sm:w-72", className)} aria-label={t("subCategory")}>
        <SelectValue placeholder={t("allSubCategories")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("allSubCategories")}</SelectItem>
        {[...parents]
          .sort((a, b) => a.order - b.order)
          .map((parent) => {
            const children = subCategories
              .filter((sub) => sub.parentId === parent.id)
              .sort((a, b) => a.order - b.order);
            if (children.length === 0) return null;

            return (
              <SelectGroup key={parent.id}>
                <SelectLabel>{parent.name[locale]}</SelectLabel>
                {children.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name[locale]}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
      </SelectContent>
    </Select>
  );
}
