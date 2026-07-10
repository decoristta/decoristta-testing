"use client";

import { useState } from 'react';
import { Filter, LayoutGrid, List, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';
import styles from './AllProducts.module.css';

interface AllProductsProps {
  products: Product[];
  categories: string[];
}

export default function AllProducts({ products, categories }: AllProductsProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Pagination mock logic
  const itemsPerPage = 12;
  const totalResults = filteredProducts.length;
  // Just show first 12 for the demo if there are more
  const displayedProducts = filteredProducts.slice(0, itemsPerPage);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>All Products</h2>
            <p>Considered pieces for the home you're building, one room at a time.</p>
          </div>
          <div className={styles.headerRight}>
            Showing 1-{Math.min(itemsPerPage, totalResults)} of {totalResults} results
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.filterBtn}>
              <Filter size={16} /> Filters
            </button>
            <div className={styles.categories}>
              <button 
                className={`${styles.categoryPill} ${activeCategory === 'All' ? styles.active : ''}`}
                onClick={() => setActiveCategory('All')}
              >
                All
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  className={`${styles.categoryPill} ${activeCategory === cat ? styles.active : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.sortContainer}>
              Sort by:
              <button className={styles.sortSelect}>
                Featured <ChevronDown size={14} />
              </button>
            </div>
            <div className={styles.viewToggles}>
              <button 
                className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`}
                onClick={() => setView('grid')}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
                onClick={() => setView('list')}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalResults > itemsPerPage && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled>
              <ChevronLeft size={18} />
            </button>
            <span className={`${styles.pageNumber} ${styles.active}`}>1</span>
            <span className={styles.pageNumber}>2</span>
            <span className={styles.pageNumber}>3</span>
            <span className={styles.ellipsis}>...</span>
            <span className={styles.pageNumber}>{Math.ceil(totalResults / itemsPerPage)}</span>
            <button className={styles.pageBtn}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
