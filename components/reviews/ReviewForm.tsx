"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function Stars({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type={interactive ? "button" : undefined}
          whileTap={interactive ? { scale: 0.85 } : undefined}
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <svg
            className={`w-5 h-5 ${star <= rating ? "text-brand-gold" : "text-brand-gray"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </motion.button>
      ))}
    </div>
  );
}

export default function ReviewForm() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!name.trim() || !body.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: name, rating, body }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }
      setSubmitted(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence initial={false}>
      {!showForm && !submitted && (
        <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="px-10 py-3.5 bg-brand-gold text-brand-black font-semibold text-sm tracking-widest uppercase hover:bg-brand-gold-light transition-colors"
          >
            Leave a Review
          </motion.button>
        </motion.div>
      )}

      {showForm && !submitted && (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          onSubmit={submit}
          className="bg-brand-charcoal border border-white/5 p-6 sm:p-8 max-w-xl mx-auto"
        >
          <h2 className="text-brand-white text-lg font-semibold mb-6">Write a Review</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-brand-muted text-xs tracking-wider uppercase mb-2">Rating</label>
              <Stars rating={rating} interactive onChange={setRating} />
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider uppercase mb-1.5">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-dark border border-white/10 text-brand-white px-4 py-3 focus:border-brand-gold focus:outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider uppercase mb-1.5">Review *</label>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full bg-brand-dark border border-white/10 text-brand-white px-4 py-3 focus:border-brand-gold focus:outline-none transition-colors resize-none"
                placeholder="How was your experience?"
              />
            </div>
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          </div>
          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3.5 bg-brand-gold text-brand-black font-semibold text-sm tracking-widest uppercase hover:bg-brand-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </motion.form>
      )}

      {submitted && (
        <motion.div key="thanks" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-gold/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-brand-white text-xl font-semibold mb-2">Thank You!</h2>
          <p className="text-brand-muted text-sm">Your review is live.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
