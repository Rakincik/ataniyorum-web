import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import CourseDetailClient from "@/components/CourseDetailClient";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const course = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
      addons: true,
      images: {
        orderBy: { order: "asc" }
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground/50 mb-8">
          <span>Eğitimler</span>
          <span>/</span>
          <span>{course.category.name}</span>
          <span>/</span>
          <span className="text-primary-600 font-medium truncate">{course.title}</span>
        </div>

        <CourseDetailClient course={course as any} />
      </div>
    </main>
  );
}
