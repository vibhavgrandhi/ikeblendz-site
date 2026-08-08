import ScrollReveal from "@/components/ui/ScrollReveal";
import GalleryClient from "@/components/gallery/GalleryClient";
import { getActiveGallery } from "@/lib/data";

export default async function GalleryPage() {
  const items = await getActiveGallery();

  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-28 px-5 sm:px-8 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-brand-gold" />
          <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Portfolio</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-white mb-4">
          Gallery
        </h1>
        <p className="text-brand-muted text-lg max-w-xl mb-12">
          A showcase of cuts, fades, and styles by IkeBlendz.
        </p>
      </ScrollReveal>

      <GalleryClient items={items} />
    </div>
  );
}
