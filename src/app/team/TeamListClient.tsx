"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";

export default function TeamListClient({ instructors }: { instructors: any[] }) {
  if (instructors.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Sisteme henüz eğitmen eklenmemiş. Lütfen admin panelinden ekleyiniz.
      </div>
    );
  }

  return (
    <>
      {instructors.map((member, index) => {
        const isEven = index % 2 === 0;
        return (
          <motion.div 
            key={member.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20`}
          >
            {/* Image Side (Reasonable size, not huge) */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] group">
                {member.image && (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                )}
                {/* Subtle color tint overlay for premium feel */}
                <div className={`absolute inset-0 opacity-10 mix-blend-overlay ${member.color}`} />
              </div>
            </div>

            {/* Text Side */}
            <div className="w-full md:w-1/2 flex flex-col items-start text-left">
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${member.color}`} />
                <span className="text-sm font-bold tracking-widest text-[#1d1d1f]/50 uppercase">
                  {member.subject}
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-6 tracking-tight">
                {member.name}
              </h2>
              
              {member.quote && (
                <div className="relative mb-8">
                  <Quote className="absolute -top-4 -left-6 w-12 h-12 text-black/5 -z-10 rotate-180" />
                  <p className="text-xl md:text-2xl font-medium text-[#1d1d1f]/80 leading-snug">
                    "{member.quote}"
                  </p>
                </div>
              )}
              
              {member.description && (
                <p className="text-lg text-[#1d1d1f]/60 leading-relaxed mb-8">
                  {member.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
