import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/products - List products including category relation
export async function GET(request) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          include: {
            parent: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Get Products API Error:', error);
    return NextResponse.json(
      { error: 'Ürünler listelenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (Admin Only)
export async function POST(request) {
  try {
    // Check admin authentication (both admin_token and token fallback)
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1]
      || cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const data = await request.json();
    const { title, categoryId, price, discountRate, imageUrl, description, isActive, instructorName, badges } = data;

    if (!title || !categoryId || price === undefined || !imageUrl) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik (başlık, kategori ID, fiyat, resim).' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title,
        categoryId: parseInt(categoryId),
        price: parseFloat(price),
        discountRate: discountRate ? parseInt(discountRate) : 0,
        imageUrl,
        description: description || '',
        isActive: isActive !== undefined ? isActive : true,
        instructorName: instructorName || null,
        badges: badges || null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create Product API Error:', error);
    return NextResponse.json(
      { error: 'Ürün oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
