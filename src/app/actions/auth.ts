"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

// We dynamically import adminAuth inside the action to prevent SSR/Edge runtime crashes

export async function setSession(idToken: string) {
  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    if (!adminAuth) throw new Error("Firebase Admin not initialized");
    
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 1 week in milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
    });
    return { success: true };
  } catch (error: any) {
    console.error("Session creation error:", error);
    return { success: false, error: error.message };
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Syncs a user profile from Firebase Auth to the PostgreSQL database.
 * This is called after a user completes the signup/profile step.
 */
export async function syncUserToDatabase(
  firebaseUid: string,
  data: { phone?: string; email?: string; displayName: string }
) {
  try {
    // Insert new user or Update if they exist (Failsafe Sync)
    await db.insert(users).values({
      firebaseUid,
      phone: data.phone,
      email: data.email,
      displayName: data.displayName,
      marketingConsent: false,
    }).onConflictDoUpdate({
      target: users.firebaseUid,
      set: {
        phone: data.phone, // We don't overwrite with null if they just signed in with Google
        email: data.email,
        displayName: data.displayName,
        updatedAt: new Date(),
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Database Sync Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches the user profile from PostgreSQL based on their Firebase UID.
 */
export async function getUserProfile(firebaseUid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    if (result.length > 0) {
      return { success: true, profile: result[0] };
    }
    return { success: true, profile: null };
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates a user's phone number securely in Postgres
 */
export async function updateUserPhone(firebaseUid: string, newPhone: string) {
  try {
    await db.update(users).set({ phone: newPhone, updatedAt: new Date() }).where(eq(users.firebaseUid, firebaseUid));
    return { success: true };
  } catch (error: any) {
    console.error("Update Phone Error:", error);
    return { success: false, error: error.message };
  }
}
