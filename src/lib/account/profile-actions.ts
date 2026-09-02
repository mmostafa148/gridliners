"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { api } from "@/lib/api";
import type { ContentLanguage } from "@/lib/api/types";
import { requireParticipant } from "@/lib/auth/guard";
import type { FormState } from "@/lib/auth/form-state";
import { sessionCookie } from "@/lib/auth/session";

const EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

function str(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * 2.8's write.
 *
 * **An email change moves the sign-in account with it.** They are the same
 * fact: a profile whose address changed but whose credentials did not would
 * leave somebody unable to sign in with the address their own page shows.
 * The service rejects an address another account already holds.
 */
export async function saveProfileAction(_prev: FormState, data: FormData): Promise<FormState> {
  const { user, participant } = await requireParticipant();

  const name = str(data, "name");
  const email = str(data, "email");
  const values = {
    name,
    email,
    jobTitle: str(data, "jobTitle"),
    nationality: str(data, "nationality"),
    country: str(data, "country"),
    companyName: str(data, "companyName"),
    uiLanguage: str(data, "uiLanguage"),
  };

  if (name.length < 2) return { error: "nameRequired", field: "name", values };
  if (!EMAIL.test(email)) return { error: "emailInvalid", field: "email", values };

  const photo = str(data, "photoUrl");
  const removePhoto = data.get("removePhoto") === "1";

  try {
    await api.participants.update(participant.id, {
      name,
      email,
      jobTitle: values.jobTitle,
      nationality: values.nationality,
      country: values.country,
      companyName: values.companyName,
      uiLanguage: (values.uiLanguage === "ar" ? "ar" : "en") as ContentLanguage,
      // `null` clears it, `undefined` leaves it: removing an image and not
      // touching it are different requests.
      photoUrl: removePhoto ? null : photo || undefined,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "EMAIL_TAKEN") return { error: "email_taken", field: "email", values };
    return { error: "server_error", values };
  }

  // The cookie carries the user id, which has not changed - but the session is
  // re-read from the account on every request, so it is already current. The
  // cookie is refreshed anyway so its lifetime restarts on an active account.
  (await cookies()).set(sessionCookie(user.id));

  const locale = await getLocale();
  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/dashboard`);
  return { error: null, done: true, values };
}
