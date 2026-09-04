import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Section heading: display title, optional description, optional trailing link.
 *
 * The eyebrow is OPTIONAL and deliberately rationed. An uppercase label above
 * every section header is the single clearest tell of a templated page: it
 * gives every section the same rhythm and tells the reader nothing the
 * headline and the section's position do not already. One per three sections
 * at most.
 *
 * `tone="ceremonial"` inverts it for navy surfaces, where blue is 1.4:1 and
 * cannot carry small text.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
  tone = "paper",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  tone?: "paper" | "ceremonial";
  className?: string;
}) {
  const ceremonial = tone === "ceremonial";

  return (
    <div
      data-motion-heading
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrow ? (
          <p
            className={cn(
              "font-display text-coord uppercase",
              ceremonial ? "text-cream-200/70" : "text-blue-700",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        {/* text-h1, a step below the display scale. The display sizes belong
            to the hero, which is the only place on a page speaking at that
            volume; every section heading matching it left the page with no
            change of register from top to bottom. */}
        <h2 className={cn("text-h1", ceremonial && "text-cream-100")}>{title}</h2>
        {description ? (
          <p
            className={cn(
              "max-w-2xl text-body-md",
              ceremonial ? "text-cream-200/75" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {link ? (
        <Link
          href={link.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 font-display text-coord uppercase transition-colors",
            ceremonial
              ? "text-cream-100 hover:text-cream-50"
              : "text-blue-700 hover:text-blue-800",
          )}
        >
          {link.label}
          {/* Logical rotation: the arrow points toward the reading direction,
              so it flips with the page rather than always pointing right. */}
          <ArrowRight className="size-4 transition-transform rtl:-scale-x-100" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
