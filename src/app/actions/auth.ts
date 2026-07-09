"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { requireUid } from "@/lib/session";

// We dynamically import adminAuth inside the action to prevent SSR/Edge runtime crashes

export async function setSession(idToken: string) {
  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    if (!adminAuth) throw new Error("Firebase Admin not initialized");

    // Verify the ID token cryptographically before trusting any of its claims
    const decoded = await adminAuth.verifyIdToken(idToken);

    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 1 week in milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    // Failsafe sync using only the server-verified token claims -- never the
    // client-supplied identity. Existing displayName/phone/email are preserved
    // (not clobbered with nulls) if this provider didn't supply them.
    await db.insert(users).values({
      firebaseUid: decoded.uid,
      phone: decoded.phone_number ?? null,
      email: decoded.email ?? null,
      displayName: decoded.name ?? "",
      marketingConsent: false,
    }).onConflictDoUpdate({
      target: users.firebaseUid,
      set: {
        phone: decoded.phone_number ?? sql`${users.phone}`,
        email: decoded.email ?? sql`${users.email}`,
        updatedAt: new Date(),
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Session creation error:", error);
    return { success: false, error: "Failed to establish session" };
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Completes the signed-in user's profile (name/email). The Firebase UID is
 * derived from the verified session cookie, never from client input.
 */
export async function completeProfile(data: { displayName: string; email?: string }) {
  try {
    const uid = await requireUid();
    await db.update(users)
      .set({
        displayName: data.displayName,
        ...(data.email ? { email: data.email } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.firebaseUid, uid));

    return { success: true };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Fetches the profile of the currently signed-in user (from the verified session).
 */
export async function getUserProfile() {
  try {
    const uid = await requireUid();
    const result = await db.select().from(users).where(eq(users.firebaseUid, uid));
    if (result.length > 0) {
      return { success: true, profile: result[0] };
    }
    return { success: true, profile: null };
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}

/**
 * Updates the currently signed-in user's phone number in Postgres.
 */
export async function updateUserPhone(newPhone: string) {
  try {
    const uid = await requireUid();
    await db.update(users).set({ phone: newPhone, updatedAt: new Date() }).where(eq(users.firebaseUid, uid));
    return { success: true };
  } catch (error: any) {
    console.error("Update Phone Error:", error);
    return { success: false, error: "Failed to update phone number" };
  }
}
