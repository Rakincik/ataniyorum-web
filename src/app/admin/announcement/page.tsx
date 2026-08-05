import { prisma } from "@/lib/prisma";
import AdminAnnouncementClient from "./AdminAnnouncementClient";

export default async function AdminAnnouncementPage() {
  let announcement = await prisma.announcement.findFirst();

  if (!announcement) {
    announcement = await prisma.announcement.create({
      data: {
        text: "Şimdi 2026 KPSS ÖABT eğitimlerini erken kayıt fiyatlarıyla satın alabilirsiniz.",
        linkText: "Daha fazla bilgi",
        linkUrl: "/#courses",
        isActive: true
      }
    });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <AdminAnnouncementClient initialData={announcement} />
    </div>
  );
}
