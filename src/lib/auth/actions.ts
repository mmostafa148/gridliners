"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { api } from "@/lib/api";
import type { FormState } from "@/lib/auth/form-state";
import { clearedSessionCookie, getSession, safeReturnTo, sessionCookie } from "@/lib/auth/session";

/**
 * The mutations behind 2.1, as Server Actions.
 *
 * **Every one runs on the server, which is the point.** A mock that validated
 * in the browser would authorize in the browser, and the brief asks for the
 * boundary to be real even though the data layer is not.
 *
 * Each returns a `FormState` rather than throwing: a failed sign-in is
 * something the form has to *say*, in the right language, with what the reader
 * typed still in the fields.
 */



function str(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Shape only. A stricter pattern rejects addresses that deliver perfectly well. */
const EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

export async function signInAction(_prev: FormState, data: FormData): Promise<FormState> {
  const email = str(data, "email");
  const password = String(data.get("password") ?? "");
  const values = { email };

  if (!EMAIL.test(email)) return { error: "emailInvalid", field: "email", values };
  if (!password) return { error: "passwordRequired", field: "password", values };

  const result = await api.auth.signIn(email, password);
  if (!result.ok) return { error: result.reason, values };

  (await cookies()).set(sessionCookie(result.user.id));
  const locale = await getLocale();
  // Sanitized before it is ever used as a destination: a returnTo that can
  // leave the site is an open redirect wearing a convenience feature's clothes.
  redirect(`/${locale}${safeReturnTo(str(data, "returnTo"))}`);
}

export async function registerAction(_prev: FormState, data: FormData): Promise<FormState> {
  const name = str(data, "name");
  const email = str(data, "email");
  const password = String(data.get("password") ?? "");
  const confirm = String(data.get("confirmPassword") ?? "");
  const uiLanguage = str(data, "uiLanguage") === "ar" ? "ar" : "en";
  const accepted = data.get("acceptTerms") === "on";
  const values = { name, email, uiLanguage };

  if (name.length < 2) return { error: "nameRequired", field: "name", values };
  if (!EMAIL.test(email)) return { error: "emailInvalid", field: "email", values };
  if (password.length < 8) return { error: "passwordShort", field: "password", values };
  if (password !== confirm) return { error: "passwordMismatch", field: "confirmPassword", values };
  if (!accepted) return { error: "terms_required", field: "acceptTerms", values };

  const result = await api.auth.register({
    name,
    email,
    password,
    uiLanguage,
    acceptedTerms: accepted,
  });
  if (!result.ok) {
    return { error: result.reason, field: result.reason === "email_taken" ? "email" : undefined, values };
  }

  (await cookies()).set(sessionCookie(result.user.id));
  // Registration signs in and lands on the dashboard: an account with nothing
  // in it still has a next action, and that screen is where it is.
  redirect(`/${uiLanguage}/dashboard`);
}

export async function forgotAction(_prev: FormState, data: FormData): Promise<FormState> {
  const email = str(data, "email");
  if (!EMAIL.test(email)) return { error: "emailInvalid", field: "email", values: { email } };
  // Resolves the same way for an address that exists and one that does not.
  await api.auth.requestPasswordReset(email);
  return { error: null, done: true, values: { email } };
}

export async function resetAction(_prev: FormState, data: FormData): Promise<FormState> {
  const token = str(data, "token");
  const password = String(data.get("password") ?? "");
  const confirm = String(data.get("confirmPassword") ?? "");

  if (!token) return { error: "invalid_token" };
  if (password.length < 8) return { error: "passwordShort", field: "password" };
  if (password !== confirm) return { error: "passwordMismatch", field: "confirmPassword" };

  const result = await api.auth.resetPassword(token, password);
  if (!result.ok) return { error: result.reason };
  return { error: null, done: true };
}

/**
 * Sign out.
 *
 * **An action, not a page.** The cookie is cleared server-side, so the
 * protected pages stop rendering for this browser immediately rather than
 * after some client state catches up — and because every participant page
 * resolves its session on the server, a back-button hit re-renders against no
 * session and redirects instead of showing a cached account.
 */
export async function logoutAction(): Promise<void> {
  const locale = await getLocale();
  (await cookies()).set(clearedSessionCookie);
  redirect(`/${locale}/login`);
}

export async function changePasswordAction(_prev: FormState, data: FormData): Promise<FormState> {
  const user = await getSession();
  if (!user) return { error: "invalid_credentials" };

  const current = String(data.get("currentPassword") ?? "");
  const next = String(data.get("newPassword") ?? "");
  const confirm = String(data.get("confirmPassword") ?? "");

  if (!current) return { error: "passwordRequired", field: "currentPassword" };
  if (next.length < 8) return { error: "passwordShort", field: "newPassword" };
  if (next !== confirm) return { error: "passwordMismatch", field: "confirmPassword" };

  const result = await api.auth.changePassword(user.id, current, next);
  if (!result.ok) return { error: result.reason, field: "currentPassword" };
  return { error: null, done: true };
}

/** Used by the dev affordance on /forgot-password. Never called in production. */
export async function devResetLink(): Promise<string | null> {
  if (process.env.NODE_ENV === "production") return null;
  const { __devLastResetToken } = await import("@/lib/api/mock");
  const token = __devLastResetToken();
  if (!token) return null;
  const locale = await getLocale();
  const t = await getTranslations("auth");
  void t;
  return `/${locale}/reset-password?token=${encodeURIComponent(token)}`;
}
