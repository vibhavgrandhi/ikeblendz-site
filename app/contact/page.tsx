import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact IkeBlendz in Fremont, CA. Call or message on Instagram to get in touch.",
};

export default function ContactPage() {
  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-28 px-5 sm:px-8 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-brand-gold" />
          <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Get in Touch</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-white mb-12">
          Contact
        </h1>
      </ScrollReveal>

      <div className="max-w-lg">
        <ScrollReveal delay={200}>
          <div className="space-y-10">
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-4">Location</h2>
              <p className="text-brand-white text-xl font-display font-bold">{SITE.city}, {SITE.state}</p>
              <p className="text-brand-light/70 mt-1 text-sm">Exact address shared upon booking confirmation.</p>
            </div>

            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-4">Phone</h2>
              <a href={`tel:${SITE.phoneRaw}`} className="text-brand-white text-xl hover:text-brand-gold transition-colors">
                {SITE.phone}
              </a>
            </div>

            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-4">Instagram</h2>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="text-brand-white text-xl hover:text-brand-gold transition-colors">
                {SITE.instagramHandle}
              </a>
            </div>

            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-4">Hours</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-light/70">Monday — Friday</span>
                  <span className="text-brand-white">4:00 PM — 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-light/70">Saturday — Sunday</span>
                  <span className="text-brand-white">9:00 AM — 7:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
