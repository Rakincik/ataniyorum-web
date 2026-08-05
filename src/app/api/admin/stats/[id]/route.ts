import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { value, label, order, isActive } = await req.json();

    const stat = await prisma.stat.update({
      where: { id },
      data: {
        value,
        label,
        order: Number(order) || 0,
        isActive
      }
    });

    return NextResponse.json({ success: true, stat });
  } catch (error) {
    return NextResponse.json({ error: "İstatistik güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.stat.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "İstatistik silinirken hata oluştu." }, { status: 500 });
  }
}
