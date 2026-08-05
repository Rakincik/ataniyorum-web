import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let about = await prisma.aboutPage.findUnique({
      where: { id: "default" }
    });

    if (!about) {
      about = await prisma.aboutPage.create({
        data: { id: "default" }
      });
    }

    return NextResponse.json({ about });
  } catch (error) {
    return NextResponse.json({ error: "Hakkımızda sayfası yüklenemedi." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    const about = await prisma.aboutPage.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data }
    });

    return NextResponse.json({ success: true, about });
  } catch (error) {
    return NextResponse.json({ error: "Hakkımızda sayfası güncellenirken hata oluştu." }, { status: 500 });
  }
}
