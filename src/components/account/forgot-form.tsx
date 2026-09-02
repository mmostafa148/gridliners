"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { AuthForm, fieldError } from "@/components/account/auth-form";
import { Field, SubmitButton, SuccessNote } from "@/components/account/form-primitives";
import { devResetLink } from "@/lib/auth/actions";
import { forgotAction } from "@/lib/auth/actions";

/**
 * Request a reset link.
 *
 * **The confirmation is the same sentence whatever the address was.** Saying
 * "no account with that email" would turn this form into a way of asking
 * whether somebody is registered, which the brief rules out and which is worth
 * more to an attacker than the reset itself.
 */
export function ForgotForm() {
  const t = useTranslations("auth");

  return (
    <AuthForm action={forgotAction} className="flex flex-col gap-5">
      {(state) =>
        state.done ? (
          <div className="flex flex-col gap-4">
            <SuccessNote>{t("forgotDone")}</SuccessNote>
            <DevResetLink />
          </div>
        ) : (
          <>
            <Field
              name="email"
              label={t("email")}
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              defaultValue={state.values?.email}
              error={fieldError(state, "email", t)}
            />
            <SubmitButton label={t("sendLink")} pendingLabel={t("sending")} />
          </>
        )
      }
    </AuthForm>
  );
}

/**
 * The reset link, printed, in development only.
 *
 * There is no mail service in this build. Without this the reset flow is a
 * form that cannot be finished, which makes the screen after it untestable and
 * unreviewable. `devResetLink` returns null in production, so nothing renders
 * there — the token is never exposed to a real visitor.
 */
function DevResetLink() {
  const t = useTranslations("auth");
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    devResetLink().then((value) => {
      if (live) setHref(value);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!href) return null;

  return (
    <div className="border border-dashed border-navy-900/30 bg-mist p-4">
      <p className="text-caption text-navy-600">{t("devLinkTitle")}</p>
      <p className="mt-2 text-body-sm text-navy-600">{t("devLinkBody")}</p>
      <a
        href={href}
        className="mt-3 inline-block break-all font-data text-data-sm text-blue-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        {t("devLinkAction")}
      </a>
    </div>
  );
}
