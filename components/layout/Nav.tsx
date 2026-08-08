"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE } from "@/lib/constants";
import InstagramIcon from "@/components/ui/InstagramIcon";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-brand-black/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="text-xl sm:text-2xl font-display font-bold tracking-wider text-brand-white hover:text-brand-gold transition-colors">
            IKEBLENDZ
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-widest uppercase transition-colors ${
                  pathname === link.href
                    ? "text-brand-gold"
                    : "text-brand-light/70 hover:text-brand-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IkeBlendz on Instagram"
              className="hover:scale-110 transition-transform"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <Link
              href="/book"
              className="ml-2 px-6 py-2.5 bg-brand-gold text-brand-black text-sm font-semibold tracking-wider uppercase hover:bg-brand-gold-light transition-colors"
            >
              Book Now
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="hidden relative w-8 h-8 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <span className={`block absolute h-0.5 w-6 bg-brand-white transition-all duration-300 ${open ? "rotate-45" : "-translate-y-2"}`} />
            <span className={`block absolute h-0.5 w-6 bg-brand-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block absolute h-0.5 w-6 bg-brand-white transition-all duration-300 ${open ? "-rotate-45" : "translate-y-2"}`} />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-brand-black/98 backdrop-blur-lg transition-all duration-500 md:hidden flex flex-col items-center justify-center ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-2xl tracking-widest uppercase transition-all duration-300 ${
                pathname === link.href ? "text-brand-gold" : "text-brand-light/80 hover:text-brand-white"
              }`}
              style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="mt-4 px-10 py-3.5 bg-brand-gold text-brand-black text-lg font-semibold tracking-wider uppercase hover:bg-brand-gold-light transition-colors"
            style={{ transitionDelay: open ? `${NAV_LINKS.length * 60}ms` : "0ms" }}
          >
            Book Now
          </Link>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="IkeBlendz on Instagram"
            className="mt-2"
            style={{ transitionDelay: open ? `${(NAV_LINKS.length + 1) * 60}ms` : "0ms" }}
          >
            <InstagramIcon className="w-7 h-7" />
          </a>
        </div>
      </div>
    </>
  );
}
