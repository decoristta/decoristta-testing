"use client";

import { useState } from 'react';
import { 
  Filter, List, ChevronDown, ChevronLeft, ChevronRight, 
  LayoutGrid, Flower2, Lamp, FlameKindling, Diamond, Gem
} from 'lucide-react';
import ProductCard, { Product } from './ProductCard';
import styles from './AllProducts.module.css';

interface AllProductsProps {
  products: Product[];
  categories: string[];
  initialCategory?: string;
}

export default function AllProducts({ products, categories, initialCategory = 'All' }: AllProductsProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Reset page when category changes
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vases': return <Flower2 size={16} strokeWidth={1.5} />;
      case 'decor': return <Gem size={16} strokeWidth={1.5} />;
      case 'lighting':
      case 'lamps': return <Lamp size={16} strokeWidth={1.5} />;
      case 'candle holders':
      case 'candle stands': return <FlameKindling size={16} strokeWidth={1.5} />;
      case 'showpieces': return <Diamond size={16} strokeWidth={1.5} />;
      case 'clocks': return <LayoutGrid size={16} strokeWidth={1.5} />;
      case 'all': return <LayoutGrid size={16} strokeWidth={1.5} />;
      default: return <Gem size={16} strokeWidth={1.5} />;
    }
  };

  // Pagination logic
  const itemsPerPage = 12;
  const totalResults = filteredProducts.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.categories}>
              <button 
                className={`${styles.categoryPill} ${activeCategory === 'All' ? styles.active : ''}`}
                onClick={() => handleCategoryChange('All')}
              >
                {getCategoryIcon('All')} <span>All</span>
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  className={`${styles.categoryPill} ${activeCategory === cat ? styles.active : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {getCategoryIcon(cat)} <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbarRight}>
            {/* Sort and view toggles removed as requested */}
          </div>
        </div>

        <div className={styles.grid}>
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
