"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/components/ProductCard";
import styles from "./page.module.css";
import { ShoppingBag, ChevronDown, ChevronUp, MapPin, Truck, Star, Info, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function ProductClient({ product }: { product: Product }) {
  const { user, openAuthModal } = useAuth();
  const { addItem } = useCart();
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [thumbnailOffset, setThumbnailOffset] = useState(0);
  
  // Auto-slide carousel
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextThumbnails = () => {
    if (thumbnailOffset + 4 < images.length) {
      setThumbnailOffset(prev => prev + 1);
    }
  };

  const prevThumbnails = () => {
    if (thumbnailOffset > 0) {
      setThumbnailOffset(prev => prev - 1);
    }
  };

  // Accordion State
  const [openSection, setOpenSection] = useState<string | null>("description");

  // Quantity State
  const [quantity, setQuantity] = useState(1);

  // Pincode State
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [deliveryMessage, setDeliveryMessage] = useState("");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handlePincodeCheck = async () => {
    if (pincode.length !== 6) return;
    setPincodeStatus("loading");
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        const location = `${postOffice.District}, ${postOffice.State}`;
        setPincodeStatus("success");
        setDeliveryMessage(`Delivery available to ${location} by ` + new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      } else {
        setPincodeStatus("error");
        setDeliveryMessage("Invalid pincode or not serviceable.");
      }
    } catch (e) {
      setPincodeStatus("error");
      setDeliveryMessage("Error checking pincode.");
    }
  };

  const handleQuantity = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => prev > 1 ? prev - 1 : 1);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/">{product.category}</Link>
        <span>/</span>
        <span className={styles.currentCrumb}>{product.title}</span>
      </nav>

      <div className={styles.container}>
        <div className={styles.imageGallery}>
          <div className={styles.mainImageContainer}>
            {images.length > 1 && (
              <button onClick={prevImage} className={`${styles.navArrow} ${styles.navLeft}`} aria-label="Previous image">
                <ChevronLeft size={24} />
              </button>
            )}
            <Image 
              src={activeImage} 
              alt={product.title} 
              fill 
              className={styles.mainImage}
              priority
            />
            {images.length > 1 && (
              <button onClick={nextImage} className={`${styles.navArrow} ${styles.navRight}`} aria-label="Next image">
                <ChevronRight size={24} />
              </button>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbnailWrapper}>
              {images.length > 4 && (
                <button onClick={prevThumbnails} disabled={thumbnailOffset === 0} className={styles.thumbArrow} aria-label="Previous thumbnails">
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className={styles.thumbnails}>
                {images.slice(thumbnailOffset, thumbnailOffset + 4).map((img, idx) => {
                  const actualIdx = thumbnailOffset + idx;
                  return (
                    <div 
                      key={actualIdx} 
                      className={`${styles.thumbnailContainer} ${activeIndex === actualIdx ? styles.active : ''}`}
                      onClick={() => setActiveIndex(actualIdx)}
                    >
                      <Image src={img} alt={`Thumbnail ${actualIdx}`} fill className={styles.thumbnailImage} />
                    </div>
                  );
                })}
              </div>
              {images.length > 4 && (
                <button onClick={nextThumbnails} disabled={thumbnailOffset + 4 >= images.length} className={styles.thumbArrow} aria-label="Next thumbnails">
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className={styles.details}>
          <h1 className={styles.title}>{product.title}</h1>
          
          <div className={styles.ratingSummary}>
             <Star size={16} fill="var(--color-gold)" strokeWidth={0} />
             <Star size={16} fill="var(--color-gold)" strokeWidth={0} />
             <Star size={16} fill="var(--color-gold)" strokeWidth={0} />
             <Star size={16} fill="var(--color-gold)" strokeWidth={0} />
             <Star size={16} fill="var(--color-gold)" strokeWidth={0} />
             <span>(No reviews yet)</span>
          </div>

          <div className={styles.priceContainer}>
            <span className={styles.price}>₹{product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className={styles.mrp}>₹{product.oldPrice.toLocaleString()}</span>
            )}
            {product.customerSaves && product.customerSaves > 0 && (
               <span className={styles.saves}>-{product.discount || 25}%</span>
            )}
          </div>

          <div className={styles.actionRow}>
            <div className={styles.quantityControl}>
              <button onClick={() => handleQuantity('dec')} className={styles.qtyBtn} aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button onClick={() => handleQuantity('inc')} className={styles.qtyBtn} aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.addToCartBtn}
                onClick={() => addItem(product.id, quantity)}
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>
              <button className={styles.buyNowBtn}>
                Buy Now
              </button>
            </div>
          </div>

          {/* Pincode Checker */}
          <div className={styles.pincodeSection}>
            <div className={styles.pincodeHeader}>
              <Truck size={18} />
              <span>Check delivery time and availability</span>
            </div>
            <div className={styles.pincodeInputGroup}>
              <input 
                type="text" 
                placeholder="Enter Pincode" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={styles.pincodeInput}
              />
              <button 
                onClick={handlePincodeCheck} 
                disabled={pincode.length !== 6 || pincodeStatus === 'loading'}
                className={styles.pincodeBtn}
              >
                {pincodeStatus === 'loading' ? 'Checking...' : 'Check'}
              </button>
            </div>
            {pincodeStatus === 'success' && <p className={styles.pincodeSuccess}>{deliveryMessage}</p>}
            {pincodeStatus === 'error' && <p className={styles.pincodeError}>{deliveryMessage}</p>}
          </div>

          {/* Accordions */}
          <div className={styles.accordions}>
            <div className={styles.accordionItem}>
              <button className={styles.accordionHeader} onClick={() => toggleSection("description")}>
                Description
                {openSection === "description" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === "description" && (
                <div className={styles.accordionContent}>
                  <div className={styles.descriptionText}>
                    <p>
                      {product.description && product.description.length > 250 && !isDescriptionExpanded 
                        ? product.description.substring(0, 250) + "..." 
                        : product.description}
                    </p>
                    {(isDescriptionExpanded || (product.description && product.description.length <= 250)) && (
                      <div className={styles.extraDesc}>
                        {product.material && <p><strong>Material:</strong> {product.material}</p>}
                        {product.dimensions && <p><strong>Dimensions:</strong> {product.dimensions}</p>}
                        {product.color && <p><strong>Color:</strong> {product.color}</p>}
                        <p><strong>Origin:</strong> {product.origin || "Made in PRC"}</p>
                      </div>
                    )}
                  </div>
                  {product.description && product.description.length > 250 && (
                    <button 
                      className={styles.readMoreBtn} 
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                      {isDescriptionExpanded ? "Read Less" : "Read More"}
                    </button>
                  )}
                </div>
              )}
            </div>


            <div className={styles.accordionItem}>
              <button className={styles.accordionHeader} onClick={() => toggleSection("shipping")}>
                Shipping & Returns
                {openSection === "shipping" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === "shipping" && (
                <div className={styles.accordionContent}>
                  <p>We offer free standard shipping on all orders above ₹2,000. Orders are typically processed within 1-2 business days.</p>
                  <p style={{ marginTop: '10px' }}>Returns are accepted within 7 days of delivery for unused items in original packaging.</p>
                </div>
              )}
            </div>
            
            <div className={styles.accordionItem}>
              <button className={styles.accordionHeader} onClick={() => toggleSection("care")}>
                Care Instructions
                {openSection === "care" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openSection === "care" && (
                <div className={styles.accordionContent}>
                  <p>Wipe clean with a soft, dry cloth. Avoid using harsh chemicals or abrasive cleaners as they may damage the premium finish.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <h2>Customer Reviews</h2>
          <div className={styles.reviewsOverall}>
            <div className={styles.starsLarge}>
               <Star size={24} fill="var(--color-gold)" strokeWidth={0} />
               <Star size={24} fill="var(--color-gold)" strokeWidth={0} />
               <Star size={24} fill="var(--color-gold)" strokeWidth={0} />
               <Star size={24} fill="var(--color-gold)" strokeWidth={0} />
               <Star size={24} fill="var(--color-gold)" strokeWidth={0} />
            </div>
            <span>0 Reviews</span>
          </div>
        </div>
        
        <div className={styles.reviewsContent}>
          <div className={styles.emptyReviews}>
            <Info size={40} className={styles.emptyIcon} />
            <h3>No reviews yet</h3>
            <p>We value authentic feedback. Only customers who have purchased this item can leave a review.</p>
            <button 
              className={styles.writeReviewBtn}
              onClick={() => {
                if (!user) {
                  openAuthModal();
                } else {
                  alert("You must have purchased this product to leave a review.");
                }
              }}
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
