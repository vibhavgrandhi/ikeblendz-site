"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { GalleryItem } from "@/types";

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (items.length === 0) {
    return <p className="text-brand-muted py-16 text-center">Gallery coming soon.</p>;
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
        {items.map((img, i) => (
          <ScrollReveal key={img.id} delay={i * 60} className="break-inside-avoid">
            <button
              onClick={() => setLightbox(i)}
              className="group relative block w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <Image
                src={img.image_url}
                alt={img.caption || "IkeBlendz gallery photo"}
                width={600}
                height={i % 3 === 0 ? 750 : 600}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/30 transition-colors duration-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </div>
            </button>
          </ScrollReveal>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 text-brand-white/60 hover:text-brand-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + items.length) % items.length); }}
              className="absolute left-4 sm:left-8 text-brand-white/60 hover:text-brand-white transition-colors"
              aria-label="Previous"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-4xl max-h-[85vh] w-full aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={items[lightbox].image_url}
                alt={items[lightbox].caption || "IkeBlendz gallery photo"}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % items.length); }}
              className="absolute right-4 sm:right-8 text-brand-white/60 hover:text-brand-white transition-colors"
              aria-label="Next"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <div className="absolute bottom-6 text-brand-muted text-sm">
              {lightbox + 1} / {items.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
