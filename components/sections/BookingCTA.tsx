import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function BookingCTA() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-brand-gold" />
            <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Ready?</span>
            <span className="w-8 h-px bg-brand-gold" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-white mb-6">
            Book Your Next Cut
          </h2>
          <p className="text-brand-light/60 text-lg max-w-xl mx-auto mb-10">
            Fresh cuts, clean fades, and a look you&apos;ll leave confident in. Secure your spot today.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-12 py-4 bg-brand-gold text-brand-black font-semibold text-sm tracking-widest uppercase hover:bg-brand-gold-light transition-all duration-300 hover:translate-y-[-2px]"
          >
            Book Appointment
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
