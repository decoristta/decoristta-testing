"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Search, Heart, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const handleUserClick = () => {
    if (user) {
      router.push('/account');
    } else {
      openAuthModal();
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button 
          className={styles.hamburgerBtn} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
        </button>
        <Link href="/" className={styles.logo}>
          <Image src="/images/logo.png" alt="Decoristta Logo" width={80} height={80} style={{ objectFit: 'contain' }} priority />
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>New In</Link>
        <Link href="/category/Vases" className={styles.navLink}>Vases</Link>
        <Link href="/category/Decor" className={styles.navLink}>Decor</Link>
        <Link href="/category/Lighting" className={styles.navLink}>Lighting</Link>
        <Link href="/category/Candle Holders" className={styles.navLink}>Candles</Link>
        <Link href="/category/Showpieces" className={styles.navLink}>Showpieces</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
      </nav>

      <div className={styles.icons}>
        <button className={styles.iconBtn} aria-label="Search">
          <Search size={20} strokeWidth={1.5} />
        </button>
        <button className={styles.iconBtn} aria-label="Wishlist">
          <Heart size={20} strokeWidth={1.5} />
          <span className={styles.badge}>0</span>
        </button>
        <button className={styles.iconBtn} aria-label="Account" onClick={handleUserClick}>
          <User size={20} strokeWidth={1.5} />
        </button>
        <button className={styles.iconBtn} aria-label="Cart">
          <ShoppingBag size={20} strokeWidth={1.5} />
          <span className={styles.badge}>0</span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav className={styles.mobileNav}>
          <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>New In</Link>
          <Link href="/category/Vases" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Vases</Link>
          <Link href="/category/Decor" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Decor</Link>
          <Link href="/category/Lighting" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Lighting</Link>
          <Link href="/category/Candle Holders" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Candles</Link>
          <Link href="/category/Showpieces" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Showpieces</Link>
          <Link href="/about" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
        </nav>
      )}
    </header>
  );
}
