"use client";

import { NextIntlClientProvider } from "next-intl";

import { getMessageFallback, onError, TIME_ZONE } from "@/i18n/message-policy";

/**
 * The client half of the message policy.
 *
 * `src/i18n/request.ts` covers everything rendered on the server, but its
 * handlers are functions and cannot cross the server boundary as props - so a
 * client component resolving a missing key would still fall back to next-intl's
 * default and **print the key path into the page**. That is precisely how
 * `project.standing.title` can appear in a public composition: both halves of
 * the tree need the same rule, which is why both import it from one file.
 *
 * **`locale`, `messages` and `timeZone` are passed explicitly and must be.**
 * next-intl supplies all three automatically, but only when
 * `NextIntlClientProvider` is rendered directly inside a Server Component.
 * Wrapping it in a client component - which the handlers require - breaks that
 * inheritance: without `locale` every route 500s with "Couldn't infer the
 * `locale` prop", and without `timeZone` every client-side date throws
 * `ENVIRONMENT_FALLBACK`.
 */
export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={TIME_ZONE}
      onError={onError}
      getMessageFallback={getMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
}
