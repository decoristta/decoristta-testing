import { db } from './index';
import { products } from './schema';
import { unstable_cache } from 'next/cache';
import { eq } from 'drizzle-orm';

/**
 * Fallback/Mitigation 3: Read Replicas & Aggressive Caching
 * 
 * Mitigates DB read load during high-traffic events (like flash sales) by heavily 
 * caching the catalog at the Next.js Data Cache layer. 
 * This ensures that a checkout bottleneck (which locks inventory rows) does not 
 * take down the storefront browsing experience for other users.
 */
export const getCachedProducts = unstable_cache(
  async () => {
    return await db.select().from(products).where(eq(products.isActive, true));
  },
  ['catalog-products'], // Cache key
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['products'], // Allows on-demand revalidation (e.g., when an admin adds a new product)
  }
);
