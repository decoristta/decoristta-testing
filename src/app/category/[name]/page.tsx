import { getAllProducts } from "@/lib/data";
import AllProducts from "@/components/AllProducts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.name);
  return {
    title: `${categoryName} | Decoristta`,
    description: `Shop our premium collection of ${categoryName}.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  const allProducts = await getAllProducts();
  const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));
  const categoryName = decodeURIComponent(resolvedParams.name);

  return (
    <main style={{ backgroundColor: 'var(--color-light-bg)', minHeight: '100vh', padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--color-text-dark)' }}>
          {categoryName}
        </h1>
        <p style={{ color: '#666', marginTop: '1rem', fontFamily: 'var(--font-sans)' }}>
          Explore our curated selection of {categoryName.toLowerCase()} for your home.
        </p>
      </div>
      <AllProducts products={allProducts} categories={uniqueCategories} initialCategory={categoryName} />
    </main>
  );
}
