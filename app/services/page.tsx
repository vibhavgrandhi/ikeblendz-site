import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getActiveServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Haircuts, fades, tapers, beard trims, and more. View the full IkeBlendz service menu and book your appointment.",
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-28 px-5 sm:px-8 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-brand-gold" />
          <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Menu</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-white mb-4">
          Services &amp; Pricing
        </h1>
        <p className="text-brand-muted text-lg max-w-xl mb-12">
          Every service is tailored to you. Prices are starting rates and may vary.
        </p>
      </ScrollReveal>

      {services.length === 0 ? (
        <p className="text-brand-muted py-12 text-center">No services available right now. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {services.map((s, i) => (
            <ScrollReveal key={s.id} delay={i * 80}>
              <div className="group bg-brand-charcoal border border-white/5 hover:border-brand-gold/30 transition-all duration-300 overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-brand-white font-display text-xl font-bold">{s.name}</h2>
                    <span className="text-brand-gold font-display text-2xl font-bold ml-4">${s.price}</span>
                  </div>
                  <p className="text-brand-muted text-sm leading-relaxed mb-1">{s.description}</p>
                  <span className="text-brand-muted/50 text-xs">{s.duration_minutes} min</span>
                </div>
                <Link
                  href={`/book?service=${encodeURIComponent(s.name)}`}
                  className="block text-center py-3.5 border-t border-white/5 text-brand-gold text-xs tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-all duration-300"
                >
                  Book This Service
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
