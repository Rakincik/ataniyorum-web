import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return <NavbarClient categories={categories} />;
}
