"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function WelcomeModal() {
  const justSignedIn = useUserStore((state) => state.justSignedIn);
  const setJustSignedIn = useUserStore((state) => state.setJustSignedIn);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!justSignedIn) return;

    const frame = window.requestAnimationFrame(() => {
      setIsOpen(true);
      setJustSignedIn(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [justSignedIn, setJustSignedIn]);

  const handleClose = () => setIsOpen(false);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-brand-brown/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 sm:p-10 shadow-2xl animate-scale-in overflow-hidden">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-brand-green/5 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-6 right-6 z-10 p-2 text-brand-brown/40 hover:text-brand-brown transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-brand-gold/15 rounded-full blur-xl" />
            <svg viewBox="0 0 200 200" className="relative w-full h-full">
              <defs>
                <linearGradient
                  id="welcomePetalGold"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#E8D090" />
                  <stop offset="55%" stopColor="#C5A028" />
                  <stop offset="100%" stopColor="#9C7F1F" />
                </linearGradient>
              </defs>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <g key={deg} transform={`rotate(${deg} 100 100)`}>
                  <path
                    d="M100 100 C82 74 76 44 100 18 C124 44 118 74 100 100 Z"
                    fill="url(#welcomePetalGold)"
                    stroke="#9C7F1F"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                  <circle cx="100" cy="26" r="3.2" fill="#9C7F1F" />
                </g>
              ))}
              <circle
                cx="100"
                cy="100"
                r="24"
                fill="#FDFBF7"
                stroke="url(#welcomePetalGold)"
                strokeWidth="3"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-[0.35em] font-black text-brand-gold">
              Namaste
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-brown tracking-tight">
              Welcome to{" "}
              <span className="italic text-brand-terracotta">ANNVRIKSH</span>
            </h2>
          </div>

          <p className="text-sm text-brand-brown/60 font-light leading-relaxed max-w-sm mx-auto text-balance">
            Your account is ready. Explore our curated pantry of organic
            staples, sourced directly from farmers across Bharat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/#shop"
              onClick={handleClose}
              className="group w-full sm:w-auto relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-brown text-brand-cream rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 overflow-hidden shadow-xl hover:translate-y-[-2px]"
            >
              <span className="relative z-10 flex items-center gap-3">
                Explore The Pantry
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
              <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
            </Link>
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-black text-brand-brown/40 hover:text-brand-brown transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
