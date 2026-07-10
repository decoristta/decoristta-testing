"use client";

import Link from 'next/link';
import { Search, Heart, User, ShoppingBag } from 'lucide-react';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
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
      <Link href="/" className={styles.logo}>
        Decoristta
      </Link>

      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navLink} ${styles.active}`}>Shop</Link>
        <Link href="#" className={styles.navLink}>Collections</Link>
        <Link href="#" className={styles.navLink}>About</Link>
        <Link href="#" className={styles.navLink}>Journal</Link>
        <Link href="#" className={styles.navLink}>Contact</Link>
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
    </header>
  );
}
