import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function checkAuth(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1]
    || cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  
  if (!token) return false;
  try {
    const payload = await verifyToken(token);
    return !!payload;
  } catch (e) {
    return false;
  }
}

// GET /api/admin/coupons - Get all discount coupons
export async function GET(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Admin GET Coupons API Error:', error);
    return NextResponse.json({ error: 'Kuponlar listelenirken hata oluştu.' }, { status: 500 });
  }
}

// POST /api/admin/coupons - Create a new discount coupon
export async function POST(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, discountType, discountValue, expireDate } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: 'Kupon kodu, indirim türü ve indirim değeri zorunludur.' }, { status: 400 });
    }

    // Convert code to uppercase
    const couponCode = code.toUpperCase().trim();

    // Check unique code
    const existing = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (existing) {
      return NextResponse.json({ error: 'Bu kupon kodu zaten mevcut.' }, { status: 400 });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        discountType,
        discountValue: parseFloat(discountValue),
        expireDate: expireDate ? new Date(expireDate) : null
      }
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error('Admin POST Coupon API Error:', error);
    return NextResponse.json({ error: 'Kupon oluşturulurken hata oluştu.' }, { status: 500 });
  }
}
