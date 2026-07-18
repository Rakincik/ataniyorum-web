import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/announcements/[id] - Get single announcement
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const annId = parseInt(id);

    if (isNaN(annId)) {
      return NextResponse.json({ error: 'Geçersiz duyuru kimliği.' }, { status: 400 });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: annId },
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Duyuru bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Get Single Announcement API Error:', error);
    return NextResponse.json(
      { error: 'Duyuru bilgisi alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/[id] - Update announcement (Admin Only)
export async function PUT(request, { params }) {
  try {
    // Check admin authentication
    const token = request.cookies.get('token')?.value;
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = await params;
    const annId = parseInt(id);

    if (isNaN(annId)) {
      return NextResponse.json({ error: 'Geçersiz duyuru kimliği.' }, { status: 400 });
    }

    const data = await request.json();
    const { title, content, date, isActive } = data;

    // Check if announcement exists
    const existingAnn = await prisma.announcement.findUnique({
      where: { id: annId },
    });

    if (!existingAnn) {
      return NextResponse.json({ error: 'Duyuru bulunamadı.' }, { status: 404 });
    }

    const updatedAnn = await prisma.announcement.update({
      where: { id: annId },
      data: {
        title: title !== undefined ? title : existingAnn.title,
        content: content !== undefined ? content : existingAnn.content,
        date: date !== undefined ? new Date(date) : existingAnn.date,
        isActive: isActive !== undefined ? isActive : existingAnn.isActive,
      },
    });

    return NextResponse.json({ success: true, announcement: updatedAnn });
  } catch (error) {
    console.error('Update Announcement API Error:', error);
    return NextResponse.json(
      { error: 'Duyuru güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements/[id] - Delete announcement (Admin Only)
export async function DELETE(request, { params }) {
  try {
    // Check admin authentication
    const token = request.cookies.get('token')?.value;
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = await params;
    const annId = parseInt(id);

    if (isNaN(annId)) {
      return NextResponse.json({ error: 'Geçersiz duyuru kimliği.' }, { status: 400 });
    }

    const existingAnn = await prisma.announcement.findUnique({
      where: { id: annId },
    });

    if (!existingAnn) {
      return NextResponse.json({ error: 'Duyuru bulunamadı.' }, { status: 404 });
    }

    await prisma.announcement.delete({
      where: { id: annId },
    });

    return NextResponse.json({ success: true, message: 'Duyuru başarıyla silindi.' });
  } catch (error) {
    console.error('Delete Announcement API Error:', error);
    return NextResponse.json(
      { error: 'Duyuru silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
