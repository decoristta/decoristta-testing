import Image from "next/image";
import styles from "./page.module.css";
import fs from "fs";
import path from "path";

import CategoryGallery from "../components/CategoryGallery";

// Premium mapping for category folders
const categoryConfig: Record<string, { title: string, tagline: string }> = {
  'Candle stand ': { title: 'Luminous Accents', tagline: 'Flickering elegance to warm your most cherished spaces.' },
  'Lamps': { title: 'Sculptural Illumination', tagline: 'Artistic lighting designs that transform any corner into a statement.' },
  'Showpieces': { title: 'Curated Artifacts', tagline: 'Handcrafted masterworks designed to spark conversation.' },
  'Vases': { title: 'The Art of Elegance', tagline: 'Discover silhouettes that bring charm and character to your home.' },
  'clock': { title: 'Timeless Heritage', tagline: 'Classic timepieces that echo the grandeur of history.' }
};

// Helper to get all categories directly from the folder names
function getCategories() {
  const categoriesPath = path.join(process.cwd(), 'public', 'Product images');
  try {
    return fs.readdirSync(categoriesPath).filter(file => {
      if (file.startsWith('.')) return false; // Ignore .DS_Store
      return fs.statSync(path.join(categoriesPath, file)).isDirectory();
    });
  } catch (error) {
    console.error("Error reading categories:", error);
    return [];
  }
}

// Helper function to read images dynamically
function getImages(category: string) {
  const dirPath = path.join(process.cwd(), 'public', 'Product images', category);
  try {
    const files = fs.readdirSync(dirPath);
    return files
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      .map(file => `/Product images/${category}/${file}`);
  } catch (error) {
    return [];
  }
}

import { ShieldCheck, Award, Home as HomeIcon, Gift } from 'lucide-react';

export default function Home() {
  const categories = getCategories();
  
  // Array of 3 distinct, high-end editorial CSS grid layouts
  const gridLayouts = [styles.editorialGridA, styles.editorialGridB, styles.editorialGridC];

  return (
    <main>
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

      {/* Dynamic Sections Based on Folder Names with Varied Editorial Grids */}
      {categories.map((category, index) => {
        const images = getImages(category);
        if (images.length === 0) return null;

        const config = categoryConfig[category] || { title: category.trim(), tagline: 'Explore our premium collection.' };

        // Alternate colors for a luxury feel
        const isDark = index % 2 === 0;
        const themeClass = isDark ? styles.dark : styles.light;
        
        // Cycle through the 3 different grid layouts
        const selectedGridLayout = gridLayouts[index % gridLayouts.length];
        
        // Adjust slice depending on the grid layout to perfectly fill the block
        // Layout A looks best with 7, Layout B with 5, Layout C with 6
        const sliceCount = (index % 3 === 0) ? 7 : (index % 3 === 1) ? 5 : 6;
        
        return (
          <CategoryGallery
            key={category}
            category={category}
            config={config}
            images={images}
            themeClass={themeClass}
            isDark={isDark}
            layoutStyle={selectedGridLayout}
            sliceCount={sliceCount}
          />
        );
      })}

    </main>
  );
}
