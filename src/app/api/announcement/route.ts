import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let announcement = await prisma.announcement.findFirst();

    // Default seed if none exists
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
    return NextResponse.json({ announcement: null });
  }
}
