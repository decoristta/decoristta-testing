"use server";

import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/session";

/**
 * Fetches all addresses for the currently signed-in user
 */
export async function getUserAddresses() {
  try {
    const userId = await requireUserId();
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
    if (!/^\d{6}$/.test(data.pincode)) {
      return { success: false, error: "Pincode must be exactly 6 digits" };
    }

    const userId = await requireUserId();

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

    const userId = await requireUserId();

    await db.update(addresses)
      .set({
        addressLine: data.addressLine,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        updatedAt: sql`now()`,
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
    const userId = await requireUserId();
    await db.delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Address Error:", error);
    return { success: false, error: "Failed to delete address" };
  }
}
