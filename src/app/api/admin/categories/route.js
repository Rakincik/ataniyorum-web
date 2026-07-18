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

// GET /api/admin/categories - Get category tree and statistics
export async function GET(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    // 1. Fetch categories with parent/children hierarchy and product count
    const categories = await prisma.category.findMany({
      include: {
        children: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      },
      where: {
        parentId: null // Main categories first
      },
      orderBy: {
        name: 'asc'
      }
    });

    // 2. Fetch statistics
    const totalCategories = await prisma.category.count();
    const totalProducts = await prisma.product.count();
    const mainCategories = await prisma.category.count({ where: { parentId: null } });
    const subCategories = totalCategories - mainCategories;

    return NextResponse.json({
      categories,
      stats: {
        totalCategories,
        totalProducts,
        mainCategories,
        subCategories
      }
    });
  } catch (error) {
    console.error('Admin GET Categories API Error:', error);
    return NextResponse.json({ error: 'Kategoriler listelenirken hata oluştu.' }, { status: 500 });
  }
}

// POST /api/admin/categories - Create category or subcategory
export async function POST(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Kategori adı zorunludur.' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        parentId: parentId ? parseInt(parentId) : null
      }
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Admin POST Category API Error:', error);
    return NextResponse.json({ error: 'Kategori oluşturulurken hata oluştu.' }, { status: 500 });
  }
}
