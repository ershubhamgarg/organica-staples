"use client";

import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  getDiscountedPrice,
  getDiscountPercent,
  hasHighProductDiscount,
  hasProductDiscount,
} from "@/lib/pricing";
import { getProductThumbnail, isProductAvailable } from "@/lib/data";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const syncCartWithSupabase = useCartStore(
    (state) => state.syncCartWithSupabase,
  );
  const { user } = useUserStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const effectiveSubtotal = getTotalPrice();
  const actualSubtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );
  const totalDiscount = Math.max(actualSubtotal - effectiveSubtotal, 0);
  const shipping = effectiveSubtotal > 0 && effectiveSubtotal <= 500 ? 50 : 0;
  const totalPayable = effectiveSubtotal + shipping;
  const hasUnavailableItems = items.some((item) => !isProductAvailable(item));

  useEffect(() => {
    if (user) {
      syncCartWithSupabase(user.id);
    }
  }, [user, syncCartWithSupabase]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-brand-gold/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-3 mb-1">
              <span className="h-[1px] w-6 bg-brand-gold" />
              <span className="text-[8px] uppercase tracking-[0.3em] font-black text-brand-gold">
                Shopping Cart
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif text-brand-brown tracking-tight">
              Your <span className="italic">Cart</span>
            </h1>
          </div>
          <Link
            href="/#shop"
            className="inline-flex items-center gap-3 text-brand-brown/60 hover:text-brand-brown transition-all text-[9px] uppercase tracking-[0.2em] font-black"
          >
            <ArrowLeft size={12} /> Back to Shop
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-gold/10 p-10 md:p-12 text-center shadow-2xl shadow-brand-brown/5 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-brand-sand rounded-full flex items-center justify-center mx-auto mb-4 text-brand-brown/20">
              <ShoppingBag size={28} strokeWidth={1} />
            </div>
            <h2 className="text-xl font-serif text-brand-brown mb-2">
              Your basket is light
            </h2>
            <p className="text-xs text-brand-brown/40 mb-6 font-light text-balance">
              Quality staples for your home. Start exploring our curated
              collection.
            </p>
            <Link
              href="/#shop"
              className="inline-flex items-center gap-3 bg-brand-brown text-brand-cream px-6 py-3 rounded-full text-[9px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light shadow-xl"
            >
              Start Shopping <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
            <div className="space-y-4">
              {items.map((item) => {
                const itemHasDiscount = hasProductDiscount(item);
                const itemHasHighDiscount = hasHighProductDiscount(item);
                const discountPercent = getDiscountPercent(item);
                const discountedUnitPrice = getDiscountedPrice(item);
                const actualLinePrice = item.price * item.quantity;
                const discountedLinePrice = discountedUnitPrice * item.quantity;
                const available = isProductAvailable(item);

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-brand-gold/10 p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl shadow-brand-brown/5 transition-all hover:shadow-2xl hover:translate-y-[-2px]"
                  >
                    <div className="relative w-full md:w-32 aspect-square rounded-xl bg-brand-sand overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={getProductThumbnail(item)}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 150px"
                      />
                    </div>

                    <div className="flex-grow flex flex-col justify-between w-full">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="text-[8px] text-brand-gold mb-1 block uppercase tracking-[0.2em] font-black">
                            {item.category}
                          </span>
                          <h3 className="text-xl font-serif text-brand-brown tracking-tight mb-1">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <p className="text-[9px] text-brand-brown/40 font-bold uppercase tracking-widest">
                              {item.weight}
                            </p>
                            {available && itemHasDiscount && (
                              <span
                                className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] rounded-full border border-white/20 text-white ${
                                  itemHasHighDiscount
                                    ? "bg-brand-terracotta shadow-lg"
                                    : "bg-brand-green"
                                }`}
                              >
                                {itemHasHighDiscount
                                  ? "Reserve"
                                  : `${discountPercent}% Off`}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, user?.id)}
                          className="text-brand-brown/20 hover:text-brand-terracotta transition-all p-2 hover:scale-110"
                        >
                          <Trash2 size={18} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-brand-gold/10 gap-4">
                        <div className="flex items-center border border-brand-brown rounded-full bg-brand-cream/50 p-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                user?.id,
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-brand-brown hover:text-brand-terracotta transition-all rounded-full hover:bg-brand-cream"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-brand-brown">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                user?.id,
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-brand-brown hover:text-brand-green transition-all rounded-full hover:bg-brand-cream"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>

                        <div className="text-right">
                          {!available ? (
                            <div className="relative inline-block">
                              <span className="text-lg font-light text-brand-brown/20 tracking-tight">
                                Available Soon
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {itemHasDiscount && (
                                <span className="text-[9px] text-brand-brown/30 line-through font-bold">
                                  ₹{actualLinePrice.toFixed(0)}
                                </span>
                              )}
                              <span className="text-xl font-medium text-brand-brown tracking-tight">
                                ₹{discountedLinePrice.toFixed(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sticky top-32">
              <div className="bg-white rounded-3xl border border-brand-gold/10 p-8 shadow-2xl shadow-brand-brown/10">
                <h3 className="text-xl font-serif text-brand-brown mb-6 tracking-tight">
                  Summary
                </h3>

                <div className="space-y-4 mb-8 pb-8 border-b border-brand-gold/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown/60 font-light">
                      Subtotal
                    </span>
                    <span className="text-brand-brown font-bold tracking-tight">
                      ₹{actualSubtotal.toFixed(0)}
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-terracotta/60 font-light italic">
                        Discount
                      </span>
                      <span className="text-brand-terracotta font-bold tracking-tight">
                        -₹{totalDiscount.toFixed(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown/60 font-light">
                      Shipping
                    </span>
                    <span className="text-brand-brown font-bold tracking-tight">
                      {shipping === 0 ? (
                        <span className="text-brand-green italic">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-base font-serif text-brand-brown">
                    Total
                  </span>
                  <span className="text-3xl font-medium text-brand-brown tracking-tighter">
                    ₹{totalPayable.toFixed(0)}
                  </span>
                </div>

                {hasUnavailableItems && (
                  <div className="mb-6 p-3 bg-brand-gold/5 rounded-xl border border-brand-gold/10">
                    <p className="text-[8px] uppercase tracking-widest font-black text-brand-gold text-center">
                      Some items are coming soon
                    </p>
                  </div>
                )}

                <Link
                  href={hasUnavailableItems ? "#" : "/checkout"}
                  className={`w-full group relative flex items-center justify-center gap-4 px-8 py-4 bg-brand-brown text-brand-cream rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 overflow-hidden shadow-2xl hover:translate-y-[-2px] ${
                    hasUnavailableItems
                      ? "opacity-40 cursor-not-allowed grayscale"
                      : ""
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Checkout
                    <ArrowRight size={14} />
                  </span>
                  <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                </Link>

                {/* Trust Badges */}
                <div className="mt-8 grid grid-cols-2 gap-4 pt-8 border-t border-brand-gold/5 opacity-40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} />
                    <span className="text-[7px] uppercase tracking-widest font-bold">
                      Secure
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} />
                    <span className="text-[7px] uppercase tracking-widest font-bold">
                      Traceable
                    </span>
                  </div>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mt-4 p-4 bg-brand-green/5 rounded-xl border border-brand-green/10 text-center">
                  <p className="text-[8px] uppercase tracking-[0.2em] font-black text-brand-green">
                    Add ₹{(500 - effectiveSubtotal).toFixed(0)} more for{" "}
                    <span className="italic">Free</span> delivery
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
