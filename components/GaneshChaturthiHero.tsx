"use client";

import { ArrowRight, Check, Copy, Flower2, ShieldCheck, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { GANESH_COUPON_CODE } from "@/lib/ganeshChaturthiOffer";

const GANESH_IMAGE =
  "https://images.unsplash.com/photo-1610085927744-7217728267a6?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2FucGF0aXxlbnwwfHwwfHx8MA%3D%3D";

const trustBadges = [
  { icon: Leaf, label: "Pure For Prasad" },
  { icon: Flower2, label: "Blessed Beginnings" },
  { icon: ShieldCheck, label: "Zero Adulteration" },
];

const GaneshChaturthiHero = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GANESH_COUPON_CODE);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard API unavailable; the code is still visible to copy manually.
    }
  };

  return (
    <section className="relative min-h-[64vh] sm:min-h-[70vh] lg:min-h-[88vh] w-full flex items-center overflow-hidden bg-brand-cream pt-2 sm:pt-4 lg:pt-0">
      {/* Ambient Background Layers — warm saffron/marigold wash for the festival */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(230,126,34,0.16),transparent),radial-gradient(ellipse_60%_50%_at_105%_100%,rgba(166,93,71,0.14),transparent)]" />
        <div className="absolute inset-0 bg-mandala opacity-70" />
        <div className="absolute -top-24 -left-16 w-72 h-72 bg-brand-terracotta/15 rounded-full blur-[100px] animate-pulse-slow" />
        <div
          className="absolute top-1/3 -right-10 w-80 h-80 bg-brand-gold/20 rounded-full blur-[110px] animate-pulse-slow"
          style={{ animationDelay: "2.5s" }}
        />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#E67E22]/10 rounded-full blur-[100px] animate-float-slow" />
      </div>

      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16 lg:pt-8 lg:pb-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-brand-gold/25 bg-white/70 backdrop-blur-sm px-4 py-2 shadow-sm shadow-brand-brown/5">
              <Flower2
                size={12}
                className="text-brand-terracotta"
                strokeWidth={2}
              />
              <span className="uppercase tracking-[0.25em] text-[7px] sm:text-[9px] font-black text-brand-brown/70">
                Ganesh Chaturthi Special
              </span>
            </div>

            <h1 className="text-[2.6rem] leading-[1.08] sm:text-5xl lg:text-[4.25rem] lg:leading-[1.05] font-serif text-brand-brown font-medium mb-5 tracking-tight">
              Ganpati Bappa{" "}
              <span className="italic bg-gradient-to-r from-brand-gold via-[#E67E22] to-brand-terracotta bg-clip-text text-transparent">
                Moryaa!!
              </span>
            </h1>

            <p className="text-sm sm:text-base text-brand-brown/70 mb-8 sm:mb-9 max-w-md font-light leading-relaxed">
              May the remover of obstacles bring your home health, abundance and
              sweetness this Ganesh Chaturthi. Celebrate with our purest ghee,
              jaggery and staples — honest enough for Bappa&apos;s own naivedya.
              Enjoy{" "}
              <span className="font-semibold text-brand-brown">14% off</span>{" "}
              with code{" "}
              <span className="font-semibold text-brand-brown">
                {GANESH_COUPON_CODE}
              </span>
              , our gift for the 14th of September.
            </p>

            <div className="flex flex-wrap items-center justify-start gap-4">
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 bg-brand-terracotta text-brand-cream rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-brand-terracotta/20 hover:shadow-2xl hover:shadow-brand-terracotta/30 hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-[#c1684f] translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                <span className="relative z-10 font-black uppercase tracking-widest text-[10px] sm:text-[11px]">
                  Shop &amp; Save 14%
                </span>
                <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-brand-terracotta/25 text-brand-terracotta rounded-full transition-all duration-500 hover:bg-brand-terracotta/5 hover:border-brand-terracotta/40"
              >
                {isCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="font-black uppercase tracking-widest text-[10px]">
                  {isCopied ? "Copied!" : `Copy ${GANESH_COUPON_CODE}`}
                </span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 lg:mt-16 flex flex-wrap justify-start gap-x-8 gap-y-3">
              {trustBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 text-brand-brown/45"
                  >
                    <Icon
                      size={14}
                      strokeWidth={1.5}
                      className="text-brand-terracotta"
                    />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ganpati Idol Portrait */}
          <div className="relative">
            <div className="relative aspect-square max-w-[360px] sm:max-w-md mx-auto">
              <div className="absolute -inset-16 bg-brand-gold/20 rounded-full blur-[110px] pointer-events-none" />

              {/* Floating marigold petals */}
              <div className="absolute -top-4 left-6 w-5 h-5 rounded-full bg-[#E67E22]/40 blur-[2px] animate-float-slow" />
              <div
                className="absolute top-10 -right-2 w-3.5 h-3.5 rounded-full bg-brand-gold/50 blur-[1px] animate-float-slow"
                style={{ animationDelay: "1.2s" }}
              />
              <div
                className="absolute bottom-8 -left-3 w-4 h-4 rounded-full bg-brand-terracotta/40 blur-[1.5px] animate-float-slow"
                style={{ animationDelay: "2s" }}
              />

              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-2xl shadow-brand-brown/20">
                <Image
                  src={GANESH_IMAGE}
                  alt="Ornately adorned Lord Ganesha idol with gold jewellery and floral garlands for Ganesh Chaturthi"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 480px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/25 via-transparent to-transparent" />
              </div>

              {/* Floating Coupon Card */}
              <button
                type="button"
                onClick={handleCopy}
                className="absolute -bottom-6 -right-2 lg:-right-6 z-30 bg-white p-5 rounded-2xl shadow-xl border border-brand-cream animate-float-slow text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-brand-terracotta/10 rounded-full flex items-center justify-center text-brand-terracotta shrink-0">
                    {isCopied ? (
                      <Check size={20} strokeWidth={1.8} />
                    ) : (
                      <Copy size={20} strokeWidth={1.8} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-terracotta uppercase tracking-tighter">
                      {isCopied ? "Copied!" : GANESH_COUPON_CODE}
                    </p>
                    <p className="text-sm text-brand-brown/60">
                      Tap to copy · 14% off
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Curve/Transition */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
        <svg
          className="relative block w-full h-[100px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.83C51.17,110,123.64,103.49,185.34,92.83,243.33,82.8,285,63.15,321.39,56.44Z"
            fill="#fbfaf7"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default GaneshChaturthiHero;
