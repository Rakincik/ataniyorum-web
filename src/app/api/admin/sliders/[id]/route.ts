import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const slider = await prisma.slider.update({
      where: { id },
      data: {
        image: body.image,
        title: body.title,
        subtitle: body.subtitle,
        buttonText: body.buttonText,
        buttonLink: body.buttonLink,
        order: body.order ? Number(body.order) : undefined,
        isActive: body.isActive,
        textAlignment: body.textAlignment,
        textPosition: body.textPosition,
        buttonStyle: body.buttonStyle,
        imageFit: body.imageFit,
        imageZoom: body.imageZoom ? Number(body.imageZoom) : undefined,
        imagePosition: body.imagePosition,
      },
    });

    return NextResponse.json(slider);
  } catch (error) {
    console.error("PUT Slider Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.slider.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Slider Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
