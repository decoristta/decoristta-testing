import { db } from "../db";
import { products, productMedia } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { Product } from "../components/ProductCard";

export async function getAllProducts(): Promise<Product[]> {
  try {
    const allProds = await db.select().from(products).where(eq(products.isActive, true));
    const allMedia = await db.select().from(productMedia).orderBy(asc(productMedia.sortOrder));

    return allProds.map(p => {
      const productImages = allMedia.filter(m => m.productId === p.id);
      const mainImage = productImages.length > 0 ? productImages[0].url : "/images/placeholder.png";
      
      const price = parseFloat(p.price) || 0;
      const oldPrice = p.mrp ? parseFloat(p.mrp) : undefined;
      const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;
      
      return {
        id: p.id,
        image: mainImage,
        category: p.category,
        title: p.seoTitle || p.name,
        rating: parseFloat(p.averageRating || "4.5"),
        reviews: 24, // Placeholder for now
        price: price,
        oldPrice: oldPrice,
        discount: discount,
        // Adding extra fields useful for detail page
        description: p.description,
        dimensions: p.dimensions,
        material: p.material,
        color: p.color,
        customerSaves: p.customerSaves ? parseFloat(p.customerSaves) : undefined,
        images: productImages.map(m => m.url)
      };
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find(p => p.id === id);
}
