import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Review } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-brand-gold" : "text-brand-gray"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-brand-charcoal border border-white/5 p-8 text-center mb-12">
        <p className="text-brand-muted">No reviews yet — be the first to leave one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
      {reviews.map((r, i) => (
        <ScrollReveal key={r.id} delay={i * 60}>
          <div className="bg-brand-charcoal border border-white/5 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-brand-white font-semibold">{r.customer_name}</span>
              <Stars rating={r.rating} />
            </div>
            <p className="text-brand-light/70 text-sm leading-relaxed">{r.body}</p>
            <span className="block mt-4 text-brand-muted text-xs">
              {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
