'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, toggleGiftWrap, togglePersonalMessage, applyCoupon, removeCoupon, getCartSettings } from '@/app/actions/cart';

type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  isGiftWrapped: boolean;
  product: {
    id: string;
    name: string;
    price: number;
    mrp: number | null;
    media: { url: string }[];
  }
};

type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
};

type Cart = {
  id: string;
  userId: string | null;
  hasPersonalMessage: boolean;
  appliedCouponId: string | null;
  coupon?: Coupon | null;
  items: CartItem[];
};

type CartSettings = Record<string, number>;

type CartContextType = {
  cart: Cart | null;
  settings: CartSettings;
  isCartOpen: boolean;
  isLoading: boolean;
  
  // Billing Totals
  totalItems: number;
  subtotal: number;
  totalMRP: number;
  discountOnMRP: number;
  couponDiscount: number;
  giftWrapTotal: number;
  personalMessageTotal: number;
  convenienceFee: number;
  grandTotal: number;
  rewards: number;
  
  // Actions
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // New Actions
  handleGiftWrap: (itemId: string, isWrapped: boolean) => Promise<void>;
  handlePersonalMessage: (hasMessage: boolean) => Promise<void>;
  handleApplyCoupon: (code: string) => Promise<{success: boolean, error?: string}>;
  handleRemoveCoupon: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [settings, setSettings] = useState<CartSettings>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const [cartData, settingsData] = await Promise.all([
        getCart(),
        getCartSettings()
      ]);
      setCart(cartData as any);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculations
  const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  // Subtotal based on discounted/launch price
  const subtotal = cart?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;
  
  // Total MRP (before any discount, fallback to price if mrp is missing)
  const totalMRP = cart?.items.reduce((acc, item) => acc + ((item.product.mrp || item.product.price) * item.quantity), 0) || 0;
  
  // Product level discount (MRP - Subtotal)
  const discountOnMRP = totalMRP - subtotal;
  
  // Coupon Discount
  let couponDiscount = 0;
  if (cart?.coupon) {
    if (cart.coupon.discountType === 'percentage') {
      couponDiscount = (subtotal * cart.coupon.discountValue) / 100;
    } else {
      couponDiscount = cart.coupon.discountValue;
    }
    // Cannot discount more than subtotal
    if (couponDiscount > subtotal) couponDiscount = subtotal;
  }
  
  // Add-ons
  const giftWrapFeePerItem = settings.gift_wrap_fee || 25;
  const giftWrapTotal = cart?.items.reduce((acc, item) => acc + (item.isGiftWrapped ? giftWrapFeePerItem * item.quantity : 0), 0) || 0;
  
  const personalMessageFee = settings.personal_message_fee || 20;
  const personalMessageTotal = cart?.hasPersonalMessage ? personalMessageFee : 0;
  
  const convenienceFee = settings.convenience_fee || 14;
  
  const grandTotal = subtotal - couponDiscount + giftWrapTotal + personalMessageTotal + (cart?.items.length ? convenienceFee : 0);
  
  const rewards = parseFloat((grandTotal * 0.01).toFixed(2)); // 1% reward points

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = async (productId: string, quantity = 1) => {
    try {
      const updatedCart = await addToCart(productId, quantity);
      setCart(updatedCart as any);
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

  const handleGiftWrap = async (itemId: string, isWrapped: boolean) => {
    const updatedCart = await toggleGiftWrap(itemId, isWrapped);
    setCart(updatedCart as any);
  };

  const handlePersonalMessage = async (hasMessage: boolean) => {
    const updatedCart = await togglePersonalMessage(hasMessage);
    setCart(updatedCart as any);
  };

  const handleApplyCoupon = async (code: string) => {
    const res = await applyCoupon(code);
    if (res.success && res.cart) {
      setCart(res.cart as any);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const handleRemoveCoupon = async () => {
    const updatedCart = await removeCoupon();
    setCart(updatedCart as any);
  };

  return (
    <CartContext.Provider value={{
      cart,
      settings,
      isCartOpen,
      isLoading,
      totalItems,
      subtotal,
      totalMRP,
      discountOnMRP,
      couponDiscount,
      giftWrapTotal,
      personalMessageTotal,
      convenienceFee,
      grandTotal,
      rewards,
      openCart,
      closeCart,
      addItem,
      updateItem,
      removeItem,
      refreshCart: fetchCart,
      handleGiftWrap,
      handlePersonalMessage,
      handleApplyCoupon,
      handleRemoveCoupon
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
