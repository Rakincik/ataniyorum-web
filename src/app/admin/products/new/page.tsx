import { prisma } from "@/lib/prisma";
import ProductFormClient from "./ProductFormClient";

export default async function NewProductPage() {
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
        allProducts={allProducts} 
      />
    </div>
  );
}
