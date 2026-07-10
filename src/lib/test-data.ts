import { db } from "../db";
import { products, productMedia } from "../db/schema";
import { eq } from "drizzle-orm";
import { Product } from "../components/ProductCard";

export async function getAllProducts(): Promise<Product[]> {
  // Query all active products
  const allProducts = await db.query.products.findMany({
    where: eq(products.isActive, true),
    with: {
      media: true // We need to define relations if not already defined.
    }
  });
