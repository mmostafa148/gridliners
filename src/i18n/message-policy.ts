/**
 * One message policy, shared by both halves of the tree.
 *
 * These handlers are set twice - once in `request.ts` for everything rendered
 * on the server, once in `components/providers/intl-provider.tsx` for
 * everything rendered in the browser - because they are functions and cannot
 * cross the server boundary as props. Keeping the single copy here is what
 * stops the two halves drifting into different behaviour.
 */

/**
 * The timezone every screen formats against.
 *
 * Fixture timestamps are UTC and the cycle's own deadlines are published in
 * Gulf time, so a date must not be formatted in the reader's zone or the same
 * deadline reads as two different days either side of midnight.
 *
 * **It has to be handed to the client provider explicitly.** next-intl passes
 * it down automatically only when `NextIntlClientProvider` is rendered directly
 * inside a Server Component; behind a client wrapper the inheritance is lost
 * and every client-side date throws `ENVIRONMENT_FALLBACK`.
 */
export const TIME_ZONE = "Asia/Dubai";

/**
 * A missing message must never reach a reader as its own key.
 *
 * next-intl's default fallback renders the key path - `project.standing.title` -
 * straight into the page, which is how an untranslated key ends up in a public
 * composition looking like a bug that shipped. It is worse than nothing: it
 * leaks internal naming and reads as broken.
 *
 *  - **In development and test, throw.** A missing key is a defect and should
 *    stop the person who introduced it, not be found later in a screenshot.
 *    `scripts/check-messages.mjs` already catches every *literal* key at lint
 *    time; this covers the dynamic ones it has to skip - `t(`level.${x}`)` and
 *    its kind - which are exactly the ones that slip through.
 *  - **In production, render nothing.** A blank is a smaller failure than a key
 *    path, and the error is still reported through `onError`.
 */
export function getMessageFallback({
  namespace,
  key,
}: {
  namespace?: string;
  key: string;
}) {
  const path = [namespace, key].filter(Boolean).join(".");
  if (process.env.NODE_ENV !== "production") {
    throw new Error(`Missing message: ${path}`);
  }
  return "";
}

/**
 * Report, never throw.
 *
 * **next-intl reports environment warnings through this same channel**, not
 * only missing keys: a formatter with no configured timezone arrives here as
 * `ENVIRONMENT_FALLBACK`. Throwing on everything turned that warning into a
 * 500 on `/dev/kitchen-sink`, which is a far worse failure than the thing it
 * was warning about.
 *
 * So the strictness lives in `getMessageFallback`, which sees missing keys and
 * nothing else. This logs the rest loudly and lets the page render.
 */
export function onError(error: unknown) {
  console.error("[i18n]", error);
}
