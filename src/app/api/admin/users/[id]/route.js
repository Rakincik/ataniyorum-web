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

// PUT /api/admin/users/[id] - Update customer user details
export async function PUT(request, { params }) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, surname, email, password, phone, tc, birthDate } = body;

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID.' }, { status: 400 });
    }

    // Check unique email excluding current user
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      });
      if (existing) {
        return NextResponse.json({ error: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        surname,
        email,
        password, // stored plain-text as requested
        phone,
        tc,
        birthDate
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Admin PUT User API Error:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenirken hata oluştu.' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete customer user
export async function DELETE(request, { params }) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi.' });
  } catch (error) {
    console.error('Admin DELETE User API Error:', error);
    return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu.' }, { status: 500 });
  }
}
