import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/announcements - List announcements
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const all = searchParams.get('all'); // if 'true', shows inactive ones as well (for admin panel)

    const where = {};
    if (all !== 'true') {
      where.isActive = true;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Get Announcements API Error:', error);
    return NextResponse.json(
      { error: 'Duyurular listelenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create a new announcement (Admin Only)
export async function POST(request) {
  try {
    // Check admin authentication
    const token = request.cookies.get('token')?.value;
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const data = await request.json();
    const { title, content, date, isActive } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik (başlık, içerik).' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        date: date ? new Date(date) : new Date(),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Create Announcement API Error:', error);
    return NextResponse.json(
      { error: 'Duyuru oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
