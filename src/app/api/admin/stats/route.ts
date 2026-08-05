import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let stats = await prisma.stat.findMany({
      orderBy: { order: "asc" }
    });

    // Default Seed if empty
    if (stats.length === 0) {
      await prisma.stat.createMany({
        data: [
          { value: "10.000+", label: "ÖĞRENCİ", order: 1, isActive: true },
          { value: "%98", label: "ATANMA ORANI", order: 2, isActive: true },
          { value: "1 Numara", label: "EĞİTMEN KADROSU", order: 3, isActive: true },
          { value: "7/24", label: "REHBERLİK", order: 4, isActive: true },
        ]
      });

      stats = await prisma.stat.findMany({
        orderBy: { order: "asc" }
      });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: "İstatistikler alınamadı." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { value, label, order, isActive } = await req.json();

    if (!value || !label) {
      return NextResponse.json({ error: "Değer ve Etiket alanları zorunludur." }, { status: 400 });
    }

    const stat = await prisma.stat.create({
      data: {
        value,
        label,
        order: Number(order) || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({ success: true, stat });
  } catch (error) {
    return NextResponse.json({ error: "İstatistik eklenirken hata oluştu." }, { status: 500 });
  }
}
