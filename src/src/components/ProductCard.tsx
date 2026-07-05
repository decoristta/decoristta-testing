import Image from 'next/image';
import { Heart, Star, StarHalf } from 'lucide-react';
import styles from './ProductCard.module.css';

export interface Product {
  id: string;
  image: string;
  category: string;
  title: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice?: number;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
}

import Link from 'next/link';

export default function ProductCard({ product }: ProductCardProps) {
  // Simple rendering of stars based on rating
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 !== 0;

  return (
    <Link href={`/products/${product.id}`} className={styles.card} style={{ textDecoration: 'none' }}>
      <div className={styles.imageContainer}>
        {product.discount && (
          <span className={styles.badge}>-{product.discount}%</span>
        )}
        <button className={styles.heartBtn} aria-label="Add to favorites">
          <Heart size={18} strokeWidth={2} />
        </button>
        <Image 
          src={product.image} 
          alt={product.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={styles.image} 
        />
      </div>
      <div className={styles.details}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.title}>{product.title}</h3>
        
        <div className={styles.ratingContainer}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => {
              if (i < fullStars) {
                return <Star key={i} size={14} fill="currentColor" strokeWidth={0} />;
              }
              if (i === fullStars && hasHalfStar) {
                 // Using half star is tricky with basic lucide without custom SVG, 
                 // we'll just use a slightly different star or a regular star with fill depending on the lib.
                 // For simplicity, just render a regular star if no half star icon is perfect, 
                 // but lucide has StarHalf.
                 return <StarHalf key={i} size={14} fill="currentColor" strokeWidth={0} />;
              }
              return <Star key={i} size={14} fill="none" strokeWidth={2} stroke="currentColor" style={{ opacity: 0.3 }} />;
            })}
          </div>
          <span className={styles.ratingText}>
            {product.rating} ({product.reviews})
          </span>
        </div>

        <div className={styles.priceContainer}>
          {product.oldPrice && (
            <span className={styles.oldPrice}>${product.oldPrice.toLocaleString()}</span>
          )}
          <span className={styles.price}>${product.price.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
