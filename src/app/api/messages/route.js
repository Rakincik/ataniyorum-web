import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/messages - Fetch all contact messages (Admin Only)
export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get Messages API Error:', error);
    return NextResponse.json(
      { error: 'Mesajlar listelenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Submit contact message (Public)
export async function POST(request) {
  try {
    const { name, surname, email, phone, message } = await request.json();

    if (!name || !surname || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun.' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        surname,
        email,
        phone,
        message,
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Submit Message API Error:', error);
    return NextResponse.json(
      { error: 'Mesajınız gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
