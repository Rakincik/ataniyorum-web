import { prisma } from "@/lib/prisma";
import AdminFeaturesClient from "./AdminFeaturesClient";

export default async function AdminFeaturesPage() {
  const features = await prisma.feature.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-6">
      <AdminFeaturesClient initialFeatures={features} />
    </div>
  );
}
