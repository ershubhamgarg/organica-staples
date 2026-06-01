"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Star, Quote } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { supabase } from "@/utils/supabase";

type Review = {
  id: string;
  user_name: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string;
  product_name?: string;
};

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchTopReviews() {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(name)")
        .gte("rating", 4)
        .neq("comment", "")
        .not("comment", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        const formattedReviews = data
          .filter((r: any) => r.comment && r.comment.trim().length > 0)
          .slice(0, 10)
          .map((r: any) => ({
            ...r,
            product_name: r.products?.name,
          }));
        setReviews(formattedReviews);
      }
    }

    fetchTopReviews();
  }, []);

  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;

    timeoutRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [reviews.length, isPaused]);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-16 overflow-hidden border-t border-brand-gold/10">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="h-[1px] w-6 bg-brand-gold" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-gold">
              Community Voices
            </span>
            <span className="h-[1px] w-6 bg-brand-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-brand-brown tracking-tight">
            Trust in every <span className="italic text-brand-terracotta">shubh-aarambh.</span>
          </h2>
        </ScrollReveal>

        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative min-h-[320px] md:min-h-[280px] flex items-center justify-center">
            {reviews.map((review, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={review.id}
                  className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-1000 ease-in-out px-4 md:px-12 ${
                    isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
                  }`}
                >
                  <Quote className="text-brand-gold/15 w-12 h-12 mb-6 shrink-0" strokeWidth={1} />
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < (review.rating || 0) ? "var(--color-brand-gold)" : "none"} 
                        className={i < (review.rating || 0) ? "text-brand-gold" : "text-brand-gold/20"}
                      />
                    ))}
                  </div>

                  <p className="text-lg md:text-xl font-serif text-brand-brown leading-relaxed mb-6 max-w-2xl italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>

                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-black text-brand-brown mb-1">
                      {review.user_name || "Verified Customer"}
                    </span>
                    {review.product_name && (
                      <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold">
                        {review.product_name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  idx === activeIndex ? "w-8 bg-brand-gold" : "w-2 bg-brand-gold/20"
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
