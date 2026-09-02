"use client";

import { ChevronDown } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Accordion, vendored from `radix-ui` the way `sheet.tsx` vendors `Dialog`.
 *
 * Radix carries the parts that are tedious to get right and easy to get
 * subtly wrong: Up/Down/Home/End roving focus between triggers, Enter and
 * Space to toggle, the `aria-expanded` / `aria-controls` / `aria-labelledby`
 * wiring between a trigger and its region, and `data-state` for the open and
 * closed styling. None of that is worth hand-rolling for one FAQ list.
 *
 * The trigger is a bare `<button>`, deliberately not the `ghost` `Button`
 * variant. That variant carries `aria-expanded:bg-muted
 * aria-expanded:text-foreground`, which are near-white, so every open panel
 * would flash a pale tile the moment it opened. On a light ground that is
 * merely wrong; on any of this site's navy grounds it is build-state finding
 * #12 exactly. Styling the trigger here keeps it correct on either.
 *
 * Square, ruled and unrounded, like every other surface in this identity.
 */

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-current/15 last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-start justify-between gap-6 py-5 text-start",
          "text-h4 transition-colors outline-none",
          // Colours are inherited from the section, so the same component
          // works on cream and on navy without a tone prop.
          "hover:text-current/70 data-[state=open]:text-current",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
          className,
        )}
        {...props}
      >
        {children}
        {/* Rotates rather than swaps glyph, so the state change is one
            continuous thing. Vertical rotation needs no RTL mirror. */}
        <ChevronDown
          className="mt-1 size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          strokeWidth={2}
          aria-hidden
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      // The height keyframes come from Radix's own CSS variable, so the panel
      // animates to its real height rather than a guessed one.
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div className={cn("max-w-2xl pb-6 text-body-md", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
