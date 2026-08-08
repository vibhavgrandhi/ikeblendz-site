import ScrollReveal from "@/components/ui/ScrollReveal";
import ReviewsList from "@/components/reviews/ReviewsList";
import ReviewForm from "@/components/reviews/ReviewForm";
import { getApprovedReviews, averageRating } from "@/lib/data";

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();
  const avg = averageRating(reviews);

  return (
    <div className="pt-24 sm:pt-32 pb-20 sm:pb-28 px-5 sm:px-8 max-w-4xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-brand-gold" />
          <span className="text-brand-gold text-xs tracking-[0.3em] uppercase">Feedback</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-white mb-4">
          Reviews
        </h1>
        {reviews.length > 0 ? (
          <p className="text-brand-muted text-lg mb-12">
            <span className="text-brand-gold font-semibold">{avg.toFixed(1)}</span> average from {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="text-brand-muted text-lg mb-12">Hear from clients who&apos;ve sat in the chair.</p>
        )}
      </ScrollReveal>

      <ScrollReveal>
        <ReviewsList reviews={reviews} />
      </ScrollReveal>

      <ScrollReveal>
        <ReviewForm />
      </ScrollReveal>
    </div>
  );
}
