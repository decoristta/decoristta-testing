import fs from "fs";
import path from "path";
import { Product } from "../components/ProductCard";

const categoryUINames: Record<string, string> = {
  'Candle stand ': 'Candle Stands',
  'Lamps': 'Lighting',
  'Showpieces': 'Decor',
  'Vases': 'Vases',
  'clock': 'Clocks'
};

function getCategories() {
  const categoriesPath = path.join(process.cwd(), 'public', 'Product images');
  try {
    return fs.readdirSync(categoriesPath).filter(file => {
      if (file.startsWith('.')) return false; 
      return fs.statSync(path.join(categoriesPath, file)).isDirectory();
    });
  } catch (error) {
    console.error("Error reading categories:", error);
    return [];
  }
}

export function getImages(category: string) {
  const dirPath = path.join(process.cwd(), 'public', 'Product images', category);
  try {
    const files = fs.readdirSync(dirPath);
    return files
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
      .map(file => `/Product images/${category}/${file}`);
  } catch (error) {
    return [];
  }
}

let cachedProducts: Product[] | null = null;

export function getAllProducts(): Product[] {
  if (cachedProducts) return cachedProducts;

  const categories = getCategories();
  const allProducts: Product[] = [];
  let idCounter = 1;

  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  categories.forEach((category) => {
    const images = getImages(category);
    const catUI = categoryUINames[category] || category.trim();
    
    images.forEach(img => {
      const price = Math.floor(random() * 500) + 50;
      const hasDiscount = random() > 0.7;
      const oldPrice = hasDiscount ? price + Math.floor(random() * 100) + 20 : undefined;
      const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;
      const rating = (random() * 1.5 + 3.5).toFixed(1); 
      
      let title = img.split('/').pop()?.replace(/\.(jpg|png|jpeg)$/i, '').replace(/[-_]/g, ' ') || 'Premium Item';
      title = title.replace(/\d+/g, '').trim(); 
      if (!title) title = catUI + ' Item';
      title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      allProducts.push({
        id: `prod-${idCounter++}`,
        image: img,
        category: catUI,
        title: title,
        price: price,
        oldPrice: oldPrice,
        discount: discount,
        rating: parseFloat(rating),
        reviews: Math.floor(random() * 50) + 5
      });
    });
  });

  cachedProducts = allProducts;
  return allProducts;
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find(p => p.id === id);
}

// Find original folder name based on UI category name to get thumbnails
export function getOriginalCategoryFolder(uiCategory: string): string {
  const entry = Object.entries(categoryUINames).find(([key, val]) => val === uiCategory);
  if (entry) return entry[0];
  
  const cats = getCategories();
  const match = cats.find(c => c.trim() === uiCategory);
  return match || uiCategory;
}
