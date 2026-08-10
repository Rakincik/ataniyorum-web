"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, Tag, Users, ShoppingBag, 
  ImageIcon, ChevronDown, Layers, GraduationCap 
} from "lucide-react";

type MenuSection = {
  title: string;
  icon: React.ElementType;
  items: { label: string; href: string }[];
};

const menuSections: MenuSection[] = [
  {
    title: "Satış & Pazarlama",
    icon: Tag,
    items: [
      { label: "Kuponlar", href: "/admin/coupons" },
    ]
  },
  {
    title: "İçerik Yönetimi",
    icon: ImageIcon,
    items: [
      { label: "Üst Duyuru Bandı", href: "/admin/announcement" },
      { label: "Hakkımızda Sayfası", href: "/admin/about" },
      { label: "Slider (Afişler)", href: "/admin/sliders" },
      { label: "Eğitmen Kadromuz", href: "/admin/instructors" },
      { label: "Ana Sayfa Özellikleri", href: "/admin/features" },
      { label: "İstatistikler", href: "/admin/stats" },
      { label: "Site & Bakım Ayarları", href: "/admin/settings" },
    ]
  }
];

export default function AdminSidebarClient() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <nav className="flex-1 p-4 space-y-2">
      {/* 1. Dashboard (Standalone) */}
      <Link 
        href="/admin" 
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
          pathname === "/admin" 
            ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" 
            : "text-foreground/70 hover:bg-gray-100 dark:hover:bg-white/5"
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        Dashboard
      </Link>

      {/* 2. Öğrenciler (Standalone) */}
      <Link 
        href="/admin/users" 
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
          pathname === "/admin/users" || pathname?.startsWith("/admin/users/")
            ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" 
            : "text-foreground/70 hover:bg-gray-100 dark:hover:bg-white/5"
        }`}
      >
        <Users className="w-5 h-5" />
        Öğrenciler
      </Link>

      {/* 3. Siparişler (Standalone) */}
      <Link 
        href="/admin/orders" 
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
          pathname === "/admin/orders" || pathname?.startsWith("/admin/orders/")
            ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" 
            : "text-foreground/70 hover:bg-gray-100 dark:hover:bg-white/5"
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        Siparişler
      </Link>

      {/* 4. Eğitimler (Standalone) */}
      <Link 
        href="/admin/products" 
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
          pathname === "/admin/products" || pathname?.startsWith("/admin/products/")
            ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" 
            : "text-foreground/70 hover:bg-gray-100 dark:hover:bg-white/5"
        }`}
      >
        <GraduationCap className="w-5 h-5" />
        Eğitimler
      </Link>

      {/* 5. Kategoriler (Standalone) */}
      <Link 
        href="/admin/categories" 
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
          pathname === "/admin/categories" || pathname?.startsWith("/admin/categories/")
            ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20" 
            : "text-foreground/70 hover:bg-gray-100 dark:hover:bg-white/5"
        }`}
      >
        <Layers className="w-5 h-5" />
        Kategoriler
      </Link>

      {/* Visual Separator */}
      <div className="my-4 border-t border-gray-100 dark:border-white/5"></div>

      {/* 6. Dropdowns (Kalanı Altta) */}
      {menuSections.map((section) => (
        <div key={section.title} className="pt-2">
          <button
            onClick={() => setOpenSection(openSection === section.title ? null : section.title)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl text-foreground/70 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <section.icon className="w-5 h-5" />
              {section.title}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection === section.title ? "rotate-180" : ""}`} />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSection === section.title ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col gap-1 pl-11 pr-2 py-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                        : "text-foreground/60 hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </nav>
  );
}
