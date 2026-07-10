import fs from "fs";
import path from "path";
import { db } from "../src/db";
import { products, productMedia } from "../src/db/schema";
import { eq } from "drizzle-orm";

const IMAGES_DIR = path.join(process.cwd(), "public", "Product images");

async function fixImages() {
  console.log("Fixing images...");
  
  // Clear existing media
  await db.delete(productMedia);
  
  const allProducts = await db.select().from(products);
  
  for (const product of allProducts) {
    const productImagesDir = path.join(IMAGES_DIR, product.name);
    
    if (fs.existsSync(productImagesDir)) {
      const files = fs.readdirSync(productImagesDir);
      
      let sortOrder = 0;
      for (const file of files) {
        if (file.startsWith('.')) continue;

        const imageUrl = `/Product images/${encodeURIComponent(product.name)}/${encodeURIComponent(file)}`;
        
        await db.insert(productMedia).values({
          productId: product.id,
          url: imageUrl,
          type: "image",
          sortOrder,
        });
        
        sortOrder++;
      }
      console.log(`Added ${sortOrder} images for ${product.name}`);
    } else {
      console.warn(`Warning: Image folder not found at ${productImagesDir}`);
    }
  }

  console.log("Image fix complete!");
  process.exit(0);
}

fixImages().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
