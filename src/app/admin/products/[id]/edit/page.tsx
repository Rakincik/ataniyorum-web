import { prisma } from "@/lib/prisma";
import ProductFormClient from "../../new/ProductFormClient";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      addons: true,
      features: {
        orderBy: { order: 'asc' }
      },
      images: {
        orderBy: { order: 'asc' }
      },
      crossSellFrom: true
    }
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true }
  });

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <ProductFormClient 
        categories={categories} 
        product={product as any} 
        allProducts={allProducts} 
      />
    </div>
  );
}
