import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Site ayarları yüklenemedi." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        isMaintenance: Boolean(data.isMaintenance),
        maintenanceImage: data.maintenanceImage || null,
        maintenanceTitle: data.maintenanceTitle || "Sistemimizde Bakım Yapılmaktadır",
        maintenanceDesc: data.maintenanceDesc || "",
        sliderAspectRatio: data.sliderAspectRatio || "16:9",
        logo: data.logo || null,
        favicon: data.favicon || null,
        siteTitle: data.siteTitle || "Atanıyorum Hocam",
      },
      create: {
        id: "default",
        isMaintenance: Boolean(data.isMaintenance),
        maintenanceImage: data.maintenanceImage || null,
        maintenanceTitle: data.maintenanceTitle || "Sistemimizde Bakım Yapılmaktadır",
        maintenanceDesc: data.maintenanceDesc || "",
        sliderAspectRatio: data.sliderAspectRatio || "16:9",
        logo: data.logo || null,
        favicon: data.favicon || null,
        siteTitle: data.siteTitle || "Atanıyorum Hocam",
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Ayarlar güncellenirken hata oluştu." }, { status: 500 });
  }
}
