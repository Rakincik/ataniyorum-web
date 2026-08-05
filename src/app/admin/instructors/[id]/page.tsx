import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditInstructorForm from "./EditInstructorForm";

export default async function EditInstructorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructor = await prisma.instructor.findUnique({
    where: { id }
  });

  if (!instructor) {
    notFound();
  }

  return <EditInstructorForm instructor={instructor} />;
}
