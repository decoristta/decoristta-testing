import Image from "next/image";
import styles from "./page.module.css";
import { getAllProducts } from "../lib/data";

import AllProducts from "../components/AllProducts";
import { ShieldCheck, Award, Home as HomeIcon, Gift } from 'lucide-react';

export default function Home() {
  const allProducts = getAllProducts();
  const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));

  return (
    <main style={{ backgroundColor: 'var(--color-light-bg)' }}>
      {/* Immersive CSS Carousel Hero Section */}
      <section className={styles.hero}>
        <div className={styles.carouselBackground}>
          <div className={`${styles.carouselSlide} ${styles.slide1}`}>
             <Image src="/images/hero-1.png" alt="Luxury Vintage Decor" fill priority className={styles.heroImage} />
          </div>
          <div className={`${styles.carouselSlide} ${styles.slide2}`}>
             <Image src="/images/hero-2.png" alt="Minimalist Modern Decor" fill priority className={styles.heroImage} />
          </div>
          <div className={`${styles.carouselSlide} ${styles.slide3}`}>
             <Image src="/images/hero-3.png" alt="Classic Emerald Decor" fill priority className={styles.heroImage} />
          </div>
          {/* A strong, elegant dark overlay to make the logo and white text POP */}
          <div className={styles.heroOverlayStrong} />
        </div>

        <div className={styles.heroContent}>
          <div className={`${styles.logoIcon} ${styles.illuminatedLogo}`} style={{ opacity: 1, position: 'relative', width: '350px', height: '120px' }}>
            <Image src="/images/logo.png" alt="Decoristta Logo" fill style={{ objectFit: 'contain' }} priority />
          </div>
          
          {/* Premium illuminated glow effect */}
          <h1 className={`heading-primary ${styles.illuminatedText}`} style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)' }}>
            Decoristta
          </h1>
          
          {/* Tagline wrapped with elegant dividers */}
          <div className={styles.taglineWrapper}>
            <div className={styles.taglineLine} />
            <p className={styles.subtitle} style={{ fontSize: '1.2rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              Style Your Story
            </p>
            <div className={styles.taglineLine} />
          </div>
          
          {/* New Glassmorphism CTA Button */}
          <button className={styles.glassButton}>
            Explore Collections
          </button>
        </div>

        {/* Animated Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <span className={styles.scrollText}>Scroll</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* Value Proposition Footer with Lucide Icons */}
      <section style={{ backgroundColor: 'var(--color-dark-surface)', padding: '2.5rem 0', borderTop: '1px solid rgba(197, 160, 89, 0.15)' }}>
        <div className="premium-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '4rem' }}>
          {[
            { Icon: ShieldCheck, text: 'Premium\nQuality' },
            { Icon: Award, text: 'Unique\nDesigns' },
            { Icon: HomeIcon, text: 'Perfect For\nEvery Space' },
            { Icon: Gift, text: 'Ideal For\nGifting' }
          ].map((item, i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--color-gold)' }}>
                  <item.Icon size={32} strokeWidth={1.2} />
                </div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                  {item.text}
                </span>
             </div>
          ))}
        </div>
      </section>

      {/* New All Products Layout */}
      <AllProducts products={allProducts} categories={uniqueCategories} />

    </main>
  );
}
