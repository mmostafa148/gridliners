import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";

import { getMessageFallback, onError, TIME_ZONE } from "./message-policy";
import { routing } from "./routing";

/**
 * The server half of the message policy.
 *
 * `message-policy.ts` holds the rules and the reasoning; this applies them to
 * everything rendered on the server. The client half is
 * `components/providers/intl-provider.tsx`, and the two must stay identical -
 * a key resolved in a client component takes the browser's path, not this one.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: TIME_ZONE,
    onError,
    getMessageFallback,
  };
});
