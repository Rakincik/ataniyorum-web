import { prisma } from "@/lib/prisma";
import AdminAboutClient from "./AdminAboutClient";

export default async function AdminAboutPage() {
  let about = await prisma.aboutPage.findUnique({
    where: { id: "default" }
  });

  if (!about) {
    about = await prisma.aboutPage.create({
      data: { id: "default" }
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <AdminAboutClient initialData={about} />
    </div>
  );
}
