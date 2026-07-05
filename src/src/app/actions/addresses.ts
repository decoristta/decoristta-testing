"use server";

import { db } from "@/db";
import { users, addresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Gets the internal Postgres User ID from a Firebase UID
 */
async function getUserIdFromFirebase(firebaseUid: string) {
  const result = await db.select({ id: users.id }).from(users).where(eq(users.firebaseUid, firebaseUid));
  if (result.length === 0) throw new Error("User not found in Postgres");
  return result[0].id;
}

/**
 * Fetches all addresses for a user
 */
export async function getUserAddresses(firebaseUid: string) {
  try {
    const userId = await getUserIdFromFirebase(firebaseUid);
    const result = await db.select().from(addresses).where(eq(addresses.userId, userId));
    return { success: true, addresses: result };
  } catch (error: any) {
    console.error("Fetch Addresses Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Adds a new address
 */
export async function addAddress(firebaseUid: string, data: {
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}) {
  try {
    // Basic validation
    if (!/^\d{6}$/.test(data.pincode)) {
      throw new Error("Pincode must be exactly 6 digits");
    }

    const userId = await getUserIdFromFirebase(firebaseUid);
    
    // Check if it's the first address to make it default
    const existing = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, userId));
    const isDefault = existing.length === 0;

    await db.insert(addresses).values({
      userId,
      addressLine: data.addressLine,
      landmark: data.landmark || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault,
    });

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error("Add Address Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates an address
 */
export async function updateAddress(firebaseUid: string, addressId: string, data: {
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}) {
  try {
    if (!/^\d{6}$/.test(data.pincode)) {
      throw new Error("Pincode must be exactly 6 digits");
    }

    const userId = await getUserIdFromFirebase(firebaseUid);

    await db.update(addresses)
      .set({
        addressLine: data.addressLine,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        updatedAt: new Date(),
      })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId))); // Ensure they own it

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error("Update Address Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Deletes an address
 */
export async function deleteAddress(firebaseUid: string, addressId: string) {
  try {
    const userId = await getUserIdFromFirebase(firebaseUid);
    await db.delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
    
    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Address Error:", error);
    return { success: false, error: error.message };
  }
}
