import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      try {
        settings = await prisma.siteSettings.create({
          data: { id: "default" }
        });
      } catch (createError: any) {
        if (createError.code === "P2002") {
          settings = await prisma.siteSettings.findFirst();
        } else {
          throw createError;
        }
      }
    }

    if (!settings) {
      return {
        id: "default",
        isMaintenance: false,
        maintenanceImage: null,
        maintenanceTitle: "Sistemimizde Bakım Yapılmaktadır",
        maintenanceDesc: "Sizlere daha iyi hizmet verebilmek için altyapı çalışması yürütüyoruz. Kısa süre içerisinde tekrar yayında olacağız.",
        sliderAspectRatio: "16:9",
        updatedAt: new Date()
      };
    }

    return settings;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return {
      id: "default",
      isMaintenance: false,
      maintenanceImage: null,
      maintenanceTitle: "Sistemimizde Bakım Yapılmaktadır",
      maintenanceDesc: "Sizlere daha iyi hizmet verebilmek için altyapı çalışması yürütüyoruz. Kısa süre içerisinde tekrar yayında olacağız.",
      sliderAspectRatio: "16:9",
      updatedAt: new Date()
    };
  }
}
