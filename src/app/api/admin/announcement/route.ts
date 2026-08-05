import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let announcement = await prisma.announcement.findFirst();
    if (!announcement) {
      announcement = await prisma.announcement.create({
        data: {
          text: "Şimdi 2026 KPSS ÖABT eğitimlerini erken kayıt fiyatlarıyla satın alabilirsiniz.",
          linkText: "Daha fazla bilgi",
          linkUrl: "/#courses",
          isActive: true
        }
      });
    }
    return NextResponse.json({ announcement });
  } catch (error) {
    return NextResponse.json({ error: "Duyuru bilgisi alınamadı." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { text, linkText, linkUrl, isActive } = await req.json();

    let announcement = await prisma.announcement.findFirst();

    if (announcement) {
      announcement = await prisma.announcement.update({
        where: { id: announcement.id },
        data: { text, linkText, linkUrl, isActive }
      });
    } else {
      announcement = await prisma.announcement.create({
        data: { text, linkText, linkUrl, isActive }
      });
    }

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    return NextResponse.json({ error: "Duyuru güncellenirken hata oluştu." }, { status: 500 });
  }
}
