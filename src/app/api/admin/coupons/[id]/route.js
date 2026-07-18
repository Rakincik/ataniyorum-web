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

// PUT /api/admin/coupons/[id] - Update coupon details or active status
export async function PUT(request, { params }) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { code, discountType, discountValue, expireDate, isActive } = body;

    const couponId = parseInt(id);
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'Geçersiz kupon ID.' }, { status: 400 });
    }

    const data = {};
    if (code) data.code = code.toUpperCase().trim();
    if (discountType) data.discountType = discountType;
    if (discountValue !== undefined) data.discountValue = parseFloat(discountValue);
    if (expireDate !== undefined) data.expireDate = expireDate ? new Date(expireDate) : null;
    if (isActive !== undefined) data.isActive = isActive;

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin PUT Coupon API Error:', error);
    return NextResponse.json({ error: 'Kupon güncellenirken hata oluştu.' }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id] - Delete discount coupon
export async function DELETE(request, { params }) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const couponId = parseInt(id);
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'Geçersiz kupon ID.' }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id: couponId }
    });

    return NextResponse.json({ message: 'Kupon başarıyla silindi.' });
  } catch (error) {
    console.error('Admin DELETE Coupon API Error:', error);
    return NextResponse.json({ error: 'Kupon silinirken hata oluştu.' }, { status: 500 });
  }
}
