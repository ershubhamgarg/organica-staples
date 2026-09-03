"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Bell,
  X,
  CheckCircle2,
  Check,
  Sparkles,
} from "lucide-react";
import { Product, getProductThumbnail, isProductAvailable } from "@/lib/data";
import { getUnitPriceInfo } from "@/lib/pricing";

interface LaunchCarouselProps {
  products: Product[];
}

export default function LaunchCarousel({ products }: LaunchCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPaused || showInterestForm) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length, isPaused, showInterestForm]);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % products.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showInterestForm) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/launch-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: showInterestForm,
          name: formData.name,
          email: formData.email,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Namaste! We'll notify you when it's available.",
        });
        setFormData({ name: "", email: "" });
        setTimeout(() => setShowInterestForm(null), 3000);
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Something went wrong.",
        });
      }
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message: "Unable to submit. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative w-full flex items-center overflow-hidden bg-[#fdfbf7] py-8 lg:py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Color Blobs */}
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[60%] bg-brand-green/15 blur-[120px] rounded-full animate-pulse-slow" />
        <div
          className="absolute -bottom-[15%] -right-[5%] w-[40%] h-[60%] bg-brand-gold/20 blur-[120px] rounded-full animate-pulse-slow"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute top-[15%] right-[15%] w-[20%] h-[30%] bg-brand-terracotta/10 blur-[100px] rounded-full animate-float" />

        {/* Pattern Overlays */}
        <div className="absolute inset-0 opacity-[0.03] bg-jute mix-blend-multiply" />
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-3xl border border-brand-gold/20 shadow-[0_25px_50px_-12px_rgba(60,54,42,0.1)]">
          <div
            className="flex transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {products.map((product) => {
              const unitPriceInfo = getUnitPriceInfo(product);
              const imageUrl = getProductThumbnail(product);
              const isComingSoon =
                product.isLaunchingSoon ||
                product.launch_status === "launching_soon";
              const isJustLaunched =
                product.justLaunched ||
                product.launch_status === "just_launched";
              const isAvailable = isProductAvailable(product) && !isComingSoon;

              return (
                <div
                  key={product.id}
                  className="min-w-full grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-16 p-6 lg:p-10 items-center"
                >
                  {/* Product Visual Container */}
                  <div className="relative aspect-square max-w-[300px] mx-auto w-full group">
                    {/* Glowing Aura */}
                    <div
                      className={`absolute -inset-8 rounded-full blur-2xl opacity-30 animate-pulse-slow ${
                        isAvailable
                          ? "bg-brand-green/20"
                          : "bg-brand-terracotta/20"
                      }`}
                    />

                    <div className="absolute -inset-4 bg-gradient-to-br from-brand-gold/15 via-white/50 to-brand-green/15 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-float-slow group-hover:scale-105 transition-all duration-1000 border border-white/50" />

                    <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-xl border-2 border-white ring-1 ring-brand-gold/5">
                      <ImageWithFallback
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 400px"
                        priority
                      />
                      {/* Image Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/5 to-transparent opacity-30" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute -top-3 -right-3 z-30 transform hover:scale-105 transition-transform">
                      <span
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg border border-white/40 ${
                          isAvailable
                            ? "bg-brand-green text-brand-cream"
                            : "bg-brand-terracotta text-brand-cream"
                        }`}
                      >
                        {isJustLaunched ? (
                          <>
                            <Sparkles size={12} strokeWidth={2.5} />
                            Just Launched
                          </>
                        ) : isAvailable ? (
                          <>
                            <CheckCircle2 size={12} strokeWidth={2.5} />
                            In Stock
                          </>
                        ) : (
                          <>
                            <Bell size={12} strokeWidth={2.5} />
                            Coming Soon
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="text-left space-y-6 lg:pr-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-[9px] uppercase tracking-[0.2em] font-bold border border-brand-green/10">
                          {product.category}
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-brand-gold bg-brand-gold/5 px-3 py-1 rounded-full border border-brand-gold/5">
                          {product.weight}
                        </span>
                      </div>

                      <h2 className="text-3xl lg:text-4xl font-serif text-brand-brown leading-tight tracking-tight">
                        {product.name}
                        {product.name2 && (
                          <span className="block text-brand-gold italic text-2xl mt-1 font-devanagari">
                            {product.name2}
                          </span>
                        )}
                      </h2>

                      {/* Benefits Highlights */}
                      {product.benefits && product.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-3 border-t border-brand-gold/5">
                          {product.benefits.slice(0, 3).map((benefit, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 group/benefit"
                            >
                              <div className="w-5 h-5 rounded-full bg-brand-green text-white flex items-center justify-center shadow-md shadow-brand-green/10 group-hover/benefit:scale-110 transition-transform">
                                <Check size={10} strokeWidth={3} />
                              </div>
                              <span className="text-[10px] font-bold text-brand-brown/60 uppercase tracking-widest">
                                {benefit}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {isAvailable ? (
                      <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-brand-brown/30 mb-0.5">
                              Price
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-brand-brown tracking-tighter">
                                ₹{product.price}
                              </span>
                              {unitPriceInfo && (
                                <span className="text-[10px] font-semibold text-brand-gold uppercase tracking-widest">
                                  {unitPriceInfo}
                                </span>
                              )}
                            </div>
                          </div>
                          {!!product.discount && (
                            <div className="mt-3 px-4 py-1.5 bg-brand-green text-white rounded-xl shadow-lg shadow-brand-green/10">
                              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                                {product.discount}% OFF
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-5">
                          <Link
                            href={`/product/${product.id}`}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-brown text-brand-cream rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-green transition-all duration-500 hover:translate-y-[-2px] group active:scale-95"
                          >
                            {isJustLaunched ? "Shop Collection" : "Shop Now"}
                            <ArrowRight
                              size={16}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 pt-2">
                        {product.launchDate && (
                          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-brand-terracotta/5 text-brand-terracotta border border-brand-terracotta/10">
                            <Calendar size={18} />
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">
                                Estimated Launch
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                                {product.launchDate}
                              </span>
                            </div>
                          </div>
                        )}
                        <div>
                          <button
                            onClick={() => setShowInterestForm(product.id)}
                            className="inline-flex items-center gap-4 px-8 py-4 bg-white border-2 border-brand-terracotta text-brand-terracotta rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-terracotta hover:text-white transition-all duration-500 hover:translate-y-[-2px] group active:scale-95"
                          >
                            Early Access Notify
                            <ArrowRight
                              size={16}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        {products.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 backdrop-blur-md shadow-xl border border-brand-gold/20 flex items-center justify-center text-brand-brown hover:text-brand-gold transition-all z-30 group"
            >
              <ArrowLeft
                size={20}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 backdrop-blur-md shadow-xl border border-brand-gold/20 flex items-center justify-center text-brand-brown hover:text-brand-gold transition-all z-30 group"
            >
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </>
        )}

        {/* Dots */}
        {products.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  idx === currentIndex
                    ? "w-8 bg-brand-gold"
                    : "w-1.5 bg-brand-gold/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interest Form Modal */}
      {mounted &&
        showInterestForm &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-brand-brown/40 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 lg:p-12 shadow-2xl animate-scale-in">
              <button
                onClick={() => {
                  setShowInterestForm(null);
                  setSubmitStatus(null);
                }}
                className="absolute top-6 right-6 p-2 text-brand-brown/40 hover:text-brand-brown transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/10 text-brand-gold mb-2">
                  <Bell size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif text-brand-brown">
                    Stay Informed
                  </h3>
                  <p className="text-xs text-brand-brown/60 font-light leading-relaxed">
                    Register your interest and be the first to know when this
                    premium staple arrives at our pantry.
                  </p>
                </div>

                {submitStatus ? (
                  <div
                    className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${
                      submitStatus.type === "success"
                        ? "bg-brand-green/10 text-brand-green"
                        : "bg-brand-terracotta/10 text-brand-terracotta"
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                ) : (
                  <form onSubmit={handleInterestSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-xl border border-brand-gold/10 bg-brand-cream/40 text-sm outline-none focus:border-brand-gold/40 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-xl border border-brand-gold/10 bg-brand-cream/40 text-sm outline-none focus:border-brand-gold/40 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-brand-brown text-brand-cream rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-green hover:shadow-2xl hover:shadow-brand-green/30 transition-all duration-500 hover:translate-y-[-4px] disabled:opacity-50"
                    >
                      {isSubmitting ? "Registering..." : "Notify Me"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
