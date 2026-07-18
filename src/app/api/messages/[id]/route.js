import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// DELETE /api/messages/[id] - Delete a contact message (Admin Only)
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    const admin = token ? await verifyToken(token) : null;
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = await params;
    const msgId = parseInt(id);

    if (isNaN(msgId)) {
      return NextResponse.json({ error: 'Geçersiz mesaj kimliği.' }, { status: 400 });
    }

    const existingMsg = await prisma.contactMessage.findUnique({
      where: { id: msgId },
    });

    if (!existingMsg) {
      return NextResponse.json({ error: 'Mesaj bulunamadı.' }, { status: 404 });
    }

    await prisma.contactMessage.delete({
      where: { id: msgId },
    });

    return NextResponse.json({ success: true, message: 'Mesaj başarıyla silindi.' });
  } catch (error) {
    console.error('Delete Message API Error:', error);
    return NextResponse.json(
      { error: 'Mesaj silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
