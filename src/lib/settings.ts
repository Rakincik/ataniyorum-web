import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" }
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "default" }
      });
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
      updatedAt: new Date()
    };
  }
}
