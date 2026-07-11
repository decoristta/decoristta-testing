'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart } from '@/app/actions/cart';

type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    media: { url: string }[];
  }
};

type Cart = {
  id: string;
  userId: string | null;
  items: CartItem[];
};

type CartContextType = {
  cart: Cart | null;
  isCartOpen: boolean;
  isLoading: boolean;
  totalItems: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const data = await getCart();
      setCart(data as any);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal = cart?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = async (productId: string, quantity = 1) => {
    try {
      const updatedCart = await addToCart(productId, quantity);
      setCart(updatedCart as any);
      openCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await updateCartItem(itemId, quantity);
      setCart(updatedCart as any);
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const updatedCart = await removeFromCart(itemId);
      setCart(updatedCart as any);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      isLoading,
      totalItems,
      subtotal,
      openCart,
      closeCart,
      addItem,
      updateItem,
      removeItem,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
