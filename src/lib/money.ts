/**
 * Money, formatted once.
 *
 * Every amount in the model is a plain number of dollars on a field suffixed
 * `Usd` (`basePriceUsd`, `additionalFeeUsd`, `totalUsd`), never minor units.
 *
 * The formatter comes from next-intl rather than a bare `Intl.NumberFormat` so
 * the locale and time zone are the request's, and Arabic gets its own numeral
 * and currency placement. It is passed in rather than imported because
 * `getFormatter()` is server-only and `useFormatter()` is client-only, and this
 * has to serve both.
 *
 * Typed from `useFormatter`'s return rather than structurally: next-intl
 * narrows `Intl.NumberFormatOptions` to its own type, so a hand-written
 * `{ number(value, options?: Intl.NumberFormatOptions) }` is not a supertype of
 * the real thing and neither formatter is assignable to it. The import is
 * type-only and erases at build, so no client hook reaches the server bundle.
 */
import type { useFormatter } from "next-intl";

export type Formatter = ReturnType<typeof useFormatter>;

export function usd(format: Formatter, amount: number): string {
  return format.number(amount, {
    style: "currency",
    currency: "USD",
    // Fixture prices are whole dollars, and a comparison table of $100.00 next
    // to $125.00 spends four characters per cell saying nothing. A quote that
    // does land on cents still prints them.
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });
}
