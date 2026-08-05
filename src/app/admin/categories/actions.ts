"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const image = formData.get("image") as string | null;
  const color = formData.get("color") as string | null;
  const isFeatured = formData.get("isFeatured") === "on";

  await prisma.category.create({
    data: {
      name,
      slug,
      description,
      image,
      color,
      isFeatured,
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const image = formData.get("image") as string | null;
  const color = formData.get("color") as string | null;
  const isFeatured = formData.get("isFeatured") === "on";

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      image,
      color,
      isFeatured,
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id }
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
}
