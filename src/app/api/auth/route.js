import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, verifyToken } from '@/lib/auth';

// POST /api/auth - Login
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    // Normalized email
    const normalizedEmail = email.toLowerCase().trim();

    // Query database for admin
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    // For convenience, also check backup email if it's admin@atnaiyorum.com
    let validAdmin = admin;
    if (!validAdmin && normalizedEmail === 'admin@atnaiyorum.com') {
      validAdmin = await prisma.admin.findFirst();
    }

    if (!validAdmin) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre.' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, validAdmin.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre.' },
        { status: 401 }
      );
    }

    // Sign JWT Token
    const token = await signToken({
      id: validAdmin.id,
      email: validAdmin.email,
      name: validAdmin.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: validAdmin.id,
        email: validAdmin.email,
        name: validAdmin.name,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// GET /api/auth - Check Session
export async function GET(request) {
  try {
    const tokenCookie = request.cookies.get('token');
    if (!tokenCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// DELETE /api/auth - Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('token');
  return response;
}
