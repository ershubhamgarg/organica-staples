"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { isComboLive, useCombo } from "@/lib/useCombo";

/**
 * Entry point into the combo builder, shown above the pantry grid.
 *
 * Renders nothing unless combos are switched on in the CMS *and* enough
 * eligible items are actually in stock to complete one — sending customers to
 * a builder they cannot finish is worse than not offering it.
 */
export default function ComboBanner() {
  const { data } = useCombo();

  if (!isComboLive(data) || !data) return null;

  const { settings, items } = data;
  // Items arrive sorted by price ascending.
  const lowestPrice = items[0]?.price ?? null;


  return (
    <Link
      href="/combo"
      className="group mb-10 block overflow-hidden rounded-3xl border border-brand-gold/20 bg-gradient-to-r from-brand-green to-brand-green/90 transition-all duration-500 hover:shadow-xl hover:shadow-brand-green/15 lg:mb-14"
    >
      <div className="relative flex flex-col items-center gap-5 px-6 py-7 text-center sm:flex-row sm:justify-between sm:gap-8 sm:px-10 sm:text-left">
        <div className="pointer-events-none absolute inset-0 bg-mandala opacity-[0.07]" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-brand-gold">
            <Sparkles size={10} strokeWidth={2.5} />
            Sampler Pack
          </span>
          <h3 className="mt-2 font-serif text-xl tracking-tight text-brand-cream sm:text-2xl">
            {settings.title}
          </h3>
          <p className="mt-1.5 max-w-md text-xs font-light leading-relaxed text-brand-cream/70">
            Pick any {settings.minItems} smaller packs and try the range
            without committing to full sizes.
            {lowestPrice !== null && (
              <span className="text-brand-cream/90">
                {" "}
                Starts at just ₹{lowestPrice.toFixed(0)} an item.
              </span>
            )}
          </p>
        </div>

        <span className="relative inline-flex shrink-0 items-center gap-2.5 rounded-full bg-brand-cream px-7 py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-brown transition-transform duration-300 group-hover:-translate-y-0.5">
          Build Yours
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
