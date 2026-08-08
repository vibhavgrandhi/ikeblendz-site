import Link from "next/link";
import { SITE, NAV_LINKS } from "@/lib/constants";
import InstagramIcon from "@/components/ui/InstagramIcon";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <Link href="/" className="text-2xl font-display font-bold tracking-wider text-brand-white">
              IKEBLENDZ
            </Link>
            <p className="mt-4 text-brand-muted text-sm leading-relaxed">
              {SITE.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-4">Navigate</h3>
            <div className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-brand-light/70 hover:text-brand-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-4">Hours</h3>
            <div className="space-y-2 text-sm text-brand-light/70">
              <div className="flex justify-between">
                <span>Mon — Fri</span>
                <span>4:00 PM — 7:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sat — Sun</span>
                <span>9:00 AM — 7:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-4">Contact</h3>
            <div className="space-y-2.5 text-sm">
              <a href={`tel:${SITE.phoneRaw}`} className="block text-brand-light/70 hover:text-brand-gold transition-colors">
                {SITE.phone}
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="block text-brand-light/70 hover:text-brand-gold transition-colors">
                {SITE.instagramHandle}
              </a>
              <p className="text-brand-light/70">
                {SITE.city}, {SITE.state}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-xs text-brand-muted">
              &copy; {year} IkeBlendz. All rights reserved.
            </p>
            <Link href="/admin/login" className="text-[10px] text-brand-muted/30 hover:text-brand-muted/60 transition-colors">
              Admin Login
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Instagram">
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a href={`tel:${SITE.phoneRaw}`} className="text-brand-muted hover:text-brand-gold transition-colors" aria-label="Phone">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
