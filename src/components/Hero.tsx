"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary-50 to-transparent dark:from-primary-900/20 opacity-50 pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            2026 KPSS ÖABT Kayıtları Başladı
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
          >
            ÖABT'de Atanmanın En Kesin Yolu
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-foreground/60 mb-10 leading-relaxed"
          >
            Türkiye'nin en deneyimli öğretmen kadrosuyla, yeni nesil soru tiplerine tam uyumlu eğitim. Hemen başla, hayalindeki kadroya yerleş.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="#courses"
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold transition-all shadow-apple hover:shadow-apple-hover flex items-center justify-center gap-2 group"
            >
              Eğitimleri İncele
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-foreground rounded-2xl font-semibold transition-all shadow-apple flex items-center justify-center border border-gray-200 dark:border-white/10"
            >
              Hemen Kayıt Ol
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: BookOpen, title: "Zengin İçerik", desc: "Güncel müfredata uygun detaylı konu anlatımları" },
            { icon: CheckCircle, title: "Soru Çözümleri", desc: "Çıkmış ve çıkabilecek tüm soru tipleri analizi" },
            { icon: BookOpen, title: "Online Denemeler", desc: "Gerçek sınav provası ile kendini test et" },
          ].map((feature, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-foreground/60 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
