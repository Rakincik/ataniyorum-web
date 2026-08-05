"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slider = {
  id: string;
  image: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
};

export default function HeroSlider({ sliders }: { sliders: Slider[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  if (sliders.length === 0) {
    return (
      <div className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
          Eğitimde <span className="text-primary-600">Yeni Nesil</span> Deneyim
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl mb-10">
          Admin panelinden slider eklediğinizde burada görünecektir. Şimdilik varsayılan görünümdesiniz.
        </p>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] min-h-[500px] overflow-hidden bg-gray-100 group">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src={sliders[currentIndex].image}
              alt={sliders[currentIndex].title}
              fill
              className="object-cover"
              priority
            />
            {/* Subtle gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 max-w-3xl leading-tight"
            >
              {sliders[currentIndex].title}
            </motion.h1>

            {sliders[currentIndex].subtitle && (
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg md:text-xl text-white/90 max-w-2xl mb-8"
              >
                {sliders[currentIndex].subtitle}
              </motion.p>
            )}

            {sliders[currentIndex].buttonText && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Link 
                  href={sliders[currentIndex].buttonLink || "#courses"}
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-colors shadow-apple"
                >
                  {sliders[currentIndex].buttonText}
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {sliders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? "bg-white w-8" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
