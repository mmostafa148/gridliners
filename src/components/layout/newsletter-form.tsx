"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Newsletter signup.
 *
 * One field. Anything else asked here — name, discipline, "how did you hear
 * about us" — is asked at the moment a visitor has already decided to leave,
 * and every extra box is a reason to.
 *
 * The mock service treats an address that is already on the list as a success,
 * and so does this: reporting "already subscribed" would tell any visitor
 * whether a given person is on it, which is a disclosure the form has no reason
 * to make. Both land on the same confirmation.
 *
 * The confirmation replaces the field rather than sitting under it. A form that
 * stays open after it has been submitted invites a second submission, and the
 * second one is the confusing one.
 *
 * **The ids are minted, not written.** The footer renders this on every page and
 * `NewsletterBand` renders a second one on the pages that close on the signup,
 * so a literal id appeared twice in one document: the band's label resolved to
 * the footer's input, and the band's error described the footer's field. A
 * screen reader reached an unlabelled box. `useId` gives each instance its own.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const t = useTranslations("footer");
  const locale = useLocale();
  const [done, setDone] = useState(false);
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  // Shape only, matching the service. A stricter pattern rejects addresses that
  // deliver perfectly well, and the real check is the confirmation mail.
  const schema = z.object({
    email: z.string().regex(/^[^@\s]+@[^@\s.]+\.[^@\s]+$/, { message: t("subscribeInvalid") }),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      const result = await api.newsletter.subscribe(email, locale);
      if (!result.ok) {
        form.setError("email", { message: t("subscribeInvalid") });
        return;
      }
      setDone(true);
    } catch {
      form.setError("email", { message: t("subscribeFailed") });
    }
  });

  if (done) {
    return (
      <p
        // Announced without moving focus: the reader did not ask to be taken
        // anywhere, only told it worked.
        role="status"
        className={cn("flex items-center gap-3 text-body-sm text-cream-100", className)}
      >
        <Check className="size-4 shrink-0" aria-hidden />
        {t("subscribeDone")}
      </p>
    );
  }

  const error = form.formState.errors.email?.message;
  const pending = form.formState.isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <div className="flex items-stretch">
        <label htmlFor={fieldId} className="sr-only">
          {t("emailLabel")}
        </label>
        <input
          id={fieldId}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...form.register("email")}
          className={cn(
            "h-12 min-w-0 flex-1 border bg-transparent px-4 text-body-sm text-cream-100",
            "placeholder:text-cream-200/45 focus:outline-none",
            "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream-100",
            error ? "border-campaign-orange" : "border-cream-200/35 focus:border-cream-100",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label={t("subscribe")}
          className={cn(
            "flex size-12 shrink-0 items-center justify-center bg-cream-100 text-navy-900",
            "transition-colors hover:bg-cream-50 disabled:opacity-70",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-100",
          )}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
          )}
        </button>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-body-sm text-campaign-orange">
          {error}
        </p>
      ) : null}
    </form>
  );
}
