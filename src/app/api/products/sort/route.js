import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(request) {
  try {
    // Check admin authentication
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1]
      || cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'Geçersiz ürün listesi.' }, { status: 400 });
    }

    // Update sortOrder for each product id sequentially using a transaction
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.product.update({
          where: { id: parseInt(id) },
          data: { sortOrder: index }
        })
      )
    );

    return NextResponse.json({ success: true, message: 'Ürün sıralaması güncellendi.' });
  } catch (error) {
    console.error('Sort Products API Error:', error);
    return NextResponse.json(
      { error: 'Ürün sıralaması güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
