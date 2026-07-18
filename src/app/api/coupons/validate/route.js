import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/coupons/validate - Validate coupon code
export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Kupon kodu belirtilmedi.' }, { status: 400 });
    }

    const couponCode = code.toUpperCase().trim();

    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Geçersiz kupon kodu.' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Bu kupon kodu artık aktif değil.' }, { status: 400 });
    }

    // Check expiry
    if (coupon.expireDate && new Date(coupon.expireDate) < new Date()) {
      return NextResponse.json({ error: 'Bu kupon kodunun süresi dolmuş.' }, { status: 400 });
    }

    return NextResponse.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    console.error('Validate Coupon API Error:', error);
    return NextResponse.json({ error: 'Kupon doğrulanırken hata oluştu.' }, { status: 500 });
  }
}
