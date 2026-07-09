"use server";

import { db } from "@/db";
import { users, addresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUid } from "@/lib/session";

/**
 * Gets the internal Postgres User ID for the currently signed-in user
 * (Firebase UID comes from the verified session, never from client input).
 */
async function getCurrentUserId() {
  const firebaseUid = await requireUid();
  const result = await db.select({ id: users.id }).from(users).where(eq(users.firebaseUid, firebaseUid));
  if (result.length === 0) throw new Error("User not found in Postgres");
  return result[0].id;
}

/**
 * Fetches all addresses for the currently signed-in user
 */
export async function getUserAddresses() {
  try {
    const userId = await getCurrentUserId();
    const result = await db.select().from(addresses).where(eq(addresses.userId, userId));
    return { success: true, addresses: result };
  } catch (error: any) {
    console.error("Fetch Addresses Error:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}

/**
 * Adds a new address for the currently signed-in user
 */
export async function addAddress(data: {
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}) {
  try {
    // Basic validation
    if (!/^\d{6}$/.test(data.pincode)) {
      return { success: false, error: "Pincode must be exactly 6 digits" };
    }

    const userId = await getCurrentUserId();

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
    return { success: false, error: "Failed to save address" };
  }
}

/**
 * Updates an address, scoped to the currently signed-in user
 */
export async function updateAddress(addressId: string, data: {
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}) {
  try {
    if (!/^\d{6}$/.test(data.pincode)) {
      return { success: false, error: "Pincode must be exactly 6 digits" };
    }

    const userId = await getCurrentUserId();

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
    return { success: false, error: "Failed to update address" };
  }
}

/**
 * Deletes an address, scoped to the currently signed-in user
 */
export async function deleteAddress(addressId: string) {
  try {
    const userId = await getCurrentUserId();
    await db.delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Address Error:", error);
    return { success: false, error: "Failed to delete address" };
  }
}
