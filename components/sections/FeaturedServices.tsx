import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getActiveServices } from "@/lib/data";

export default async function FeaturedServices() {
  const services = await getActiveServices();
  const featured = services.slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-brand-gold" />
          <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">What We Offer</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-white">
            Services
          </h2>
          <Link href="/services" className="text-sm text-brand-muted hover:text-brand-gold tracking-widest uppercase transition-colors">
            View All Services &rarr;
          </Link>
        </div>
      </ScrollReveal>

      <div className={`grid grid-cols-2 gap-4 sm:gap-6 ${featured.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3 max-w-4xl mx-auto"}`}>
        {featured.map((s, i) => (
          <ScrollReveal key={s.id} delay={i * 100}>
            <div className="group bg-brand-charcoal border border-white/5 p-5 sm:p-7 hover:border-brand-gold/30 transition-all duration-300">
              <div className="text-brand-gold text-2xl sm:text-3xl font-display font-bold mb-3">
                ${s.price}
              </div>
              <h3 className="text-brand-white font-semibold text-sm sm:text-base mb-2">{s.name}</h3>
              <p className="text-brand-muted text-xs sm:text-sm leading-relaxed mb-4">{s.description}</p>
              <div className="text-brand-muted/60 text-xs">{s.duration_minutes} min</div>
              <Link
                href={`/book?service=${encodeURIComponent(s.name)}`}
                className="mt-4 block text-center py-2.5 border border-brand-gold/40 text-brand-gold text-xs tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-all duration-300"
              >
                Book
              </Link>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
