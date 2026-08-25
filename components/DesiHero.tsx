"use client";

import { ArrowRight, Leaf, Mail, ShieldCheck, Sprout, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { isProductAvailable } from "@/lib/data";
import { useProductStore } from "@/store/productStore";
import LaunchCarousel from "./LaunchCarousel";
import { useEffect } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1200";

const trustBadges = [
  { icon: Sprout, label: "100% Organic" },
  { icon: Truck, label: "Farm to Table" },
  { icon: ShieldCheck, label: "Zero Chemicals" },
];

const DesiHero = () => {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      void fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const featuredProducts = [...products]
    .filter(
      (p) =>
        p.isVisible !== false &&
        (p.isLaunchingSoon ||
          p.launch_status === "launching_soon" ||
          !isProductAvailable(p)),
    )
    .sort((a, b) => {
      const launchingSoonA =
        a.isLaunchingSoon || a.launch_status === "launching_soon";
      const launchingSoonB =
        b.isLaunchingSoon || b.launch_status === "launching_soon";

      if (launchingSoonA !== launchingSoonB) {
        return launchingSoonA ? -1 : 1;
      }

      return 0;
    });

  if (featuredProducts.length > 0) {
    return <LaunchCarousel products={featuredProducts} />;
  }

  return (
    <section className="relative min-h-[64vh] sm:min-h-[70vh] lg:min-h-[86vh] w-full flex items-center overflow-hidden bg-brand-cream pt-2 sm:pt-4 lg:pt-0">
      {/* Ambient Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(197,160,40,0.12),transparent),radial-gradient(ellipse_60%_50%_at_105%_100%,rgba(17,44,36,0.08),transparent)]" />
        <div className="absolute inset-0 bg-mandala opacity-70" />
        <div className="absolute -top-24 -left-16 w-72 h-72 bg-brand-green/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div
          className="absolute top-1/3 -right-10 w-80 h-80 bg-brand-gold/15 rounded-full blur-[110px] animate-pulse-slow"
          style={{ animationDelay: "2.5s" }}
        />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-terracotta/5 rounded-full blur-[100px] animate-float-slow" />
      </div>

      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16 lg:pt-8 lg:pb-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-brand-gold/25 bg-white/70 backdrop-blur-sm px-4 py-2 shadow-sm shadow-brand-brown/5">
              <Leaf size={12} className="text-brand-green" strokeWidth={2} />
              <span className="uppercase tracking-[0.25em] text-[7px] sm:text-[9px] font-black text-brand-brown/70">
                Honest, Earthy, and Unadulterated
              </span>
            </div>

            <h1 className="text-[2.6rem] leading-[1.08] sm:text-5xl lg:text-[4.25rem] lg:leading-[1.05] font-serif text-brand-brown font-medium mb-5 tracking-tight">
              Purity in <br />
              <span className="italic bg-gradient-to-r from-brand-gold via-brand-gold-accent to-brand-terracotta bg-clip-text text-transparent">
                every harvest.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-brand-brown/70 mb-8 sm:mb-9 max-w-md font-light leading-relaxed">
              Bringing back the lost flavors of traditional Indian kitchens.
              Ethically sourced, 100% organic staples that nourish both body and
              soul.
            </p>

            <div className="flex flex-wrap items-center justify-start gap-4">
              <Link
                href="/#shop"
                className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 bg-brand-green text-brand-cream rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-brand-green/20 hover:shadow-2xl hover:shadow-brand-green/30 hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-brand-green-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                <span className="relative z-10 font-black uppercase tracking-widest text-[10px] sm:text-[11px]">
                  Explore The Pantry
                </span>
                <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-brand-green/20 text-brand-green rounded-full transition-all duration-500 hover:bg-brand-green/5 hover:border-brand-green/40"
              >
                <Mail className="w-4 h-4" />
                <span className="font-black uppercase tracking-widest text-[10px]">
                  Write to Us
                </span>
              </Link>
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
                    <Icon size={14} strokeWidth={1.5} className="text-brand-gold" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile / Tablet Image Banner */}
          <div className="relative lg:hidden -mx-4 sm:mx-0">
            <div className="relative aspect-[16/11] sm:aspect-[16/9] sm:rounded-[2rem] overflow-hidden shadow-xl">
              <Image
                src={HERO_IMAGE}
                alt="Organic Indian Staples & Spices"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/30 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-white/85 backdrop-blur-md pl-3 pr-4 py-2.5 rounded-full shadow-lg">
                <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                  <ShieldCheck size={16} strokeWidth={1.8} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-brown">
                  100% Organic &amp; Ethically Sourced
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Ambient glow behind the frame */}
              <div className="absolute -inset-10 bg-brand-gold/10 rounded-full blur-[80px]" />

              {/* Main Product Image with Organic Mask */}
              <div className="absolute inset-0 z-20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] overflow-hidden border-8 border-white shadow-2xl shadow-brand-brown/20">
                <Image
                  src={HERO_IMAGE}
                  alt="Organic Indian Staples & Spices"
                  fill
                  className="object-cover scale-110"
                  sizes="(max-width: 1024px) 0px, 512px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/15 via-transparent to-transparent" />
              </div>

              {/* Decorative Rings */}
              <div className="absolute -inset-4 z-10 rounded-full border border-dashed border-brand-gold/30 animate-spin-slow" />
              <div className="absolute -inset-8 z-0 border border-brand-green/10 rounded-[50%_50%_30%_70%/50%_50%_70%_30%] animate-float" />

              {/* Floating Highlight Card */}
              <div className="absolute -right-8 bottom-20 z-30 bg-white/85 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-brand-cream animate-float-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                    <ShieldCheck size={24} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-green uppercase tracking-tighter">
                      Farm Direct
                    </p>
                    <p className="text-sm text-brand-brown/60">
                      Sourced with integrity
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Floating Chip */}
              <div
                className="absolute -left-6 top-10 z-30 bg-white/85 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-brand-cream animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex items-center gap-2.5 text-brand-brown">
                  <Sprout size={16} className="text-brand-green" strokeWidth={1.8} />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Direct From The Farm
                  </p>
                </div>
              </div>
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

export default DesiHero;
