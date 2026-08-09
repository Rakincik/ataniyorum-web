import Navbar from "@/components/Navbar";
import Image from "next/image";
import { Quote, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// We need a helper to generate alternate rows in the map
// We can't use `motion` from framer-motion easily in Server Components for the `whileInView`,
// unless we make a separate Client Component for the rows.
// Let's create a Client Component for the rows, or just render them standardly for now.
// Since we have an existing layout with motion, let's wrap it in a client component.
import TeamListClient from "./TeamListClient";

export default async function TeamPage() {
  const instructors = await prisma.instructor.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] pb-32 overflow-hidden">
      <Navbar />

      {/* Floating Background Elements to prevent "plainness" */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-purple-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-rose-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Hero Header */}
      <section className="relative z-10 pt-12 lg:pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
          Eğitimin Mimarları
        </h1>
        <p className="text-xl text-[#1d1d1f]/60 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
          Sıradan dersleri unutun. Sizi doğrudan atanmaya götürecek, alanında marka olmuş isimlerle yola çıkın.
        </p>
      </section>

      {/* Alternating Teacher Rows */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col gap-24 md:gap-32">
        <TeamListClient instructors={instructors} />
      </section>

    </main>
  );
}

