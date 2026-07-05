"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Syncs a user profile from Firebase Auth to the PostgreSQL database.
 * This is called after a user completes the signup/profile step.
 */
export async function syncUserToDatabase(
  firebaseUid: string,
  data: { phone?: string; email?: string; displayName: string }
) {
  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));

    if (existing.length > 0) {
      // Update existing
      await db.update(users)
        .set({
          phone: data.phone || existing[0].phone,
          email: data.email || existing[0].email,
          displayName: data.displayName,
          updatedAt: new Date(),
        })
        .where(eq(users.firebaseUid, firebaseUid));
    } else {
      // Insert new user
      await db.insert(users).values({
        firebaseUid,
        phone: data.phone,
        email: data.email,
        displayName: data.displayName,
        marketingConsent: false, // Default to false, could add to UI later
      });
    }

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
