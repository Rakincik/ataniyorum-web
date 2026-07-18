import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Middleware protection check
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

// GET /api/admin/users - Get all customer users with their purchases
export async function GET(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        purchases: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Admin GET Users API Error:', error);
    return NextResponse.json({ error: 'Kullanıcılar listelenirken hata oluştu.' }, { status: 500 });
  }
}

// POST /api/admin/users - Create new customer user (plain-text password for testing)
export async function POST(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, surname, email, password, phone, tc, birthDate } = body;

    if (!name || !surname || !email || !password) {
      return NextResponse.json({ error: 'Ad, soyad, e-posta ve şifre zorunludur.' }, { status: 400 });
    }

    // Check unique email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda.' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        password, // stored plain-text as requested by the user
        phone,
        tc,
        birthDate
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Admin POST User API Error:', error);
    return NextResponse.json({ error: 'Kullanıcı oluşturulurken hata oluştu.' }, { status: 500 });
  }
}
