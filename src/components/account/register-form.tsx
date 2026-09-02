"use client";

import { ChevronDown, Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { AuthForm, fieldError } from "@/components/account/auth-form";
import { Field, PasswordField, SubmitButton } from "@/components/account/form-primitives";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { registerAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

/**
 * Registration.
 *
 * **No tier here.** The account is general and the tier is chosen per entry —
 * the content map says so, the addendum prices per entry, and asking at signup
 * would make a participant commit to a price before they have a project. The
 * note under the form says that rather than leaving it implied.
 */
export function RegisterForm({ locale }: { locale: Locale }) {
  const t = useTranslations("auth");

  return (
    <AuthForm action={registerAction} className="flex flex-col gap-5">
      {(state) => (
        <>
          <Field
            name="name"
            label={t("name")}
            autoComplete="name"
            required
            defaultValue={state.values?.name}
            error={fieldError(state, "name", t)}
          />

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

          <PasswordField
            name="password"
            label={t("password")}
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

          <Field name="uiLanguage" label={t("language")} required>
            {({ id, name, className, invalid, describedBy }) => (
              <div className="relative">
                <select
                  id={id}
                  name={name}
                  data-field={name}
                  defaultValue={state.values?.uiLanguage ?? locale}
                  aria-invalid={invalid || undefined}
                  aria-describedby={describedBy}
                  className={cn(className, "appearance-none pe-12")}
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-navy-600"
                  strokeWidth={1.8}
                />
              </div>
            )}
          </Field>

          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 border border-navy-900/10 bg-[#fbfbfd] p-4 text-body-sm leading-relaxed text-navy-800 transition-colors hover:border-navy-900/25">
              <input
                type="checkbox"
                name="acceptTerms"
                data-field="acceptTerms"
                aria-invalid={state.field === "acceptTerms" || undefined}
                className={cn(
                  "mt-0.5 size-5 shrink-0 border border-navy-900/35 accent-blue-700",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700",
                )}
              />
              <span>
                {t("acceptTerms")}{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-blue-700"
                >
                  {t("acceptTermsLink")}
                </Link>
              </span>
            </label>
            {fieldError(state, "acceptTerms", t) ? (
              <p role="alert" className="text-body-sm text-destructive-ink">
                {fieldError(state, "acceptTerms", t)}
              </p>
            ) : null}
          </div>

          <p className="flex items-start gap-3 border-s-2 border-blue-700 bg-blue-700/5 p-4 text-body-sm leading-relaxed text-navy-700">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-blue-700" strokeWidth={2} />
            <span>{t("tierNote")}</span>
          </p>

          <SubmitButton label={t("register")} pendingLabel={t("registering")} />
        </>
      )}
    </AuthForm>
  );
}
