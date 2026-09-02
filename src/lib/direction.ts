"use client";

import { useLocale } from "next-intl";

import { localeDirection, type Locale } from "@/i18n/routing";

/**
 * Some primitives (Radix poppers, shadcn's Sheet) take physical sides because
 * they position in visual space. Rather than hardcoding "left"/"right" at each
 * call site, resolve the logical side against the active locale here — that
 * keeps the physical value in exactly one place and mirrors it for Arabic.
 */
export function useDirection(): "ltr" | "rtl" {
  return localeDirection[useLocale() as Locale];
}

/** Physical side matching the inline-start edge (left in LTR, right in RTL). */
export function useInlineStartSide(): "left" | "right" {
  return useDirection() === "rtl" ? "right" : "left";
}

/** Physical side matching the inline-end edge (right in LTR, left in RTL). */
export function useInlineEndSide(): "left" | "right" {
  return useDirection() === "rtl" ? "left" : "right";
}
