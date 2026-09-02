"use client";

import { useTranslations } from "next-intl";

import { AuthForm, fieldError } from "@/components/account/auth-form";
import { PasswordField, SubmitButton, SuccessNote } from "@/components/account/form-primitives";
import { Link } from "@/i18n/navigation";
import { resetAction } from "@/lib/auth/actions";

/**
 * Set a new password against a token.
 *
 * The token rides in a hidden field rather than being read from the URL at
 * submit time, so a failed attempt keeps it; and success routes back to sign
 * in rather than signing the visitor in silently, because whoever followed the
 * link has not proved they are the account holder — only that they read the
 * mail.
 */
export function ResetForm({ token }: { token: string }) {
  const t = useTranslations("auth");

  return (
    <AuthForm action={resetAction} className="flex flex-col gap-6">
      {(state) =>
        state.done ? (
          <div className="flex flex-col gap-6">
            <SuccessNote>{t("resetDone")}</SuccessNote>
            <Link
              href="/login"
              className="inline-flex h-11 w-fit items-center justify-center bg-navy-900 px-6 text-[0.9375rem] font-medium text-cream-50 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {t("signIn")}
            </Link>
          </div>
        ) : (
          <>
            <input type="hidden" name="token" value={token} />
            <PasswordField
              name="password"
              label={t("newPassword")}
              autoComplete="new-password"
              hint={t("passwordHint")}
              required
              error={fieldError(state, "password", t)}
            />
            <PasswordField
              name="confirmPassword"
              label={t("confirmPassword")}
              autoComplete="new-password"
              required
              error={fieldError(state, "confirmPassword", t)}
            />
            <SubmitButton label={t("setPassword")} pendingLabel={t("setting")} />
          </>
        )
      }
    </AuthForm>
  );
}
