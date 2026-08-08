import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getApprovedReviews, averageRating } from "@/lib/data";

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

export default async function ReviewsPreview() {
  const reviews = await getApprovedReviews();
  const featured = reviews.slice(0, 3);
  const avg = averageRating(reviews);

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-brand-gold" />
            <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Testimonials</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-white">
                Client Reviews
              </h2>
              {reviews.length > 0 && (
                <p className="text-brand-muted mt-2">
                  <span className="text-brand-gold font-semibold">{avg.toFixed(1)}</span> average from {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </p>
              )}
            </div>
            <Link href="/reviews" className="text-sm text-brand-muted hover:text-brand-gold tracking-widest uppercase transition-colors">
              See All Reviews &rarr;
            </Link>
          </div>
        </ScrollReveal>

        {featured.length === 0 ? (
          <ScrollReveal>
            <div className="bg-brand-charcoal border border-white/5 p-8 text-center">
              <p className="text-brand-muted">No reviews yet — be the first to leave one!</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((r, i) => (
              <ScrollReveal key={r.id} delay={i * 100}>
                <div className="bg-brand-charcoal border border-white/5 p-6 sm:p-8">
                  <Stars rating={r.rating} />
                  <p className="mt-4 text-brand-light/70 text-sm leading-relaxed italic">
                    &ldquo;{r.body}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-brand-white text-sm font-semibold">{r.customer_name}</span>
                    <span className="text-brand-muted text-xs">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal delay={300}>
          <div className="mt-12 text-center">
            <Link
              href="/reviews"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-gold/40 text-brand-gold text-sm tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-all duration-300"
            >
              Leave a Review
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
