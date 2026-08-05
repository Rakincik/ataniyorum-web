import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShopierFormHTML } from "@/lib/shopier";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Lütfen önce giriş yapın." }, { status: 401 });
    }

    const { variantId, addonIds, couponCode } = await req.json();

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });

    if (!variant) {
      return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
    }

    let addons: any[] = [];
    if (addonIds && addonIds.length > 0) {
      addons = await prisma.productAddon.findMany({
        where: { id: { in: addonIds } }
      });
    }

    let rawTotal = variant.product.basePrice + variant.price + addons.reduce((sum, a) => sum + a.price, 0);
    let discountAmount = 0;

    // Check Coupon
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon) {
        if (coupon.type === "PERCENTAGE") {
          discountAmount = (rawTotal * coupon.value) / 100;
        } else {
          discountAmount = coupon.value;
        }
      }
    }

    const isFreeOrder = variant.product.isFree || (rawTotal - discountAmount) <= 0;
    const finalAmount = isFreeOrder ? 0 : Math.max(1, rawTotal - discountAmount);

    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // Create Order in DB
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: finalAmount,
        couponCode: couponCode ? couponCode.toUpperCase() : null,
        discountAmount: discountAmount,
        status: isFreeOrder ? "PAID" : "PENDING",
        shopierOrderId: isFreeOrder ? `FREE-${Math.floor(100000 + Math.random() * 900000)}` : null,
        items: {
          create: [
            {
              variantId: variant.id,
              price: isFreeOrder ? 0 : (variant.product.basePrice + variant.price),
              quantity: 1
            },
            ...addons.map(a => ({
              variantId: variant.id,
              addonId: a.id,
              addonName: a.name,
              addonPrice: a.price,
              price: isFreeOrder ? 0 : a.price,
              quantity: 1
            }))
          ]
        }
      }
    });

    // If free order, return instant JSON success bypass
    if (isFreeOrder) {
      if (couponCode) {
        await prisma.coupon.updateMany({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } }
        });
      }

      return NextResponse.json({ freeSuccess: true, orderId: order.id });
    }

    // Generate Shopier Form HTML
    const htmlForm = generateShopierFormHTML({
      orderId: order.id,
      totalAmount: finalAmount,
      buyerName: user.firstName,
      buyerSurname: user.lastName,
      buyerEmail: user.email,
      buyerPhone: user.phone || "",
      buyerAddress: user.address || "Türkiye",
      buyerCity: (user as any).city || "Ankara",
      buyerTcNo: user.tcNo || "11111111111",
      productName: `${variant.product.title} - ${variant.name}${addons.length > 0 ? ` (+ ${addons.map(a => a.name).join(', ')})` : ''}`
    });

    return new Response(htmlForm, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Ödeme oluşturulamadı." }, { status: 500 });
  }
}
