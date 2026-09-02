/**
 * The shape every auth and profile action returns.
 *
 * **Its own module, and that is not tidiness.** A `"use server"` file may only
 * export async functions — every other export becomes a server reference the
 * client cannot hold — so the type and the initial value live here and the
 * actions import them.
 */
export interface FormState {
  /** A message key under `auth.errors`, or null. */
  error: string | null;
  /** Which field the error belongs on, when it belongs on one. */
  field?: string;
  /** Set when the action succeeded and the screen swaps to its done state. */
  done?: boolean;
  /** Echoed back so a failed submit never empties the form. */
  values?: Record<string, string>;
}

export const emptyForm: FormState = { error: null };
