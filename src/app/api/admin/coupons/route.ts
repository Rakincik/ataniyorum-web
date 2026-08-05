import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: "Kuponlar yüklenirken hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      code, type, value, minCartValue, usageLimit, productId, expiresAt,
      influencerName, commissionType, commissionValue
    } = data;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Kupon kodu, türü ve indirim değeri zorunludur." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (existing) {
      return NextResponse.json({ error: "Bu kupon kodu zaten mevcut." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        type, // "PERCENTAGE" or "FIXED"
        value: Number(value),
        minCartValue: minCartValue ? Number(minCartValue) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        productId: productId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        influencerName: influencerName ? influencerName.trim() : null,
        commissionType: commissionType || null,
        commissionValue: commissionValue ? Number(commissionValue) : null,
      }
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Coupon create error:", error);
    return NextResponse.json({ error: "Kupon oluşturulurken hata oluştu." }, { status: 500 });
  }
}
