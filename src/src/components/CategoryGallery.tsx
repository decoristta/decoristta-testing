"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../app/page.module.css';

interface CategoryGalleryProps {
  category: string;
  config: { title: string; tagline: string };
  images: string[];
  themeClass: string;
  isDark: boolean;
  layoutStyle: string;
  sliceCount: number;
}

export default function CategoryGallery({ config, images, themeClass, isDark, layoutStyle, sliceCount }: CategoryGalleryProps) {
  const [page, setPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const totalBatches = Math.ceil(images.length / sliceCount);
  const currentImages = images.slice(page * sliceCount, (page + 1) * sliceCount);

  const handlePageChange = (newPage: number) => {
    if (newPage === page || isAnimating) return;
    
    // Trigger fade out animation
    setIsAnimating(true);
    
    // Wait for fade out to complete (300ms), then swap images and fade back in
    setTimeout(() => {
      setPage(newPage);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const next = () => handlePageChange((page + 1) % totalBatches);
  const prev = () => handlePageChange((page - 1 + totalBatches) % totalBatches);

  return (
    <section className={`${styles.categorySection} ${themeClass}`}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>{config.title}</h2>
          <p>{config.tagline}</p>
        </div>
        
        {totalBatches > 1 && (
          <div className={styles.premiumPagination}>
            <button onClick={prev} className={styles.pageBtn} style={!isDark ? { color: 'var(--color-text-dark)', borderColor: 'rgba(0,0,0,0.1)' } : { color: 'var(--color-text-light)' }}>
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <span className={styles.pageIndicator} style={!isDark ? { color: 'var(--color-text-dark)' } : {}}>
              {String(page + 1).padStart(2, '0')} <span style={{ opacity: 0.3, margin: '0 8px' }}>/</span> {String(totalBatches).padStart(2, '0')}
            </span>
            <button onClick={next} className={styles.pageBtn} style={!isDark ? { color: 'var(--color-text-dark)', borderColor: 'rgba(0,0,0,0.1)' } : { color: 'var(--color-text-light)' }}>
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
      
      {/* The dynamically varied High-End Editorial Layout Grid with Blur/Fade Animation */}
      <div className={`${layoutStyle} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
        {currentImages.map((src, i) => (
          <div key={`${page}-${i}`} className={styles.editorialCard}>
            <Image src={src} alt={`${config.title} ${i}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className={styles.editorialImage} />
          </div>
        ))}
      </div>
    </section>
  );
}
