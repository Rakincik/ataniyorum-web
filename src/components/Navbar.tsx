import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";
import { getSiteSettings } from "@/lib/settings";

export default async function Navbar() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });
  const settings = await getSiteSettings();

  return <NavbarClient categories={categories} logo={settings?.logo} dersPaneliUrl={settings?.dersPaneliUrl} />;
}
