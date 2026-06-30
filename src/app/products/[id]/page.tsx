import { notFound } from 'next/navigation';
import { getProductById, getOriginalCategoryFolder, getImages } from '@/lib/data';
import ProductClient from './ProductClient';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  // Get thumbnails from the same category
  const originalCategory = getOriginalCategoryFolder(product.category);
  const categoryImages = getImages(originalCategory);
  
  // Pick up to 4 images for thumbnails
  const thumbUrls = categoryImages.slice(0, 4);

  // If we don't have enough images in the folder, just pad with the main image
  while (thumbUrls.length < 4) {
    thumbUrls.push(product.image);
  }

  return <ProductClient product={product} thumbUrls={thumbUrls} />;
}
