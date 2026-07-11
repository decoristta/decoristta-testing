'use client';
import React from 'react';
import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateItem, removeItem, subtotal } = useCart();

  if (!cart) return null;

  return (
    <>
      <div 
        className={`${styles.overlay} ${isCartOpen ? styles.open : ''}`} 
        onClick={closeCart}
      />
      <div className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart</h2>
          <button className={styles.closeBtn} onClick={closeCart}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {cart.items.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is currently empty.</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  {item.product.media && item.product.media[0] ? (
                    <Image 
                      src={item.product.media[0].url} 
                      alt={item.product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : null}
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemTop}>
                    <h3 className={styles.itemName}>{item.product.name}</h3>
                    <span className={styles.itemPrice}>₹{item.product.price}</span>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button 
                        className={styles.qtyBtn}
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button 
                        className={styles.qtyBtn}
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <button className={styles.checkoutBtn}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
