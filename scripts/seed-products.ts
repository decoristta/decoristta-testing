import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { db } from "../src/db";
import { products, productMedia, inventory } from "../src/db/schema";

const CSV_PATH = path.join(process.cwd(), "public", "Decoristta- Products info and inventory - Sheet2.csv");
const IMAGES_DIR = path.join(process.cwd(), "public", "Product images");

async function seed() {
  console.log("Reading CSV from:", CSV_PATH);
  const fileContent = fs.readFileSync(CSV_PATH, "utf-8");
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${records.length} records in CSV.`);

  for (const record of records) {
    const productName = record["Product Name"];
    if (!productName) continue;

    console.log(`Processing: ${productName}`);

    // Parse numeric fields
    const mrpStr = record["MRP"] || "0";
    const launchPriceStr = record["Launch Price (25% OFF)- Selling price"] || record["Launch Price "] || "0";
    const savesStr = record["Customer Saves"] || "0";
    const inventoryStr = record["Inventory created"] || "10"; // Default if missing

    const mrp = parseFloat(mrpStr.replace(/[^0-9.]/g, "")) || 0;
    const launchPrice = parseFloat(launchPriceStr.replace(/[^0-9.]/g, "")) || 0;
    const customerSaves = parseFloat(savesStr.replace(/[^0-9.]/g, "")) || 0;
    const availableQuantity = parseInt(inventoryStr.replace(/[^0-9]/g, ""), 10) || 10;

    // We'll set a generic category since it's not in the CSV
    let category = "Decor";
    if (productName.toLowerCase().includes("vase")) category = "Vases";
    if (productName.toLowerCase().includes("lamp")) category = "Lighting";
    if (productName.toLowerCase().includes("candle")) category = "Candle Holders";
    if (productName.toLowerCase().includes("showpiece")) category = "Showpieces";

    // Insert the product
    const [newProduct] = await db.insert(products).values({
      name: productName,
      description: record["Description"],
      seoTitle: record["SEO-Friendly Product Title"],
      color: record["Colour"],
      dimensions: record["Dimension"],
      material: record["Material "] || record["Material"], // Note the trailing space in CSV header
      countryOfOrigin: record["Country of origin "] || record["Country of origin"], // Note trailing space
      category,
      price: launchPrice.toString(),
      mrp: mrp.toString(),
      customerSaves: customerSaves.toString(),
      isActive: true,
    }).returning();

    console.log(`Inserted product: ${newProduct.id}`);

    // Update inventory
    await db.insert(inventory).values({
      productId: newProduct.id,
      availableQuantity,
    });

    // Scan for images in public/Product images/<ProductName>
    const productImagesDir = path.join(IMAGES_DIR, productName);
    if (fs.existsSync(productImagesDir)) {
      const files = fs.readdirSync(productImagesDir);
      
      let sortOrder = 0;
      for (const file of files) {
        // Skip hidden files like .DS_Store
        if (file.startsWith('.')) continue;

        const imageUrl = `/Product images/${encodeURIComponent(productName)}/${encodeURIComponent(file)}`;
        
        await db.insert(productMedia).values({
          productId: newProduct.id,
          url: imageUrl,
          type: "image",
          sortOrder,
        });
        
        sortOrder++;
      }
      console.log(`Added ${sortOrder} images for ${productName}`);
    } else {
      console.warn(`Warning: Image folder not found at ${productImagesDir}`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
