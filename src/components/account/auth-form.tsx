"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { ErrorSummary } from "@/components/account/form-primitives";
import type { FormState } from "@/lib/auth/form-state";
import { emptyForm } from "@/lib/auth/form-state";

/**
 * The shell every 2.1 form shares: the action, its state, and the summary.
 *
 * `useActionState` keeps the returned `FormState` across submits, which is
 * what preserves the typed values and lets the summary name the field that
 * failed. The children are a render prop rather than context, so each screen
 * reads its own state without a provider between it and its inputs.
 */
export function AuthForm({
  action,
  children,
  className,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  children: (state: FormState) => React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(action, emptyForm);

  return (
    <form action={formAction} noValidate className={className}>
      <ErrorSummary
        title={t("summaryTitle")}
        items={
          state.error && !state.done
            ? [{ field: state.field, message: t(`errors.${state.error}`) }]
            : []
        }
      />
      {children(state)}
    </form>
  );
}

/** The message for a field, or null — so a screen never builds the key itself. */
export function fieldError(state: FormState, name: string, t: (key: string) => string) {
  return state.error && state.field === name ? t(`errors.${state.error}`) : null;
}
