"use client";

import Link from "next/link";
import Image from "next/image";
import { User, ShoppingCart, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { Category } from "@/generated/prisma/client";

import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";

export default function NavbarClient({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { getCartCount, openCart } = useCart();
  const { data: session } = useSession();

  const cartCount = getCartCount();

  const [announcement, setAnnouncement] = useState<{
    text: string;
    linkText?: string;
    linkUrl?: string;
    isActive: boolean;
  } | null>({
    text: "Şimdi 2026 KPSS ÖABT eğitimlerini erken kayıt fiyatlarıyla satın alabilirsiniz.",
    linkText: "Daha fazla bilgi",
    linkUrl: "/#courses",
    isActive: true
  });

  useEffect(() => {
    fetch("/api/announcement")
      .then(res => res.json())
      .then(data => {
        if (data.announcement) {
          setAnnouncement(data.announcement);
        }
      })
      .catch(() => {});
  }, []);

  if (isAdmin) return null; // Don't show public navbar in admin panel

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#102a43]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-white p-1 shadow-sm">
              <Image 
                src="/logo.png" 
                alt="Atanıyorum Hocam Logo" 
                fill
                className="object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Atanıyorum <span className="text-primary-400">Hocam</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 h-full">
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link 
                href="/#courses" 
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  pathname === '/' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Eğitimler
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Link>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 overflow-hidden animate-fade-in-up">
                  <div className="px-4 pb-2 mb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kategoriler</span>
                  </div>
                  {categories.map((c) => (
                    <Link 
                      key={c.id} 
                      href={`/?category=${c.slug}#courses`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                  <Link 
                    href="/#courses"
                    className="block px-4 py-2.5 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors border-t border-gray-50 mt-1"
                  >
                    Tüm Eğitimleri Gör &rarr;
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/team" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/team' ? 'text-white border-b-2 border-white pb-1 mt-1' : 'text-white/80 hover:text-white'
              }`}
            >
              Kadromuz
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/about' ? 'text-white border-b-2 border-white pb-1 mt-1' : 'text-white/80 hover:text-white'
              }`}
            >
              Hakkımızda
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/contact' ? 'text-white border-b-2 border-white pb-1 mt-1' : 'text-white/80 hover:text-white'
              }`}
            >
              İletişim
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={openCart}
              className="p-2 hover:bg-white/10 rounded-full transition-colors relative text-white/80 hover:text-white cursor-pointer"
              title="Sepetim"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[11px] font-black flex items-center justify-center rounded-full border-2 border-[#102a43] shadow-md animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {session ? (
              <div className="flex items-center gap-3">
                {session.user?.role === "ADMIN" && (
                  <Link 
                    href="/admin" 
                    className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black rounded-full transition-all shadow-md hover:shadow-lg border border-primary-400 cursor-pointer"
                  >
                    Yönetim Paneli
                  </Link>
                )}
                <span className="text-xs font-bold text-white hidden sm:inline-block bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  👋 {session.user?.name || "Öğrenci"}
                </span>
                <button 
                  onClick={() => signOut()} 
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium text-white transition-colors">
                <User className="w-4 h-4" />
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Dynamic Apple Style Announcement Banner */}
      {announcement && announcement.isActive && (
        <div className="mt-16 bg-[#f5f5f7] py-3 px-4 text-center border-b border-gray-200">
          <p className="text-xs sm:text-sm text-[#1d1d1f] font-semibold">
            {announcement.text}
            {announcement.linkText && (
              <Link href={announcement.linkUrl || "/#courses"} className="text-primary-600 hover:underline ml-1 inline-flex items-center gap-1 font-bold">
                {announcement.linkText} <span className="text-[11px]">⊕</span>
              </Link>
            )}
          </p>
        </div>
      )}
    </>
  );
}
