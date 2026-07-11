'use client';
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';
import { X, Minus, Plus, ShoppingBag, Trash2, Heart, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

export default function CartDrawer() {
  const { 
    cart, settings, isCartOpen, closeCart, updateItem, removeItem, handleGiftWrap, 
    handlePersonalMessage, handleApplyCoupon, handleRemoveCoupon, totalItems,
    subtotal, totalMRP, discountOnMRP, couponDiscount, giftWrapTotal, personalMessageTotal,
    convenienceFee, grandTotal, rewards 
  } = useCart();
  
  const [couponInput, setCouponInput] = useState('');
  const [isBillingExpanded, setIsBillingExpanded] = useState(false);

  if (!cart) return null;

  return (
    <>
      <div 
        className={`${styles.overlay} ${isCartOpen ? styles.open : ''}`} 
        onClick={closeCart}
      />
      <div className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>YOUR CART ({totalItems})</h2>
          <button className={styles.closeBtn} onClick={closeCart}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.banner}>
          For Trendsetting Homes
        </div>

        <div className={styles.content}>
          {cart.items.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is currently empty.</p>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {cart.items.map((item) => (
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
                    <div className={styles.itemTopRow}>
                      <h3 className={styles.itemName}>{item.product.name}</h3>
                      <div className={styles.itemPricing}>
                        <span className={styles.itemPrice}>₹{item.product.price}</span>
                        {(item.product.mrp || 0) > item.product.price && (
                           <span className={styles.itemMrp}>₹{item.product.mrp}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.itemActionsRow}>
                      <button className={styles.iconBtn} onClick={() => removeItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                      
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
                      
                      <button className={styles.iconBtn}>
                        <Heart size={16} />
                      </button>
                    </div>
                    
                    {/* Gift Wrap Addon */}
                    <div className={styles.addonWrap}>
                       <div className={styles.addonIconBox}>
                          <button 
                            className={styles.addonToggle} 
                            onClick={() => handleGiftWrap(item.id, !item.isGiftWrapped)}
                          >
                             {item.isGiftWrapped ? <Minus size={10} color="white"/> : <Plus size={10} color="white"/>}
                          </button>
                       </div>
                       <div className={styles.addonText}>
                          <span className={styles.addonTitle}>Gift Wrap</span>
                          <span className={styles.addonPrice}>
                             <strong>{item.isGiftWrapped ? 'Added' : 'Add'}</strong> ₹{settings.gift_wrap_fee || 25}
                          </span>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.items.length > 0 && (
            <>
              {/* Coupon Section */}
              <div className={styles.couponSection}>
                 {cart.coupon ? (
                   <div className={styles.appliedCoupon}>
                      <div className={styles.couponIcon}>%</div>
                      <div className={styles.couponDetails}>
                         <div className={styles.couponTitle}>Save ₹{couponDiscount}</div>
                         <div className={styles.couponCode}>with &apos;{cart.coupon.code}&apos;</div>
                      </div>
                      <button className={styles.removeCouponBtn} onClick={handleRemoveCoupon}>Remove</button>
                   </div>
                 ) : (
                   <div className={styles.applyCoupon}>
                      <div className={styles.couponInputWrapper}>
                        <div className={styles.couponIcon}>%</div>
                        <input 
                          type="text" 
                          placeholder="Enter coupon code" 
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value)}
                          className={styles.couponInput}
                        />
                      </div>
                      <button className={styles.applyBtn} onClick={() => handleApplyCoupon(couponInput)}>Apply</button>
                   </div>
                 )}
                 <div className={styles.moreOffers}>
                    <div className={styles.moreOffersLeft}>
                       <div className={styles.couponIconSmall}>%</div>
                       <span>+1 more offers</span>
                    </div>
                    <button className={styles.viewCouponsBtn}>View all coupons &gt;</button>
                 </div>
              </div>
              
              {/* Rewards */}
              <div className={styles.rewardsBox}>
                 <span className={styles.rewardsTitle}>Rewards</span>
                 <span className={styles.rewardsText}>Earn ₹ {rewards} with this purchase</span>
              </div>
              
              {/* Personalized Message */}
              <div className={styles.personalMessageBox} onClick={() => handlePersonalMessage(!cart.hasPersonalMessage)}>
                 <div className={styles.pmLeft}>
                    <span>Add personalized message (₹{settings.personal_message_fee || 20})</span>
                 </div>
                 <div>
                    {cart.hasPersonalMessage ? <Minus size={20}/> : <Plus size={20}/>}
                 </div>
              </div>
            </>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className={styles.footerContainer}>
             <div className={styles.footerSummary} onClick={() => setIsBillingExpanded(!isBillingExpanded)}>
                <div className={styles.footerLeft}>
                   <MessageSquare size={18} />
                   <span>Estimated total</span>
                </div>
                <div className={styles.footerRight}>
                   <div className={styles.footerPrices}>
                      {discountOnMRP > 0 && <span className={styles.footerOldPrice}>₹{totalMRP}</span>}
                      <span className={styles.footerNewPrice}>₹{grandTotal}</span>
                   </div>
                   {discountOnMRP > 0 && <div className={styles.footerSavings}>You saved ₹{discountOnMRP}!</div>}
                   <div className={styles.expandIcon}>
                      {isBillingExpanded ? <ChevronDown size={20} color="white" /> : <ChevronUp size={20} color="white" />}
                   </div>
                </div>
             </div>
             
             {isBillingExpanded && (
               <div className={styles.billingDetails}>
                  <div className={styles.billingRow}>
                    <span>Total MRP</span>
                    <span>₹{totalMRP}</span>
                  </div>
                  <div className={styles.billingRow}>
                    <span>Delivery fee</span>
                    <span>To be calculated</span>
                  </div>
                  <div className={`${styles.billingRow} ${styles.discountText}`}>
                    <span>Discount on MRP</span>
                    <span>₹{discountOnMRP}</span>
                  </div>
                  <div className={`${styles.billingRow} ${styles.discountText}`}>
                    <span>Coupon discount</span>
                    <span>₹{couponDiscount}</span>
                  </div>
                  <div className={styles.billingRow}>
                    <span>Convenience Fee</span>
                    <span>₹{convenienceFee}</span>
                  </div>
                  <div className={`${styles.billingRow} ${styles.grandTotalRow}`}>
                    <span>Grand total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                  {discountOnMRP + couponDiscount > 0 && (
                    <div className={styles.billingSavingsFooter}>
                      You Saved ₹{discountOnMRP + couponDiscount} ({Math.round(((discountOnMRP + couponDiscount) / totalMRP) * 100)}%) so far!
                    </div>
                  )}
               </div>
             )}
             
             <div className={styles.checkoutWrapper}>
               <button className={styles.checkoutBtn}>
                 Checkout
               </button>
             </div>
          </div>
        )}
      </div>
    </>
  );
}
