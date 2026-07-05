"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Check, Lock, StarHalf } from 'lucide-react';
import styles from './page.module.css';
import { Product } from '@/components/ProductCard';

interface ProductClientProps {
  product: Product;
  thumbUrls: string[];
}

export default function ProductClient({ product, thumbUrls }: ProductClientProps) {
  const getCategorySpecifics = (cat: string) => {
    switch (cat) {
      case 'Lighting':
        return {
          sizes: ['Standard', 'Large'],
          features: ['Energy efficient', 'Warm ambient glow', 'Premium metallic finish', '2-year warranty'],
          desc1: `This beautiful ${product.title.toLowerCase()} is crafted to illuminate your space with a warm, inviting glow. Its structural base and premium finish ensure it functions as both a light source and a sculptural piece.`,
          desc2: `Experience the perfect balance of form and function. Designed with modern aesthetics in mind, this lamp seamlessly elevates any bedside, console, or reading nook.`,
          specs: [
            { label: 'Material', value: 'Brass & Ceramic' },
            { label: 'Bulb', value: 'E27 (Not included)' },
            { label: 'Care', value: 'Wipe clean with a soft dry cloth' }
          ]
        };
      case 'Vases':
        return {
          sizes: ['Small', 'Medium', 'Tall'],
          features: ['Hand-crafted ceramic', 'Water-tight interior', 'Matte exterior finish', 'Unique sculptural form'],
          desc1: `This sculptural ${product.title.toLowerCase()} brings an organic, earthy texture to your home. Hand-finished by artisans, each piece has subtle variations that make it completely unique.`,
          desc2: `Whether styled on its own as a statement object or filled with fresh botanicals, its timeless silhouette complements any room.`,
          specs: [
            { label: 'Material', value: 'High-fired Ceramic' },
            { label: 'Finish', value: 'Matte texture' },
            { label: 'Care', value: 'Hand wash recommended' }
          ]
        };
      case 'Clocks':
        return {
          sizes: ['Standard'],
          features: ['Silent sweep movement', 'Minimalist dial', 'Solid wood frame', 'Battery operated'],
          desc1: `A masterclass in minimal design, this ${product.title.toLowerCase()} makes keeping track of time a beautiful experience. The precise, silent movement ensures no ticking sounds.`,
          desc2: `With clean lines and high-quality materials, it serves as a functional piece of wall art for your living room, kitchen, or office.`,
          specs: [
            { label: 'Movement', value: 'Quartz silent sweep' },
            { label: 'Material', value: 'Wood & Glass' },
            { label: 'Power', value: '1x AA Battery (not included)' }
          ]
        };
      case 'Candle Stands':
        return {
          sizes: ['Single', 'Set of 2'],
          features: ['Solid cast metal', 'Weighted base', 'Fits standard tapers', 'Tarnish resistant'],
          desc1: `Set the mood with this elegant ${product.title.toLowerCase()}. Its striking silhouette and weighted base provide both stability and visual interest to your dining table or mantle.`,
          desc2: `Perfect for intimate dinners or relaxed evenings, the carefully considered design reflects candlelight beautifully.`,
          specs: [
            { label: 'Material', value: 'Cast Iron / Brass' },
            { label: 'Fit', value: 'Standard taper candles' },
            { label: 'Care', value: 'Wipe with damp cloth' }
          ]
        };
      case 'Decor':
      default:
        return {
          sizes: ['Standard'],
          features: ['Artisan crafted', 'Premium finish', 'Unique conversation piece', 'Carefully packaged'],
          desc1: `This beautiful ${product.title.toLowerCase()} is crafted with care and designed to seamlessly blend into any interior aesthetic. Built for longevity, it ensures that your space remains stylish for years to come.`,
          desc2: `Experience the perfect balance of form and function. Every detail has been meticulously considered to provide you with the utmost quality.`,
          specs: [
            { label: 'Material', value: 'Mixed premium materials' },
            { label: 'Care', value: 'Wipe clean with a damp cloth' },
            { label: 'Origin', value: 'Hand-finished' }
          ]
        };
    }
  };

  const catSpecs = getCategorySpecifics(product.category);

  const [quantity, setQuantity] = useState(1);
  const [activeSize, setActiveSize] = useState(catSpecs.sizes[0]);
  const [activeColor, setActiveColor] = useState('default');
  const [activeTab, setActiveTab] = useState('Description');
  const [activeImage, setActiveImage] = useState(product.image);

  const colors = [
    { id: 'default', hex: '#d9d1c7' },
    { id: 'brown', hex: '#8c5a2b' },
    { id: 'black', hex: '#222222' }
  ];
  
  const tabs = ['Description', 'Dimensions', 'Materials & care', 'Shipping'];
  
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 !== 0;

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> <span>/</span> 
        <Link href="#">{product.category}</Link> <span>/</span> 
        <span>{product.title}</span>
      </div>

      {/* TOP SECTION */}
      <section className={styles.topSection}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageContainer}>
            <span className={styles.badgeNew}>New</span>
            <button className={styles.heartBtn} aria-label="Add to wishlist">
              <Heart size={24} strokeWidth={1.5} />
            </button>
            <img src={activeImage} alt={product.title} className={styles.mainImage} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div className={styles.thumbnailList}>
            {thumbUrls.map((url, i) => (
              <div 
                key={i} 
                className={`${styles.thumbnailContainer} ${activeImage === url ? styles.active : ''}`}
                onClick={() => setActiveImage(url)}
              >
                <img src={url} alt={`Thumb ${i}`} className={styles.thumbnail} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <span className={styles.categoryPill}>{product.category}</span>
          <h1 className={styles.title}>{product.title}</h1>
          <p className={styles.subtitle}>Premium {product.category.toLowerCase()} designed to elevate your space.</p>
          
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => {
                if (i < fullStars) return <Star key={i} size={16} fill="currentColor" strokeWidth={0} />;
                if (i === fullStars && hasHalfStar) return <StarHalf key={i} size={16} fill="currentColor" strokeWidth={0} />;
                return <Star key={i} size={16} fill="none" strokeWidth={2} stroke="currentColor" style={{ opacity: 0.3 }} />;
              })}
            </div>
            <span className={styles.ratingText}>{product.rating} ({product.reviews})</span>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.price}>${product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className={styles.oldPrice}>${product.oldPrice.toLocaleString()}</span>
            )}
            {product.discount && (
              <span className={styles.saveBadge}>Save {product.discount}%</span>
            )}
          </div>

          <div className={styles.sectionLabel}>Colour</div>
          <div className={styles.colourSelector}>
            {colors.map(c => (
              <button 
                key={c.id} 
                className={`${styles.colourOption} ${activeColor === c.id ? styles.active : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setActiveColor(c.id)}
                aria-label={`Select ${c.id}`}
              />
            ))}
          </div>

          <div className={styles.sectionLabel}>Size</div>
          <div className={styles.sizeSelector}>
            {catSpecs.sizes.map(s => (
              <button 
                key={s}
                className={`${styles.sizePill} ${activeSize === s ? styles.active : ''}`}
                onClick={() => setActiveSize(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <div className={styles.quantity}>
              <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className={styles.addBtn}>
              Add to cart <Lock size={16} />
            </button>
          </div>

          <button className={styles.wishlistBtn}>
            <Heart size={16} /> Add to wishlist
          </button>

          <ul className={styles.features}>
            {catSpecs.features.map((feature, i) => (
              <li key={i} className={styles.feature}>
                <Check size={16} className={styles.featureIcon} strokeWidth={3} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MIDDLE SECTION: Tabs */}
      <section className={styles.tabsContainer}>
        <div className={styles.tabsInner}>
          <div className={styles.tabList}>
            {tabs.map(tab => (
              <button 
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className={styles.tabContent}>
            <div className={styles.tabText}>
              <p>{catSpecs.desc1}</p>
              <p>{catSpecs.desc2}</p>
            </div>
            <div className={styles.specsList}>
              {catSpecs.specs.map((spec, i) => (
                <div key={i} className={styles.specItem}>
                  <div className={styles.specLabel}>{spec.label}</div>
                  <div className={styles.specValue}>{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION: Reviews */}
      <section className={styles.reviewsSection}>
        <h2 className={styles.reviewsHeader}>Customer reviews</h2>
        
        <div className={styles.reviewsSummary}>
          <div className={styles.scoreLeft}>
            <div className={styles.bigScore}>{product.rating}</div>
            <div className={styles.scoreStars}>
              {[...Array(5)].map((_, i) => {
                if (i < fullStars) return <Star key={i} size={16} fill="currentColor" strokeWidth={0} />;
                if (i === fullStars && hasHalfStar) return <StarHalf key={i} size={16} fill="currentColor" strokeWidth={0} />;
                return <Star key={i} size={16} fill="none" strokeWidth={2} stroke="currentColor" style={{ opacity: 0.3 }} />;
              })}
            </div>
            <div className={styles.scoreText}>Based on {product.reviews} reviews</div>
          </div>
          
          <div className={styles.barsRight}>
            {[
              { star: 5, pct: '78%' },
              { star: 4, pct: '16%' },
              { star: 3, pct: '4%' },
              { star: 2, pct: '1%' },
              { star: 1, pct: '1%' }
            ].map(row => (
              <div key={row.star} className={styles.barRow}>
                <span className={styles.barLabel}>{row.star}</span>
                <div className={styles.barContainer}>
                  <div className={styles.barFill} style={{ width: row.pct }}></div>
                </div>
                <span className={styles.barPct}>{row.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.reviewsGrid}>
          {[
            {
              id: 1,
              title: 'Worth every penny',
              text: 'Sturdy, beautifully made, and exactly as pictured. Absolutely love it.',
              user: 'Maya R.',
              initial: 'M'
            },
            {
              id: 2,
              title: 'Perfect addition to our home',
              text: 'The quality is fantastic. Delivery team was careful and tidy — genuinely impressed.',
              user: 'Theo B.',
              initial: 'T'
            },
            {
              id: 3,
              title: 'Lovely piece, slow delivery',
              text: 'The item itself is excellent. Shipping took a little longer than the estimate, but support kept us updated.',
              user: 'Priya N.',
              initial: 'P',
              stars: 4
            }
          ].map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < (review.stars || 5) ? "currentColor" : "none"} strokeWidth={i < (review.stars || 5) ? 0 : 1} />
                ))}
              </div>
              <h4 className={styles.reviewTitle}>{review.title}</h4>
              <p className={styles.reviewText}>{review.text}</p>
              <div className={styles.reviewUser}>
                <div className={styles.userAvatar}>{review.initial}</div>
                <span className={styles.userName}>{review.user}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
