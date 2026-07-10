import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Looks up the session row for the current request's cookie and returns the
 * Postgres user id it belongs to, or null if there's no valid session. This is
 * the only source of truth for "who is making this request" -- never trust a
 * client-supplied user id. Cached per request via React's cache().
 */
export const getAuthenticatedUserId = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const [session] = await db.select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())));

  return session ? session.userId : null;
});

export async function requireUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/**
 * Creates a new session row and sets the httpOnly cookie pointing at it.
 */
export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const [session] = await db.insert(sessions).values({ userId, expiresAt }).returning({ id: sessions.id });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Deletes the session row (so it can't be reused even if the cookie leaks)
 * and clears the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  cookieStore.delete(SESSION_COOKIE);
}
