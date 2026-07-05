import { db } from './index';
import { eq, sql } from 'drizzle-orm';
import { orders, orderLines, inventory, payments, carts, cartItems, products } from './schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Demonstrates a fully atomic, transactional checkout flow with row-level locking.
 * This function ensures that inventory is not oversold under high concurrency.
 */
export async function processCheckout(userId: string, cartId: string, paymentAmount: number, idempotencyKey: string) {
  return await db.transaction(async (tx) => {
    // 0. Set Lock Timeout
    // Fail fast if we can't acquire the inventory lock within 2 seconds.
    // This prevents the connection pool from being exhausted by a queue of waiting transactions.
    await tx.execute(sql`SET LOCAL lock_timeout = '2000ms'`);

    // 1. Fetch Cart Items
    const items = await tx.select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      price: products.price,
      name: products.name,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 2. Calculate Total & Validate Amount
    const calculatedTotal = items.reduce((acc, item) => acc + (parseFloat(item.price as string) * item.quantity), 0);
    if (Math.abs(calculatedTotal - paymentAmount) > 0.01) {
      throw new Error('Payment amount does not match cart total');
    }

    // 3. Reserve Inventory using Row-Level Locking (SELECT ... FOR UPDATE)
    // This blocks other concurrent transactions trying to buy the same product
    for (const item of items) {
      // Execute explicit FOR UPDATE query for the specific product
      const [stock] = await tx.execute(
        sql`SELECT available_quantity FROM ${inventory} WHERE product_id = ${item.productId} FOR UPDATE`
      );

      if (!stock || (stock.available_quantity as number) < item.quantity) {
        throw new Error(`Insufficient inventory for product ${item.name}`);
      }

      // Decrement available and increment reserved
      await tx.update(inventory)
        .set({
          availableQuantity: sql`${inventory.availableQuantity} - ${item.quantity}`,
          reservedQuantity: sql`${inventory.reservedQuantity} + ${item.quantity}`,
          updatedAt: new Date()
        })
        .where(eq(inventory.productId, item.productId));
    }

    // 4. Create the Order
    const [newOrder] = await tx.insert(orders).values({
      userId,
      status: 'pending',
      totalAmount: calculatedTotal.toString(),
      // IP/Device fingerprint would be passed in from request headers
    }).returning();

    // 5. Create Immutable Order Lines (Snapshotting price and name)
    const orderLinesData = items.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      snapshotPrice: item.price,
      snapshotName: item.name,
      quantity: item.quantity,
    }));
    await tx.insert(orderLines).values(orderLinesData);

    // 6. Record the Payment Intent (Idempotent)
    // If idempotencyKey already exists, this will throw a unique constraint error, rolling back the transaction.
    await tx.insert(payments).values({
      orderId: newOrder.id,
      idempotencyKey,
      amount: paymentAmount.toString(),
      status: 'pending', // Awaiting external webhook capture
    });

    // 7. Clear the Cart
    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
    // Optionally delete the cart itself
    await tx.delete(carts).where(eq(carts.id, cartId));

    // Transaction is complete. If anything throws, the entire block (including inventory decrement) rolls back.
    return newOrder.id;
  });
}
