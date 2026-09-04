import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The deliberately neutral fallback for fictional/demo projects.
 * A solid field and one image icon keep it unmistakably temporary without
 * adding copy, category cues or decorative artwork that could read as work.
 */
export function ProjectPlaceholder({
  className,
}: {
  slug: string;
  title: string;
  parentId: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden bg-navy-950 text-cream-50/60",
        className,
      )}
    >
      <ImageIcon strokeWidth={1.25} className="h-auto w-[18%] min-w-5 max-w-16" />
    </span>
  );
}
