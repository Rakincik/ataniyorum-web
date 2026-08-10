"use client";

import Link from "next/link";
import Image from "next/image";
import { User, ShoppingCart, ChevronDown, BookOpen, GraduationCap, Brain, Compass, HelpCircle, Trophy, Sparkles, MessageCircle, AlertCircle, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { Category } from "@/generated/prisma/client";

import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";

const getCategoryIcon = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes("sinif") || s.includes("sınıf")) return <GraduationCap className="w-4 h-4" />;
  if (s.includes("okul") || s.includes("oncesi")) return <Brain className="w-4 h-4" />;
  if (s.includes("turkce") || s.includes("türkçe") || s.includes("edebiyat")) return <BookOpen className="w-4 h-4" />;
  if (s.includes("matematik") || s.includes("mat")) return <Compass className="w-4 h-4" />;
  if (s.includes("pdr") || s.includes("rehberlik")) return <Trophy className="w-4 h-4" />;
  if (s.includes("sosyal") || s.includes("tarih") || s.includes("cografya")) return <Compass className="w-4 h-4" />;
  return <HelpCircle className="w-4 h-4" />;
};

export default function NavbarClient({ categories, logo, dersPaneliUrl }: { categories: Category[]; logo?: string | null; dersPaneliUrl?: string | null }) {
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
      {/* Dynamic Apple Style Announcement Banner (Bilgi Şeridi - Menünün Üzerinde) */}
      {announcement && announcement.isActive && (
        <div className="bg-[#f5f5f7] dark:bg-zinc-800 py-3 px-4 text-center border-b border-gray-200 dark:border-white/10">
          <p className="text-xs sm:text-sm text-[#1d1d1f] dark:text-zinc-200 font-semibold">
            {announcement.text}
            {announcement.linkText && (
              <Link href={announcement.linkUrl || "/#courses"} className="text-primary-600 dark:text-primary-400 hover:underline ml-1 inline-flex items-center gap-1 font-bold">
                {announcement.linkText} <span className="text-[11px]">⊕</span>
              </Link>
            )}
          </p>
        </div>
      )}

      <nav className="sticky top-0 z-50 bg-[#102a43]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-white p-1 shadow-sm">
              <Image 
                src={logo || "/logo.png"} 
                alt="Atanıyorum Hocam Logo" 
                fill
                className="object-contain group-hover:scale-105 transition-transform"
                unoptimized
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Atanıyorum Hocam
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
                className={`text-base font-bold transition-colors flex items-center gap-1.5 ${
                  pathname === '/' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Eğitimler
                <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Link>
              
              {/* Mega Menu Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[920px] bg-white dark:bg-[#0f1d3a] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 p-8 overflow-hidden animate-fade-in-up flex flex-col justify-between gap-6 z-[100]">
                  <div className="grid grid-cols-3 gap-6">
                    {categories.slice(0, 9).map((c) => (
                      <Link 
                        key={c.id} 
                        href={`/?category=${c.slug}#courses`}
                        className="group flex items-start gap-4 p-3 rounded-2xl hover:bg-primary-50/70 dark:hover:bg-white/5 transition-all duration-200"
                      >
                        <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-white/5 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                          {getCategoryIcon(c.slug)}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-base font-extrabold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                            {c.name}
                          </span>
                          <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                            {c.description || "Nokta atışı hazırlık seti."}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link 
                    href="/#courses"
                    className="inline-flex items-center gap-1.5 text-sm font-black text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors pt-4 border-t border-gray-100 dark:border-white/5"
                  >
                    Tüm Eğitim Programlarını İncele <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/team" 
              className={`text-base font-bold transition-colors ${
                pathname === '/team' ? 'text-white border-b-2 border-white pb-1.5 mt-1' : 'text-white/80 hover:text-white'
              }`}
            >
              Kadromuz
            </Link>
            <Link 
              href="/about" 
              className={`text-base font-bold transition-colors ${
                pathname === '/about' ? 'text-white border-b-2 border-white pb-1.5 mt-1' : 'text-white/80 hover:text-white'
              }`}
            >
              Hakkımızda
            </Link>
            <Link 
              href="/contact" 
              className={`text-base font-bold transition-colors ${
                pathname === '/contact' ? 'text-white border-b-2 border-white pb-1.5 mt-1' : 'text-white/80 hover:text-white'
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

            {/* Ders Paneli Button */}
            <a 
              href={dersPaneliUrl || "https://atanis.ataniyorumhocam.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-primary-400" />
              <span className="hidden sm:inline">Ders Paneli</span>
              <span className="sm:hidden">Panel</span>
            </a>

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

    </>
  );
}
