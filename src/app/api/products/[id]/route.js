import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/products/[id] - Get a single product including category
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Geçersiz ürün kimliği.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          include: {
            parent: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Get Single Product API Error:', error);
    return NextResponse.json(
      { error: 'Ürün bilgisi alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (Admin Only)
export async function PUT(request, { params }) {
  try {
    // Check admin authentication (supporting both token types)
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1]
      || cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Geçersiz ürün kimliği.' }, { status: 400 });
    }

    const data = await request.json();
    const { title, categoryId, price, discountRate, imageUrl, description, isActive, instructorName, badges } = data;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: title !== undefined ? title : existingProduct.title,
        categoryId: categoryId !== undefined ? parseInt(categoryId) : existingProduct.categoryId,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        discountRate: discountRate !== undefined ? parseInt(discountRate) : existingProduct.discountRate,
        imageUrl: imageUrl !== undefined ? imageUrl : existingProduct.imageUrl,
        description: description !== undefined ? description : existingProduct.description,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive,
        instructorName: instructorName !== undefined ? instructorName : existingProduct.instructorName,
        badges: badges !== undefined ? badges : existingProduct.badges,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update Product API Error:', error);
    return NextResponse.json(
      { error: 'Ürün güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (Admin Only)
export async function DELETE(request, { params }) {
  try {
    // Check admin authentication
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1]
      || cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Geçersiz ürün kimliği.' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    console.error('Delete Product API Error:', error);
    return NextResponse.json(
      { error: 'Ürün silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
