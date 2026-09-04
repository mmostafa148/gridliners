import Image from "next/image";

import { ProjectPlaceholder } from "@/components/shared/project-placeholder";
import type { Entry } from "@/lib/api/types";
import { temporaryFrames } from "@/lib/project-media";
import { cn } from "@/lib/utils";

/**
 * An entry's cover, at whatever size the list it sits in needs.
 *
 * **The same frames the public project page uses**, resolved through the same
 * `temporaryFrames` — so a participant recognises their own work here by the
 * picture they already see on its public page, rather than by reading a title
 * in a table. That continuity is the point: the account is the private side of
 * the same site.
 *
 * A frame is either a real file or drawn art; both are handled, and a draft
 * with neither still renders something rather than a hole.
 */
export function EntryCover({
  entry,
  parentId,
  className,
  sizes = "96px",
  priority,
}: {
  entry: Entry;
  parentId: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const frame = temporaryFrames(entry.slug, parentId, entry.title)[0];

  return (
    <span
      // Decorative. Every list that carries a cover names the entry beside it,
      // so the frame adds nothing to a screen reader - and the artwork's own
      // lettering is not UI text to be measured for contrast.
      aria-hidden
      className={cn(
        "relative block overflow-hidden bg-navy-900/8",
        className,
      )}
    >
      {frame?.kind === "file" ? (
        <Image
          src={frame.src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : frame ? (
        <ProjectPlaceholder
          slug={entry.slug}
          title={entry.title}
          parentId={parentId}
        />
      ) : null}
    </span>
  );
}
