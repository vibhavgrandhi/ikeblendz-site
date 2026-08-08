import { SITE } from "@/lib/constants";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Location() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-brand-gold" />
            <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Find Us</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-white mb-12">
            Location &amp; Hours
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScrollReveal>
            <div className="aspect-video lg:aspect-auto lg:h-full min-h-[300px] overflow-hidden relative">
              <iframe
                title="IkeBlendz location"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${SITE.mapQuery}`}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-col justify-center gap-8">
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-3">Location</h3>
                <p className="text-brand-white text-lg">{SITE.city}, {SITE.state}</p>
                <p className="text-brand-light/70 text-sm mt-1">Exact address shared upon booking confirmation.</p>
              </div>

              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-3">Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-brand-light/70">
                    <span>Monday — Friday</span>
                    <span className="text-brand-white">4:00 PM — 7:00 PM</span>
                  </div>
                  <div className="flex justify-between text-brand-light/70">
                    <span>Saturday — Sunday</span>
                    <span className="text-brand-white">9:00 AM — 7:00 PM</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-brand-muted mb-3">Contact</h3>
                <div className="space-y-2">
                  <a href={`tel:${SITE.phoneRaw}`} className="block text-brand-light/70 hover:text-brand-gold transition-colors">
                    {SITE.phone}
                  </a>
                  <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="block text-brand-light/70 hover:text-brand-gold transition-colors">
                    {SITE.instagramHandle}
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
