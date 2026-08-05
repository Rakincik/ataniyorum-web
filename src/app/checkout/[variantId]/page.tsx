import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import CheckoutClient from "@/components/CheckoutClient";

export default async function CheckoutPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ variantId: string }>,
  searchParams: Promise<{ addons?: string }>
}) {
  const { variantId } = await params;
  const { addons } = await searchParams;
  
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } }
        }
      }
    },
  });

  if (!variant) {
    notFound();
  }

  let selectedAddons: any[] = [];
  if (addons) {
    const addonIds = addons.split(',');
    selectedAddons = await prisma.productAddon.findMany({
      where: { id: { in: addonIds } }
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />
      
      <div className="pt-8 lg:pt-12 px-6">
        <CheckoutClient course={variant.product as any} variant={variant} selectedAddons={selectedAddons} />
      </div>
    </main>
  );
}
