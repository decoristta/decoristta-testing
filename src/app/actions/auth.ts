"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireUserId, getAuthenticatedUserId, createSession, destroySession } from "@/lib/session";

/**
 * Verifies an MSG91 OTP-widget access token server-side.
 * On success, creates/updates the user row keyed by phone and issues our own session.
 */
export async function verifyWidgetToken(accessToken: string) {
  try {
    const authkey = process.env.MSG91_AUTHKEY;
    if (!authkey) throw new Error("MSG91_AUTHKEY is not configured");

    const res = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ authkey, "access-token": accessToken }),
    });
    const data = await res.json();

    if (data.type !== "success") {
      return { success: false, error: "Verification failed. Please try again." };
    }

    const rawIdentifier: string | undefined =
      typeof data.message === "string" ? data.message : undefined;

    if (!rawIdentifier) {
      console.error("verifyAccessToken succeeded but no identifier found in response:", JSON.stringify(data));
      return { success: false, error: "Verification succeeded but we couldn't read your phone number." };
    }

    const phone = rawIdentifier.startsWith("+") ? rawIdentifier : `+${rawIdentifier}`;

    const [user] = await db.insert(users).values({
      phone,
      displayName: "",
      marketingConsent: false,
    }).onConflictDoUpdate({
      target: users.phone,
      set: { updatedAt: sql`now()` },
    }).returning();

    await createSession(user.id);

    return { success: true };
  } catch (error: any) {
    console.error("Widget token verification error:", error);
    return { success: false, error: "Failed to verify. Please try again." };
  }
}

export async function clearSession() {
  await destroySession();
}

/**
 * Completes the signed-in user's profile (name/email).
 */
export async function completeProfile(data: { displayName: string; email?: string }) {
  try {
    const userId = await requireUserId();

    const [updated] = await db.update(users)
      .set({
        displayName: data.displayName,
        ...(data.email ? { email: data.email } : {}),
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, userId))
      .returning();

    return { success: true };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getCurrentUser() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { success: true, user: null };

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return { success: true, user: user ?? null };
  } catch (error: any) {
    console.error("Fetch current user error:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}
