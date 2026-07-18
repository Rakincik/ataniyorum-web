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

// PUT /api/admin/categories/[id] - Update category name or parent
export async function PUT(request, { params }) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, parentId } = body;

    const catId = parseInt(id);
    if (isNaN(catId)) {
      return NextResponse.json({ error: 'Geçersiz kategori ID.' }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id: catId },
      data: {
        name,
        parentId: parentId ? parseInt(parentId) : null
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin PUT Category API Error:', error);
    return NextResponse.json({ error: 'Kategori güncellenirken hata oluştu.' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - Delete category and subcategories
export async function DELETE(request, { params }) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const catId = parseInt(id);
    if (isNaN(catId)) {
      return NextResponse.json({ error: 'Geçersiz kategori ID.' }, { status: 400 });
    }

    // Cascade delete of children is supported at Prisma schema level, but we make sure:
    await prisma.category.delete({
      where: { id: catId }
    });

    return NextResponse.json({ message: 'Kategori başarıyla silindi.' });
  } catch (error) {
    console.error('Admin DELETE Category API Error:', error);
    return NextResponse.json({ error: 'Kategori silinirken hata oluştu.' }, { status: 500 });
  }
}
