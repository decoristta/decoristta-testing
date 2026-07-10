import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <h2 className={styles.brandName}>Decoristta</h2>
          <p className={styles.brandDesc}>
            Considered furniture and decor for<br/> calm, warm interiors.
          </p>
        </div>

        {/* Shop Column */}
        <div className={styles.linkCol}>
          <h3>Shop</h3>
          <ul>
            <li><Link href="/category/Showpieces">Showpieces</Link></li>
            <li><Link href="/category/Lamps">Lamps</Link></li>
            <li><Link href="/category/Vases">Vases</Link></li>
            <li><Link href="/category/Clocks">Clocks</Link></li>
            <li><Link href="/category/Candle%20Holders">Candle Holders</Link></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className={styles.linkCol}>
          <h3>Company</h3>
          <ul>
            <li><Link href="#">About us</Link></li>
            <li><Link href="#">Careers</Link></li>
            <li><Link href="#">Press</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className={styles.linkCol}>
          <h3>Support</h3>
          <ul>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/shipping-policy">Shipping Policy</Link></li>
            <li><Link href="/returns-policy">Returns & Refunds</Link></li>
            <li><Link href="#">FAQs</Link></li>
          </ul>
        </div>

        {/* Social Column */}
        <div className={styles.socialCol}>
          <h3>Our Social Platform</h3>
          <div className={styles.socialIcons}>
            <a 
              href="https://www.instagram.com/decoristta_official?igsh=YjB3YmpkNXBtbnRs" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.iconBtn}
              aria-label="Instagram"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© 2026 Decoristta. All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link href="/terms">Terms of Use</Link>
          <Link href="#">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
