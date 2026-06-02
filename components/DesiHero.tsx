"use client";

import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useProductStore } from "@/store/productStore";
import LaunchCarousel from "./LaunchCarousel";
import { useEffect } from "react";

const DesiHero = () => {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      void fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const launchProducts = products.filter(
    (p) => p.justLaunched === true || p.isLaunchingSoon === true,
  );

  if (launchProducts.length > 0) {
    return <LaunchCarousel products={launchProducts} />;
  }

  return (
    <section className="relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] w-full flex items-center overflow-hidden bg-brand-cream pt-2 sm:pt-4 lg:pt-0">
      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-12 sm:pb-16 lg:pt-8 lg:pb-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center justify-start gap-3 mb-6 text-brand-green/80">
              <span className="h-[1px] w-8 sm:w-12 bg-brand-gold" />
              <span className="uppercase tracking-[0.3em] text-[7px] sm:text-[9px] font-black">
                Honest, Earthy, and Unadulterated
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-brand-brown font-medium mb-4 leading-[1.1] tracking-tight">
              Purity in <br />
              <span className="text-brand-gold italic">every harvest.</span>
            </h1>

            <p className="text-sm sm:text-base text-brand-brown/70 mb-6 sm:mb-8 max-w-md font-light leading-relaxed">
              Bringing back the lost flavors of traditional Indian kitchens.
              Ethically sourced, 100% organic staples that nourish both body and
              soul.
            </p>

            <div className="flex flex-wrap items-center justify-start gap-4">
              <Link
                href="/#shop"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-green text-brand-cream rounded-full transition-all duration-500 hover:bg-brand-green-light hover:translate-y-[-2px] hover:shadow-xl hover:shadow-brand-green/20"
              >
                <span className="font-black uppercase tracking-widest text-[10px]">
                  Explore The Pantry
                </span>
                <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
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
            <div className="mt-12 lg:mt-16 flex flex-wrap justify-start gap-6 sm:gap-10 opacity-40">
              <div className="flex items-center">
                <span className="text-[9px] uppercase tracking-[0.2em] font-black">
                  100% Organic
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-[9px] uppercase tracking-[0.2em] font-black">
                  Farm to Table
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-[9px] uppercase tracking-[0.2em] font-black">
                  Zero Chemicals
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Product Image with Organic Mask */}
              <div className="absolute inset-0 z-20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] overflow-hidden border-8 border-brand-cream shadow-2xl">
                <Image
                  src="https://qdrkqtcbninswzieszfx.supabase.co/storage/v1/object/sign/images/ChatGPT%20Image%20May%207,%202026,%2009_51_47%20AM.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85YWMzMTk3Ny0wZTk5LTQ1NjQtODM2OC1iM2IzZTQzMzIyNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvQ2hhdEdQVCBJbWFnZSBNYXkgNywgMjAyNiwgMDlfNTFfNDcgQU0ucG5nIiwiaWF0IjoxNzc4MTI3NzIyLCJleHAiOjE4MDk2NjM3MjJ9.wG0Mdodjvtd8fKToIpBI2z3mRjfgi4ZnxXWxNwb3wFI"
                  alt="Organic Staples"
                  fill
                  className="object-cover scale-110"
                  priority
                />
              </div>

              {/* Decorative Rings */}
              <div className="absolute -inset-4 z-10 border border-brand-gold/20 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-float-slow" />
              <div
                className="absolute -inset-8 z-0 border border-brand-green/10 rounded-[50%_50%_30%_70%/50%_50%_70%_30%] animate-float"
                style={{ animationDelay: "2s" }}
              />

              {/* Floating Highlight Card */}
              <div className="absolute -right-8 bottom-20 z-30 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-brand-cream animate-float-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                    <ShieldCheck size={24} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-green uppercase tracking-tighter">
                      Certified Pure
                    </p>
                    <p className="text-sm text-brand-brown/60">
                      Lab tested quality
                    </p>
                  </div>
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
