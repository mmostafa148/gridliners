import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { api } from "@/lib/api";
import type { SessionUser } from "@/lib/api/types";

/**
 * Who is signed in, per request.
 *
 * **The mock store could not answer this and it is worth saying why.** Its
 * `session` field is one value on one object shared by the whole server
 * process, so every visitor would be whoever signed in last - not a session,
 * a global variable. It also seeds signed-in, which means the app had no
 * logged-out state at all. Both are fine for a Phase 0 shell and neither
 * survives a participant module.
 *
 * So the identity lives in the request's cookie and the accounts live in the
 * mock. The cookie carries a user id and an HMAC of it.
 *
 * **This is not production authentication, and the signature is not what makes
 * it safe.** There is no session record, no revocation, no rotation and no
 * expiry beyond the cookie's own. The HMAC stops the value being edited by
 * hand in devtools - which is what would otherwise make cross-account access a
 * one-line trick - and nothing more. A real provider replaces this file whole.
 */

const COOKIE = "gl_session";
/**
 * A build-time constant in this mock. A real deployment reads a secret from the
 * environment and rotates it; there is nothing to protect here yet, and a
 * generated-per-boot secret would sign every developer out on each reload.
 */
const SECRET = process.env.MOCK_SESSION_SECRET ?? "gridliners-mock-session-key";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function verify(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(signature);
  // Length has to match before `timingSafeEqual`, which throws otherwise.
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function sessionCookie(userId: string) {
  return {
    name: COOKIE,
    value: `${userId}.${sign(userId)}`,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      // 30 days. Long enough that a demo account is not signed out mid-review.
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export const clearedSessionCookie = {
  name: COOKIE,
  value: "",
  options: { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 0 },
};

/**
 * The signed-in user, or null.
 *
 * Resolved on the server on every request, so the server and the client never
 * disagree about who this is - there is no client-side session state to flash
 * protected content before it catches up.
 */
export async function getSession(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const split = raw.lastIndexOf(".");
  if (split < 1) return null;
  const userId = raw.slice(0, split);
  if (!verify(userId, raw.slice(split + 1))) return null;
  // The account is re-read rather than trusted from the cookie, so a profile
  // change shows up immediately and a deleted account stops being a session.
  return api.auth.userById(userId);
}

/**
 * A return path that is safe to send a browser to after signing in.
 *
 * **Only a same-site absolute path.** `//evil.example` and
 * `https://evil.example` are both rejected: the first is a protocol-relative
 * URL that browsers treat as absolute, and a `returnTo` that can leave the
 * site is an open redirect wearing a convenience feature's clothes.
 */
export function safeReturnTo(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  // A backslash is a path separator to some browsers and not to the parser.
  if (value.includes("\\")) return fallback;
  return value;
}
