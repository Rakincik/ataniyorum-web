import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";
import { getSiteSettings } from "@/lib/settings";

export default async function Navbar() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Error fetching categories for Navbar:", error);
  }
  const settings = await getSiteSettings();

  return <NavbarClient categories={categories} logo={settings?.logo} dersPaneliUrl={settings?.dersPaneliUrl} />;
}

