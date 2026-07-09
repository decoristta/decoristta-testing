import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

/**
 * Verifies the httpOnly session cookie against Firebase Admin and returns the
 * Firebase UID it was issued for. This is the only source of truth for "who is
 * making this request" on the server -- never trust a client-supplied uid.
 * Cached per request via React's cache() so repeated calls in one render/action
 * don't re-verify the cookie multiple times.
 */
export const getAuthenticatedUid = cache(async (): Promise<string | null> => {
  const { adminAuth } = await import("@/lib/firebase/admin");
  if (!adminAuth) return null;

  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
  } catch {
    return null;
  }
});

export async function requireUid(): Promise<string> {
  const uid = await getAuthenticatedUid();
  if (!uid) throw new Error("Not authenticated");
  return uid;
}
