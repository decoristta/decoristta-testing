import { getProductById } from "@/lib/data";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <ProductClient product={product} />
    </main>
  );
}
