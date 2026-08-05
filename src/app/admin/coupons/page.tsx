import { prisma } from "@/lib/prisma";
import AdminCouponsClient from "./AdminCouponsClient";

export default async function AdminCouponsPage() {
  const [coupons, products] = await Promise.all([
    prisma.coupon.findMany({
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <AdminCouponsClient initialCoupons={coupons as any} products={products} />
    </div>
  );
}
