import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function About() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 bg-brand-dark">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <ScrollReveal>
          <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0 overflow-hidden">
            <Image
              src="/images/gallery/761113087_967771969616032_8933778599770807281_n.jpg"
              alt="IkeBlendz at work"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 40vw"
            />
            <div className="absolute inset-0 border border-brand-gold/20" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-brand-gold" />
              <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">The Barber</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-white mb-6">
              About IkeBlendz
            </h2>
            <div className="space-y-4 text-brand-light/70 leading-relaxed">
              <p>
                {/* PLACEHOLDER — Replace with real bio */}
                Based in Fremont, California, IkeBlendz delivers premium barbering with an emphasis on precision, clean technique, and personal style. Every cut is crafted with attention to detail and a commitment to making sure you leave looking and feeling your best.
              </p>
              <p>
                {/* PLACEHOLDER — Replace with real specialties */}
                Specializing in skin fades, tapers, beard shaping, and modern men&apos;s cuts, IkeBlendz brings a refined approach to the craft — blending technical skill with an eye for what works for each individual client.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { label: "Precision Fades", value: "Specialty" },
                { label: "Fremont, CA", value: "Location" },
                { label: "By Appointment", value: "Booking" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-brand-gold font-display text-lg sm:text-xl font-bold">{stat.value}</div>
                  <div className="text-brand-muted text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
