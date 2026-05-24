"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useCartStore } from "@/store/cartStore";
import { getProductThumbnail } from "@/lib/data";

export default function MobileFloatingCart() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (
    !mounted ||
    items.length === 0 ||
    pathname === "/cart" ||
    pathname === "/checkout"
  ) {
    return null;
  }

  const previewItems = items.slice(0, 4);
  const hiddenItemCount = Math.max(items.length - previewItems.length, 0);
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <aside className="fixed inset-x-4 bottom-5 z-50 lg:hidden">
      <Link
        href="/cart"
        className="relative block overflow-hidden rounded-[2.1rem] border border-brand-gold/25 bg-brand-cream/95 p-1 shadow-[0_20px_50px_rgba(60,54,42,0.22)] backdrop-blur-xl transition-transform active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-organic-texture opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-jute opacity-[0.03] pointer-events-none" />
        <div className="absolute right-0 top-0 -translate-y-4 translate-x-5 opacity-[0.08] pointer-events-none text-brand-gold">
          <svg width="112" height="112" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,10 C60,25 90,35 90,55 C90,75 75,90 50,90 C25,90 10,75 10,55 C10,35 40,25 50,10 Z M50,22 C43,32 22,41 22,55 C22,69 35,80 50,80 C65,80 78,69 78,55 C78,41 57,32 50,22 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3 rounded-[1.85rem] border border-brand-gold/15 px-3.5 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative flex min-w-[86px] items-center">
              {previewItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-brand-cream bg-brand-sand shadow-lg"
                  style={{
                    marginLeft: index === 0 ? 0 : -16,
                    zIndex: previewItems.length - index,
                  }}
                >
                  <ImageWithFallback
                    src={getProductThumbnail(item)}
                    alt={item.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
              ))}
              {hiddenItemCount > 0 && (
                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-cream bg-brand-brown text-[10px] font-black tracking-tight text-brand-cream shadow-lg"
                  style={{ marginLeft: -16 }}
                >
                  +{hiddenItemCount}
                </div>
              )}
            </div>

            <div className="min-w-0">
              {/* <p className="text-[8px] font-black uppercase tracking-[0.22em] text-brand-brown/40">
                Cart Ready
              </p> */}
              <p className="mt-0.5 truncate font-serif text-xl leading-none tracking-tight text-brand-brown">
                ₹{totalPrice.toFixed(0)}
              </p>
              <p className="mt-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-brand-green-fresh">
                {totalItems} {totalItems === 1 ? "product" : "products"}
              </p>
            </div>
          </div>

          <div className="group relative inline-flex min-h-12 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border border-brand-gold/30 bg-brand-green px-4 text-[8px] font-black uppercase tracking-[0.16em] text-brand-cream shadow-[0_10px_25px_rgba(45,58,38,0.28)]">
            <span className="relative z-10 flex items-center gap-1.5">
              <ShoppingBag size={13} className="text-brand-gold" />
              Cart
              <ArrowRight
                size={12}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-cream/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <span className="absolute inset-0 bg-[#3a4b32] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </aside>
  );
}
