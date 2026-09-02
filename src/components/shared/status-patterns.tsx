"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Empty, error and loading patterns.
 *
 * Both empty and error states are treated as direction rather than mood: they
 * say what happened and what to do next, in the interface's voice. Neither
 * apologises, and neither is decorated — the pixel motif is reserved for
 * ceremonial surfaces, and an empty list is not one.
 */

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("status");

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 border border-dashed border-navy-200 px-6 py-12",
        className,
      )}
    >
      {/* A single cell of the grid, left empty — the state, stated. */}
      <span className="size-2 border border-navy-300" aria-hidden />
      <div className="space-y-1">
        <p className="font-display text-data-md uppercase">{title ?? t("emptyTitle")}</p>
        <p className="max-w-prose text-body-sm text-muted-foreground">
          {description ?? t("emptyDescription")}
        </p>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const t = useTranslations("status");
  const tCommon = useTranslations("common");

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 border border-destructive/40 px-6 py-12",
        className,
      )}
    >
      <span className="size-2 bg-destructive" aria-hidden />
      <div className="space-y-1">
        <p className="font-display text-data-md uppercase">{title ?? t("errorTitle")}</p>
        <p className="max-w-prose text-body-sm text-muted-foreground">
          {description ?? t("errorDescription")}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {tCommon("retry")}
        </Button>
      ) : null}
    </div>
  );
}

/** Card-shaped skeleton matching ProjectCard, so lists do not reflow on load. */
export function ProjectCardSkeleton({ className }: { className?: string }) {
  const t = useTranslations("status");

  return (
    <div
      className={cn("border border-border", className)}
      aria-busy
      aria-label={t("loadingLabel")}
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20 rounded-none" />
        <Skeleton className="h-5 w-3/4 rounded-none" />
        <Skeleton className="h-4 w-1/2 rounded-none" />
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }, (_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
