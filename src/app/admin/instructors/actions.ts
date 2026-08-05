"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteInstructor(id: string) {
  await prisma.instructor.delete({
    where: { id },
  });
  revalidatePath("/admin/instructors");
  revalidatePath("/team");
}

export async function createInstructor(data: {
  name: string;
  subject: string;
  quote?: string;
  description?: string;
  image: string;
  color?: string;
  order: number;
  isActive: boolean;
}) {
  await prisma.instructor.create({
    data: {
      name: data.name,
      subject: data.subject,
      quote: data.quote,
      description: data.description,
      image: data.image,
      color: data.color || "bg-blue-500",
      order: data.order,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/instructors");
  revalidatePath("/team");
}

export async function updateInstructor(
  id: string,
  data: {
    name: string;
    subject: string;
    quote?: string;
    description?: string;
    image: string;
    color?: string;
    order: number;
    isActive: boolean;
  }
) {
  await prisma.instructor.update({
    where: { id },
    data: {
      name: data.name,
      subject: data.subject,
      quote: data.quote,
      description: data.description,
      image: data.image,
      color: data.color || "bg-blue-500",
      order: data.order,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/instructors");
  revalidatePath("/team");
}
