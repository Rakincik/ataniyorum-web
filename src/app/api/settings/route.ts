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
    });
  } catch (error) {
    return NextResponse.json({
      isMaintenance: false,
      maintenanceImage: null,
      maintenanceTitle: null,
      maintenanceDesc: null,
    });
  }
}
