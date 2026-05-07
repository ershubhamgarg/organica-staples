"use client";

import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  getDiscountedPrice,
  getDiscountPercent,
  hasHighProductDiscount,
  hasProductDiscount,
} from "@/lib/pricing";
import { getProductThumbnail } from "@/lib/data";

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

  useEffect(() => {
    if (user) {
      syncCartWithSupabase(user.id);
    }
  }, [user, syncCartWithSupabase]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8"></div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-serif text-stone-900">Your Cart</h1>
          <Link
            href="/#shop"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-green transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-brand-cream p-12 text-center">
            <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif text-stone-900 mb-3">
              Your cart is empty
            </h2>
            <p className="text-stone-500 mb-8">
              Looks like you haven&apos;t added any organic staples yet.
            </p>
            <Link
              href="/#shop"
              className="inline-block bg-brand-brown hover:bg-brand-brown-light text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemHasDiscount = hasProductDiscount(item);
                const itemHasHighDiscount = hasHighProductDiscount(item);
                const discountPercent = getDiscountPercent(item);
                const discountedUnitPrice = getDiscountedPrice(item);
                const actualLinePrice = item.price * item.quantity;
                const discountedLinePrice = discountedUnitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <div className="relative w-full sm:w-40 aspect-video bg-stone-100 rounded-xl overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={getProductThumbnail(item)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 256px"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between w-full">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <span className="text-[10px] text-stone-500 mb-1 block uppercase tracking-widest">
                            {item.category}
                          </span>
                          <h3 className="text-base sm:text-lg font-medium text-stone-900 leading-tight">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <p className="text-xs text-stone-500">
                              {item.weight}
                            </p>
                            {itemHasDiscount && (
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${
                                  itemHasHighDiscount
                                    ? "bg-brand-gold text-stone-950"
                                    : "bg-brand-cream text-brand-brown"
                                }`}
                              >
                                {itemHasHighDiscount
                                  ? "Mega Deal"
                                  : `${discountPercent}% Off`}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, user?.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-stone-100 gap-3">
                        <div className="flex items-center border border-brand-brown/20 rounded-xl bg-brand-cream/50">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                user?.id,
                              )
                            }
                            className="px-4 py-2 text-stone-600 hover:text-brand-green hover:bg-brand-cream rounded-l-xl transition-all"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 text-base font-medium text-stone-900 w-10 text-center">
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
                            className="px-4 py-2 text-stone-600 hover:text-brand-green hover:bg-brand-cream rounded-r-xl transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right">
                          {itemHasDiscount && (
                            <div className="text-sm text-stone-400 line-through">
                              ₹{actualLinePrice.toFixed(2)}
                            </div>
                          )}
                          <div
                            className={`text-xl ${
                              itemHasDiscount
                                ? "font-bold text-brand-green"
                                : "font-medium text-stone-900"
                            }`}
                          >
                            ₹{discountedLinePrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 sticky top-28">
                <h3 className="text-lg font-medium text-stone-900 mb-6">
                  Order Summary
                </h3>
                <div className="space-y-4 text-sm text-stone-600 mb-6">
                  <div className="flex justify-between">
                    <span>
                      Subtotal (
                      {items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                      items)
                    </span>
                    <span>₹{actualSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Total Discount</span>
                    <span>-₹{totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-stone-900">
                    <span>Effective Price</span>
                    <span>₹{effectiveSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : "₹50.00"}</span>
                  </div>
                  {effectiveSubtotal > 0 && effectiveSubtotal <= 500 && (
                    <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">
                      Add ₹{(500 - effectiveSubtotal).toFixed(2)} more for free
                      shipping!
                    </div>
                  )}
                </div>
                <div className="border-t border-stone-100 pt-4 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-medium text-stone-900">
                      Total Payable
                    </span>
                    <span className="text-2xl font-bold text-brand-green">
                      ₹{totalPayable.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 text-right">
                    Including taxes
                  </p>
                </div>
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
