import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getActiveGallery } from "@/lib/data";

export default async function GalleryPreview() {
  const items = await getActiveGallery();
  const images = items.slice(0, 6);

  if (images.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-brand-gold" />
          <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Portfolio</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-white">
            Recent Work
          </h2>
          <Link href="/gallery" className="text-sm text-brand-muted hover:text-brand-gold tracking-widest uppercase transition-colors">
            View Full Gallery &rarr;
          </Link>
        </div>
      </ScrollReveal>

      <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
        {images.map((img, i) => (
          <ScrollReveal key={img.id} delay={i * 80} className="break-inside-avoid">
            <Link href="/gallery" className="group relative block overflow-hidden">
              <Image
                src={img.image_url}
                alt={img.caption || "IkeBlendz gallery photo"}
                width={600}
                height={i % 3 === 0 ? 750 : 600}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/30 transition-colors duration-300" />
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
