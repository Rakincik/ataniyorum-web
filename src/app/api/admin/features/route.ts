import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { order: "asc" }
    });
    return NextResponse.json({ features });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, description, icon, order, isActive } = data;

    if (!title || !description) {
      return NextResponse.json({ error: "Başlık ve Açıklama zorunludur." }, { status: 400 });
    }

    const feature = await prisma.feature.create({
      data: {
        title,
        description,
        icon: icon || "Zap",
        order: Number(order) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    return NextResponse.json({ feature });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
