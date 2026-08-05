import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, cartTotal, productId } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Lütfen geçerli bir kupon kodu girin." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { product: true }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Girdiğiniz kupon kodu bulunamadı." }, { status: 404 });
    }

    // Check expiration date
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Bu kupon kodunun kullanım süresi dolmuştur." }, { status: 400 });
    }

    // Check max usage count
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Bu kuponun kullanım limiti dolmuştur." }, { status: 400 });
    }

    // Check product specific coupon
    if (coupon.productId && productId && coupon.productId !== productId) {
      return NextResponse.json({ 
        error: `Bu kupon kodu sadece "${coupon.product?.title}" eğitimi için geçerlidir.` 
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (cartTotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    // Discount cannot exceed cart total
    discountAmount = Math.min(cartTotal, discountAmount);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.type,
        discountValue: coupon.value,
        discountAmount,
        influencerName: coupon.influencerName
      }
    });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Kupon doğrulanırken hata oluştu." }, { status: 500 });
  }
}
