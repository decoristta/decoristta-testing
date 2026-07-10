import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { getAllProducts } from "../lib/data";

import AllProducts from "../components/AllProducts";
import HeroCarousel from "../components/HeroCarousel";
import { ShieldCheck, Award, Home as HomeIcon, Gift } from 'lucide-react';

export default async function Home() {
  const allProducts = await getAllProducts();
  const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));

  return (
    <main style={{ backgroundColor: 'var(--color-light-bg)' }}>
      {/* Split Layout Hero Carousel */}
      <HeroCarousel />

      {/* Value Proposition Footer with Lucide Icons */}
      <section className={styles.valuePropsSection}>
        <div className={`premium-container ${styles.valuePropsContainer}`}>
          {[
            { Icon: ShieldCheck, text: 'Premium\nQuality' },
            { Icon: Award, text: 'Unique\nDesigns' },
            { Icon: HomeIcon, text: 'Perfect For\nEvery Space' },
            { Icon: Gift, text: 'Ideal For\nGifting' }
          ].map((item, i) => (
             <div key={i} className={styles.valuePropItem}>
                <div className={styles.valuePropIcon}>
                  <item.Icon size={32} strokeWidth={1.2} />
                </div>
                <span className={styles.valuePropText}>
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
