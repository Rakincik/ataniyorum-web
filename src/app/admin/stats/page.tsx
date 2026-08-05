import { prisma } from "@/lib/prisma";
import AdminStatsClient from "./AdminStatsClient";

export default async function AdminStatsPage() {
  let stats = await prisma.stat.findMany({
    orderBy: { order: "asc" }
  });

  // Default seed if empty
  if (stats.length === 0) {
    await prisma.stat.createMany({
      data: [
        { value: "10.000+", label: "ÖĞRENCİ", order: 1, isActive: true },
        { value: "%98", label: "ATANMA ORANI", order: 2, isActive: true },
        { value: "1 Numara", label: "EĞİTMEN KADROSU", order: 3, isActive: true },
        { value: "7/24", label: "REHBERLİK", order: 4, isActive: true },
      ]
    });

    stats = await prisma.stat.findMany({
      orderBy: { order: "asc" }
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <AdminStatsClient initialStats={stats} />
    </div>
  );
}
