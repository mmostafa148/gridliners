"use client";

import { useTranslations } from "next-intl";

import { AuthForm, fieldError } from "@/components/account/auth-form";
import { Field, PasswordField, SubmitButton } from "@/components/account/form-primitives";
import { Link } from "@/i18n/navigation";
import { signInAction } from "@/lib/auth/actions";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const t = useTranslations("auth");

  return (
    <AuthForm action={signInAction} className="flex flex-col gap-6">
      {(state) => (
        <>
          {/* Carried on the form rather than kept in the URL alone, so it
              survives a failed submit re-render. Sanitized again server-side:
              a hidden input is a value the client controls. */}
          <input type="hidden" name="returnTo" value={returnTo} />

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

          <div className="flex flex-col gap-2">
            <PasswordField
              name="password"
              label={t("password")}
              autoComplete="current-password"
              required
              error={fieldError(state, "password", t)}
            />
            <Link
              href="/forgot-password"
              className="w-fit text-body-sm text-navy-600 underline underline-offset-4 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {t("forgotLink")}
            </Link>
          </div>

          <SubmitButton label={t("signIn")} pendingLabel={t("signingIn")} />
        </>
      )}
    </AuthForm>
  );
}
