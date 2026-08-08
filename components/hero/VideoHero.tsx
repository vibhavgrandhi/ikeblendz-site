"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TypewriterHeadline from "./TypewriterHeadline";

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[1200px] overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/video/hero-poster.jpg"
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/60 via-brand-black/30 to-brand-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-black/40 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end pb-16 sm:pb-24 lg:pb-32 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="w-8 h-px bg-brand-gold" />
            <span className="text-brand-gold text-xs tracking-[0.3em] uppercase font-body">
              Fremont, California
            </span>
          </motion.div>

          <TypewriterHeadline text="IkeBlendz" splitAt={3} />

          <p className="mt-6 text-lg sm:text-xl text-brand-light/80 font-body leading-relaxed max-w-lg">
            Precision cuts. Clean fades. Crafted with detail for the modern gentleman.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-gold text-brand-black font-semibold text-sm tracking-widest uppercase hover:bg-brand-gold-light transition-all duration-300 hover:translate-y-[-2px]"
            >
              Book Appointment
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 border border-brand-white/30 text-brand-white text-sm tracking-widest uppercase hover:border-brand-gold hover:text-brand-gold transition-all duration-300"
            >
              View Services
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden sm:block">
        <svg className="w-5 h-5 text-brand-white/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
