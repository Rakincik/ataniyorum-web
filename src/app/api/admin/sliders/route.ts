import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(sliders);
  } catch (error) {
    console.error("GET Sliders Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, title, subtitle, buttonText, buttonLink, order, isActive } = body;

    if (!image || !title) {
      return NextResponse.json({ error: "Image and title are required" }, { status: 400 });
    }

    const slider = await prisma.slider.create({
      data: {
        image,
        title,
        subtitle,
        buttonText,
        buttonLink,
        order: Number(order) || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error("POST Slider Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
