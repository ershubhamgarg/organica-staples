"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DesiHero = () => {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[80vh] w-full flex items-center overflow-hidden bg-brand-cream bg-organic-texture">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {/* Floating Organic Shapes */}
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-brand-gold/20 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-40 right-[15%] w-96 h-96 bg-brand-green/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Floating Illustrations */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Wheat Stalk 1 */}
        <div className="absolute top-1/4 right-[8%] animate-float-slow opacity-40">
          <svg
            width="100"
            height="200"
            viewBox="0 0 100 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 200V50M50 50C50 50 20 40 10 20M50 70C50 70 80 60 90 40M50 90C50 90 20 80 10 60M50 110C50 110 80 100 90 80M50 130C50 130 20 120 10 100"
              stroke="#C29F64"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="10" cy="20" r="3" fill="#C29F64" />
            <circle cx="90" cy="40" r="3" fill="#C29F64" />
            <circle cx="10" cy="60" r="3" fill="#C29F64" />
            <circle cx="90" cy="80" r="3" fill="#C29F64" />
            <circle cx="10" cy="100" r="3" fill="#C29F64" />
          </svg>
        </div>

        {/* Earthen Pot (Matka) */}
        <div className="absolute bottom-[15%] left-[8%] animate-float opacity-30">
          <svg
            width="140"
            height="140"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 50C20 20 80 20 80 50C80 85 20 85 20 50Z"
              fill="#8B4513"
              fillOpacity="0.2"
              stroke="#8B4513"
              strokeWidth="1.5"
            />
            <path
              d="M35 25C35 20 65 20 65 25"
              stroke="#8B4513"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M30 35H70"
              stroke="#8B4513"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </svg>
        </div>

        {/* Mortar & Pestle */}
        <div
          className="absolute top-20 left-[20%] animate-float-slow opacity-20"
          style={{ animationDelay: "1s" }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 40C20 40 20 80 50 80C80 80 80 40 80 40H20Z"
              fill="#5E6950"
              fillOpacity="0.1"
              stroke="#4A533E"
              strokeWidth="2"
            />
            <path
              d="M45 20L55 50"
              stroke="#4A533E"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Tulsi/Basil Leaf */}
        <div
          className="absolute top-[15%] left-[45%] animate-float opacity-30"
          style={{ animationDelay: "4s" }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 80C50 80 85 60 85 35C85 20 70 15 50 35C30 15 15 20 15 35C15 60 50 80 50 80Z"
              fill="#4A533E"
              fillOpacity="0.1"
              stroke="#4A533E"
              strokeWidth="1.5"
            />
            <path d="M50 35V80" stroke="#4A533E" strokeWidth="1" />
            <path
              d="M50 50C50 50 65 45 75 40"
              stroke="#4A533E"
              strokeWidth="0.5"
            />
            <path
              d="M50 60C50 60 35 55 25 50"
              stroke="#4A533E"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Leaf */}
        <div
          className="absolute bottom-1/4 right-[20%] animate-float opacity-50"
          style={{ animationDelay: "3s" }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 90C50 90 90 60 90 30C90 10 70 10 50 30C30 10 10 10 10 30C10 60 50 90 50 90Z"
              fill="#4A533E"
              fillOpacity="0.1"
              stroke="#4A533E"
              strokeWidth="1.5"
            />
            <path d="M50 30V90" stroke="#4A533E" strokeWidth="1" />
          </svg>
        </div>
      </div>

      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-3 mb-4 text-brand-green/80">
              <span className="h-[1px] w-12 bg-brand-gold" />
              <span className="uppercase tracking-[0.3em] text-[8px] sm:text-[9px] font-bold">
                Ethically Sourced Organic Staples
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-brand-brown font-medium mb-3 leading-[1.1] tracking-tight">
              Purity in <br />
              <span className="text-brand-gold italic">every grain.</span>
            </h1>

            <p className="text-xs md:text-sm text-brand-brown/70 mb-6 max-w-md font-light leading-relaxed">
              Experience the authentic taste of tradition with our ethically
              sourced, 100% organic pantry staples. Pure, potent, and close to
              nature.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#shop"
                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-brand-green text-brand-cream rounded-full transition-all duration-500 hover:bg-brand-green-light hover:translate-y-[-2px] hover:shadow-xl hover:shadow-brand-green/20"
              >
                <span className="font-medium tracking-wide text-sm">
                  Shop Now
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>

              <button
                onClick={() =>
                  window.open("https://wa.me/918295433041", "_blank")
                }
                className="inline-flex items-center gap-3 px-6 py-3 border border-brand-green/20 text-brand-green rounded-full transition-all duration-500 hover:bg-brand-green/5 hover:border-brand-green/40"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="font-medium tracking-wide text-sm">
                  Talk to Us
                </span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-brand-gold rounded-full" />
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  100% Organic
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-brand-gold rounded-full" />
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  Farm to Table
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-brand-gold rounded-full" />
                <span className="text-[10px] uppercase tracking-widest font-bold">
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
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
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
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-30">
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
