import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({
      isMaintenance: settings.isMaintenance,
      maintenanceImage: settings.maintenanceImage,
      maintenanceTitle: settings.maintenanceTitle,
      maintenanceDesc: settings.maintenanceDesc,
      sliderAspectRatio: settings.sliderAspectRatio || "16:9",
    });
  } catch (error) {
    return NextResponse.json({
      isMaintenance: false,
      maintenanceImage: null,
      maintenanceTitle: null,
      maintenanceDesc: null,
      sliderAspectRatio: "16:9",
    });
  }
}
