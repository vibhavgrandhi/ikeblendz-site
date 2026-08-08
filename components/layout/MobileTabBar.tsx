"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Services",
    href: "/services",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: "Book",
    href: "/book",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    highlight: true,
  },
  {
    label: "Gallery",
    href: "/gallery",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Reviews",
    href: "/reviews",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "/contact",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    // On non-home pages always show immediately
    if (!isHome) {
      setVisible(true);
      return;
    }
    // If already revealed this session, show immediately
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("tabsRevealed")) {
      setVisible(true);
      revealedRef.current = true;
      return;
    }
    // Start hidden, reveal after scrolling past hero (100vh)
    setVisible(false);
    const checkScroll = () => {
      if (!revealedRef.current && window.scrollY >= window.innerHeight * 0.85) {
        revealedRef.current = true;
        setVisible(true);
        sessionStorage.setItem("tabsRevealed", "1");
        window.removeEventListener("scroll", checkScroll);
      }
    };
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [isHome]);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-brand-black/95 backdrop-blur-md border-t border-white/8 transition-transform duration-500 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          if (tab.highlight) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              >
                <span className={`flex items-center justify-center w-10 h-8 rounded-full transition-all ${
                  active ? "bg-brand-gold scale-110" : "border border-brand-gold"
                }`}>
                  <span className={active ? "text-brand-black" : "text-brand-gold"}>{tab.icon}</span>
                </span>
                <span className={`text-[10px] font-semibold tracking-wider uppercase ${active ? "text-brand-gold" : "text-brand-muted"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? "text-brand-gold" : "text-brand-muted hover:text-brand-white"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] tracking-wider uppercase">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
