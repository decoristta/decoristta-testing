'use server'
import { db } from '@/db';
import { carts, cartItems, products, productMedia } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { getCurrentUser } from './auth';

export async function getCart() {
  const authResult = await getCurrentUser();
  const user = 'user' in authResult ? authResult.user : null;
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  let activeCart = null;

  if (user) {
    activeCart = await db.query.carts.findFirst({
      where: eq(carts.userId, user.id),
      with: {
        items: {
          with: {
            product: {
              with: { media: true }
            }
          },
          orderBy: (items, { asc }) => [asc(items.createdAt)]
        }
      }
    });
  }

  if (!activeCart && cartId) {
    activeCart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
      with: {
        items: {
          with: {
            product: {
              with: { media: true }
            }
          },
          orderBy: (items, { asc }) => [asc(items.createdAt)]
        }
      }
    });

    // If user is logged in but has no user cart, attach the guest cart
    if (activeCart && user && !activeCart.userId) {
      await db.update(carts).set({ userId: user.id }).where(eq(carts.id, cartId));
    }
  }

  return activeCart;
}

export async function addToCart(productId: string, quantity: number = 1) {
  const authResult = await getCurrentUser();
  const user = 'user' in authResult ? authResult.user : null;
  const cookieStore = await cookies();
  let cartId = cookieStore.get('cartId')?.value;
  let cart = await getCart();

  if (!cart) {
    // Create new cart
    const newCart = await db.insert(carts).values({
      userId: user?.id || null,
    }).returning();
    cartId = newCart[0].id;
    cart = { ...newCart[0], items: [] } as any;
    
    // Set cookie that expires in 30 days
    cookieStore.set('cartId', cartId as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });
  }

  // Check if item exists
  const existingItem = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
  });

  if (existingItem) {
    await db.update(cartItems)
      .set({ quantity: existingItem.quantity + quantity })
      .where(eq(cartItems.id, existingItem.id));
  } else {
    await db.insert(cartItems).values({
      cartId: cart.id,
      productId: productId,
      quantity: quantity
    });
  }

  return await getCart();
}

export async function updateCartItem(itemId: string, quantity: number) {
  if (quantity <= 0) {
    return await removeFromCart(itemId);
  }

  await db.update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, itemId));
    
  return await getCart();
}

export async function removeFromCart(itemId: string) {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  return await getCart();
}
