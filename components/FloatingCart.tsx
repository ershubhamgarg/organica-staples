"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag, X, Trash2, AlertCircle } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { getProductThumbnail } from "@/lib/data";

export default function FloatingCart() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <aside className="fixed inset-x-4 bottom-5 z-50 lg:left-auto lg:right-8 lg:bottom-8 lg:w-[440px] lg:inset-x-auto group/aside">
      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="absolute bottom-full left-0 right-0 mb-4 animate-reveal-up">
          <div className="bg-white rounded-3xl border border-brand-gold/20 p-6 shadow-2xl shadow-brand-brown/20 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <Trash2 size={80} className="text-brand-terracotta rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-terracotta/10 flex items-center justify-center text-brand-terracotta">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-serif text-brand-brown">
                    Empty your cart?
                  </h3>
                  <p className="text-[10px] text-brand-brown/40 uppercase tracking-widest font-black">
                    Action Required
                  </p>
                </div>
              </div>

              <p className="text-xs text-brand-brown/60 font-light mb-6 leading-relaxed">
                This will remove all premium organic items from your selection.
                This action cannot be reversed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-full border border-brand-gold/20 text-[9px] uppercase tracking-widest font-black text-brand-brown hover:bg-brand-cream transition-colors"
                >
                  Keep Items
                </button>
                <button
                  onClick={() => {
                    clearCart(user?.id);
                    setShowConfirm(false);
                  }}
                  className="flex-1 py-3 rounded-full bg-brand-terracotta text-[9px] uppercase tracking-widest font-black text-white hover:bg-brand-terracotta/90 transition-colors shadow-lg shadow-brand-terracotta/20"
                >
                  Empty Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Link
          href="/cart"
          className="relative block overflow-hidden rounded-[2.1rem] border border-brand-gold/25 bg-brand-cream/95 p-1 shadow-[0_20px_50px_rgba(60,54,42,0.22)] backdrop-blur-xl transition-all hover:translate-y-[-2px] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-organic-texture opacity-25 pointer-events-none" />
          <div className="absolute inset-0 bg-jute opacity-[0.03] pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3 rounded-[1.85rem] border border-brand-gold/15 px-3 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative flex min-w-[86px] items-center pl-2">
                {/* Integrated Clear Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirm(true);
                  }}
                  className="absolute left-[-4px] z-[60] w-8 h-8 bg-white border border-brand-gold/10 text-brand-terracotta rounded-full flex items-center justify-center shadow-md hover:bg-brand-terracotta hover:text-white transition-all duration-300 group/clear"
                  title="Empty Cart"
                >
                  <X
                    size={14}
                    strokeWidth={3}
                    className="transition-transform group-hover/clear:rotate-90"
                  />
                </button>

                {previewItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-brand-cream bg-brand-sand shadow-lg"
                    style={{
                      marginLeft: index === 0 ? 12 : -16,
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
      </div>
    </aside>
  );
}
