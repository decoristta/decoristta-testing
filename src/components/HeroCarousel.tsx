"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../app/page.module.css';

const HERO_SLIDES = [
  {
    src: "/images/hero-1.png",
    title: "Premium Decor",
    subtitle: "Designed For Modern Homes",
    cta: "SHOP NOW"
  },
  {
    src: "/images/hero-2.png",
    title: "Timeless Elegance",
    subtitle: "Curated For Your Space",
    cta: "EXPLORE COLLECTION"
  },
  {
    src: "/images/hero-3.png",
    title: "Luxury Lighting",
    subtitle: "Illuminate Your World",
    cta: "DISCOVER LIGHTING"
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.splitHero}>
      <div className={styles.heroImageContainer}>
        {HERO_SLIDES.map((slide, index) => (
          <Image 
            key={slide.src}
            src={slide.src} 
            alt={slide.title} 
            fill 
            priority={index === 0} 
            className={styles.heroImage} 
            style={{ 
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out'
            }}
          />
        ))}
      </div>
      <div className={styles.heroTextContainer}>
        {HERO_SLIDES.map((slide, index) => (
          <div 
            key={slide.title} 
            className={styles.heroTextContent}
            style={{ 
              opacity: index === currentIndex ? 1 : 0,
              position: index === currentIndex ? 'relative' : 'absolute',
              transition: 'opacity 1s ease-in-out',
              pointerEvents: index === currentIndex ? 'auto' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <h2 className={styles.heroSplitTitle}>{slide.title}</h2>
            <p className={styles.heroSplitSubtitle}>{slide.subtitle}</p>
            <button className={styles.shopNowBtn}>{slide.cta}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
