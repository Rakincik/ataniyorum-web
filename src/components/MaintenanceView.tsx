"use client";

import Link from "next/link";
import { Lock, Wrench, Sparkles, ShieldAlert } from "lucide-react";
import Image from "next/image";

interface MaintenanceViewProps {
  image?: string | null;
  title?: string | null;
  desc?: string | null;
}

export default function MaintenanceView({ image, title, desc }: MaintenanceViewProps) {
  // If user uploaded a custom maintenance image, render ONLY the image centered cleanly
  if (image) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#090a0f] text-white flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto selection:bg-rose-500 selection:text-white">
        {/* Dynamic Ambient Background Glow Effect */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none" />

        {/* Top Right Admin Login Shortcut */}
        <div className="absolute top-4 right-4 z-20">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Yönetici Girişi</span>
          </Link>
        </div>

        {/* Pure Image Display */}
        <div className="relative max-w-4xl w-full my-auto flex flex-col items-center justify-center z-10">
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/60">
            <img 
              src={image} 
              alt="Bakım Görseli" 
              className="w-full h-auto max-h-[88vh] object-contain mx-auto rounded-3xl" 
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback layout if no custom image is uploaded
  return (
    <div className="fixed inset-0 z-[99999] bg-[#090a0f] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-rose-500 selection:text-white">
      {/* Dynamic Background Glow Effect */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl w-full relative z-10 space-y-8 my-auto py-8 text-center">
        {/* Header Logo */}
        <div className="flex justify-center">
          <div className="relative p-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl flex items-center justify-center group">
            <Image 
              src="/logo.png" 
              alt="Atanıyorum Hocam Logo" 
              width={72} 
              height={72} 
              className="object-contain filter drop-shadow-md" 
            />
          </div>
        </div>

        {/* Maintenance Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-full text-xs font-black tracking-wider uppercase shadow-lg shadow-rose-950/40">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <Wrench className="w-3.5 h-3.5" />
          <span>SİTEMİZ ŞU AN BAKIM MODUNDADIR</span>
        </div>

        {/* Text Content */}
        <div className="space-y-4 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {title || "Sistemimizde Bakım Yapılmaktadır"}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 font-medium leading-relaxed">
            {desc || "Sizlere daha iyi bir deneyim ve hizmet sunabilmek için altyapı güncellemesi yürütüyoruz. Kısa süre içerisinde tekrar canlı yayında olacağız."}
          </p>
        </div>

        {/* Admin Login Link */}
        <div className="pt-6">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Yönetici Girişi</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
