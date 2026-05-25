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
  BadgePercent,
  Truck,
  ArrowRight,
  X,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import type { DiscountCode } from "@/lib/discountCodes";
import { calculateDiscount } from "@/lib/discountCodes";
import {
  LAUNCH_OFFER_CODE,
  LAUNCH_OFFER_PACK_LIMIT,
  getLaunchOfferState,
} from "@/lib/launchOffer";
import {
  getDiscountedPrice,
  getDiscountPercent,
  hasHighProductDiscount,
  hasProductDiscount,
} from "@/lib/pricing";
import {
  getProductThumbnail,
  isProductAvailable,
  isProductLowStock,
} from "@/lib/data";
import { useLaunchOfferClaimStatus } from "@/lib/useLaunchOfferClaimStatus";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const appliedDiscountCode = useCartStore(
    (state) => state.appliedDiscountCode,
  );
  const appliedDiscountCoupon = useCartStore(
    (state) => state.appliedDiscountCoupon,
  );
  const applyDiscountCode = useCartStore((state) => state.applyDiscountCode);
  const removeDiscountCode = useCartStore((state) => state.removeDiscountCode);
  const syncCartWithSupabase = useCartStore(
    (state) => state.syncCartWithSupabase,
  );
  const clearCart = useCartStore((state) => state.clearCart);
  const setOrderSummary = useCartStore((state) => state.setOrderSummary);
  const { user } = useUserStore();
  const launchOfferClaim = useLaunchOfferClaimStatus(user);
  const [discountInput, setDiscountInput] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [publicCoupons, setPublicCoupons] = useState<DiscountCode[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
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
  const rawLaunchOffer = useMemo(() => getLaunchOfferState(items), [items]);
  const launchOffer = useMemo(() => {
    if (launchOfferClaim.hasClaimed) {
      return {
        ...rawLaunchOffer,
        isEligible: false,
        message:
          "Congratulations, your launch offer is already claimed. Our team is working toward fulfilment.",
      };
    }

    if (user && launchOfferClaim.isLoading) {
      return {
        ...rawLaunchOffer,
        isEligible: false,
        message: "Checking your launch offer claim status.",
      };
    }

    return rawLaunchOffer;
  }, [
    rawLaunchOffer,
    launchOfferClaim.hasClaimed,
    launchOfferClaim.isLoading,
    user,
  ]);
  const launchOfferDiscount = launchOffer.isEligible ? actualSubtotal : 0;
  const productDiscount = launchOffer.isEligible
    ? launchOfferDiscount
    : Math.max(actualSubtotal - effectiveSubtotal, 0);
  const cartDiscount = calculateDiscount(
    launchOffer.isEligible ? 0 : effectiveSubtotal,
    launchOffer.isEligible ? null : appliedDiscountCoupon,
  );
  const subtotalAfterDiscount = launchOffer.isEligible
    ? 0
    : cartDiscount.subtotalAfterDiscount;
  const shipping = 0;
  const convenienceFee = launchOffer.isEligible
    ? 0
    : actualSubtotal <= 300
      ? 5
      : 10;
  const totalPayable = subtotalAfterDiscount + convenienceFee;
  const freeShippingThreshold = 1000;
  const freeShippingShortfall = Math.max(
    freeShippingThreshold - subtotalAfterDiscount,
    0,
  );
  const hasUnavailableItems = items.some((item) => !isProductAvailable(item));

  // Sync summary to store for checkout page
  useEffect(() => {
    if (!mounted) return;

    setOrderSummary({
      actualSubtotal,
      productDiscount,
      couponDiscount: {
        amount: launchOffer.isEligible ? 0 : cartDiscount.amount,
        percent: launchOffer.isEligible ? 100 : cartDiscount.percent,
        code: launchOffer.isEligible ? LAUNCH_OFFER_CODE : cartDiscount.code,
      },
      subtotalAfterDiscount,
      shipping,
      convenienceFee,
      totalPayable,
    });
  }, [
    mounted,
    actualSubtotal,
    productDiscount,
    cartDiscount,
    subtotalAfterDiscount,
    shipping,
    convenienceFee,
    totalPayable,
    launchOffer.isEligible,
    setOrderSummary,
  ]);

  const getCouponShortfall = (coupon: DiscountCode) =>
    coupon.minOrderValue !== null
      ? Math.max(coupon.minOrderValue - effectiveSubtotal, 0)
      : 0;

  const validateCoupon = useCallback(
    async (code: string) => {
      const response = await fetch("/api/discount-coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          subtotal: effectiveSubtotal,
        }),
      });
      const result = (await response.json()) as
        | {
            coupon: DiscountCode;
            isEligible: boolean;
            shortfall: number;
          }
        | { error?: string };

      if (!response.ok || !("coupon" in result)) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "This coupon code is not valid.",
        );
      }

      return result;
    },
    [effectiveSubtotal],
  );

  const handleApplyDiscount = async (code = discountInput) => {
    setDiscountError(null);
    setDiscountMessage(null);

    if (!code.trim()) {
      setDiscountError("Enter a coupon code.");
      return;
    }

    setIsApplyingDiscount(true);
    try {
      const result = await validateCoupon(code);

      if (!result.isEligible) {
        setDiscountError(
          `Add ₹${result.shortfall.toFixed(2)} more to use ${result.coupon.code}.`,
        );
        return;
      }

      applyDiscountCode(result.coupon, user?.id);
      setDiscountInput("");
      setShowCoupons(false);
      setDiscountMessage("Coupon applied.");
    } catch (error) {
      setDiscountError(
        error instanceof Error
          ? error.message
          : "This coupon code is not valid.",
      );
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscountCode(user?.id);
    setDiscountInput("");
    setDiscountError(null);
    setDiscountMessage("Coupon removed.");
  };

  useEffect(() => {
    if (user) {
      syncCartWithSupabase(user.id);
    }
  }, [user, syncCartWithSupabase]);

  useEffect(() => {
    const fetchPublicCoupons = async () => {
      setIsLoadingCoupons(true);
      try {
        const response = await fetch("/api/discount-coupons");
        const result = (await response.json()) as
          | { coupons: DiscountCode[] }
          | { error?: string };

        if (response.ok && "coupons" in result) {
          setPublicCoupons(result.coupons);
        }
      } finally {
        setIsLoadingCoupons(false);
      }
    };

    fetchPublicCoupons();
  }, []);

  useEffect(() => {
    if (!appliedDiscountCode || appliedDiscountCoupon) return;

    const fetchAppliedCoupon = async () => {
      try {
        const result = await validateCoupon(appliedDiscountCode);
        applyDiscountCode(result.coupon, user?.id);
      } catch {
        removeDiscountCode(user?.id);
      }
    };

    fetchAppliedCoupon();
  }, [
    appliedDiscountCode,
    appliedDiscountCoupon,
    applyDiscountCode,
    removeDiscountCode,
    user?.id,
    validateCoupon,
  ]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-brand-gold/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream py-6 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto pb-32 lg:pb-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-3 mb-1">
              <span className="h-[1px] w-6 bg-brand-gold" />
              <span className="text-[8px] uppercase tracking-[0.3em] font-black text-brand-gold">
                Shopping Cart
              </span>
            </div>
            <div className="flex items-center gap-6">
              <h1 className="text-2xl lg:text-3xl font-serif text-brand-brown tracking-tight">
                Your <span className="italic">Cart</span>
              </h1>
              {items.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-2 text-brand-terracotta/40 hover:text-brand-terracotta transition-all text-[9px] uppercase tracking-[0.2em] font-black group mt-1"
                >
                  <Trash2
                    size={12}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Empty Cart
                </button>
              )}
            </div>
          </div>

          {/* Custom Clear Confirmation Overlay */}
          {showClearConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-brand-brown/40 backdrop-blur-md animate-reveal-fade">
              <div className="bg-white rounded-[2.5rem] border border-brand-gold/20 p-8 md:p-12 shadow-2xl shadow-brand-brown/40 max-w-md w-full relative overflow-hidden animate-reveal-up">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <Trash2
                    size={120}
                    className="text-brand-terracotta rotate-12"
                  />
                </div>

                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-brand-terracotta/10 flex items-center justify-center text-brand-terracotta mx-auto mb-6">
                    <AlertCircle size={32} />
                  </div>

                  <h3 className="text-2xl font-serif text-brand-brown mb-2">
                    Empty your cart?
                  </h3>
                  <p className="text-[10px] text-brand-brown/40 uppercase tracking-[0.3em] font-black mb-6">
                    Action Required
                  </p>

                  <p className="text-sm text-brand-brown/60 font-light mb-8 leading-relaxed">
                    This will remove all premium organic items from your
                    selection. This action cannot be reversed.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-4 rounded-full border border-brand-gold/20 text-[10px] uppercase tracking-[0.25em] font-black text-brand-brown hover:bg-brand-cream transition-colors"
                    >
                      Keep Items
                    </button>
                    <button
                      onClick={() => {
                        clearCart(user?.id);
                        setShowClearConfirm(false);
                      }}
                      className="flex-1 py-4 rounded-full bg-brand-terracotta text-[10px] uppercase tracking-[0.25em] font-black text-white hover:bg-brand-terracotta/90 transition-colors shadow-xl shadow-brand-terracotta/20"
                    >
                      Empty Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Link
            href="/#shop"
            className="inline-flex items-center gap-3 text-brand-brown/60 hover:text-brand-brown transition-all text-[9px] uppercase tracking-[0.2em] font-black"
          >
            <ArrowLeft size={12} /> Back to Shop
          </Link>
        </div>

        <div className="mb-8 rounded-3xl border border-brand-green/15 bg-brand-green/5 p-5 shadow-xl shadow-brand-brown/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-green-fresh">
                {launchOfferClaim.hasClaimed
                  ? "Launch Story Offer Claimed"
                  : "Limited Launch Story Offer"}
              </p>
              <h2 className="mt-2 text-2xl font-serif tracking-tight text-brand-brown">
                {launchOfferClaim.hasClaimed ? (
                  "Congratulations on claiming the launch offer."
                ) : (
                  <>
                    Get any 2 products at{" "}
                    <span className="italic text-brand-green-fresh">
                      ₹0 product cost
                    </span>
                  </>
                )}
              </h2>
              <p className="mt-2 max-w-2xl text-xs font-light leading-relaxed text-brand-brown/60">
                {launchOfferClaim.hasClaimed
                  ? "Your one-time launch offer claim is confirmed. Our team is working toward fulfilment, so this cart will continue as a regular paid order."
                  : "Pick exactly 2 different products, 1 quantity each. Place your order, upload the final order confirmation to your Instagram Story, and tag @amritya_organics for verification."}
              </p>
            </div>
            <div className="rounded-2xl border border-brand-gold/15 bg-white px-5 py-4 text-left md:max-w-xs">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-gold">
                {launchOfferClaim.hasClaimed
                  ? "Claim Confirmed"
                  : launchOffer.isEligible
                    ? "Unlocked"
                    : "How to unlock"}
              </p>
              <p
                className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${
                  launchOffer.isEligible || launchOfferClaim.hasClaimed
                    ? "text-brand-green-fresh"
                    : "text-brand-brown/50"
                }`}
              >
                {launchOffer.message}
              </p>
              {!launchOfferClaim.hasClaimed && (
                <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-brand-brown/40">
                  Only {LAUNCH_OFFER_PACK_LIMIT} packs per item available.
                </p>
              )}
            </div>
          </div>
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
                const lowStock = isProductLowStock(item);
                const hasReachedStockLimit =
                  typeof item.stock_quantity === "number" &&
                  item.quantity >= item.stock_quantity;

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-brand-gold/10 p-4 md:p-6 flex gap-4 md:gap-6 items-center shadow-xl shadow-brand-brown/5 transition-all hover:shadow-2xl hover:translate-y-[-2px]"
                  >
                    <Link
                      href={`/product/${item.id}`}
                      className="relative w-20 md:w-24 aspect-square rounded-xl bg-brand-sand overflow-hidden shrink-0"
                    >
                      <ImageWithFallback
                        src={getProductThumbnail(item)}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 80px, 100px"
                      />
                    </Link>

                    <div className="flex-grow flex flex-col justify-between w-full min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <Link
                          href={`/product/${item.id}`}
                          className="flex-1 min-w-0 group/link"
                        >
                          <span className="text-[8px] text-brand-gold mb-1 block uppercase tracking-[0.2em] font-black">
                            {item.category}
                          </span>
                          <h3 className="text-base md:text-xl font-serif text-brand-brown tracking-tight mb-1 truncate md:whitespace-normal group-hover/link:text-brand-terracotta transition-colors">
                            {item.name}
                          </h3>
                          {item.name2 && (
                            <p className="text-[10px] md:text-xs text-brand-brown/40 font-medium mb-1 truncate font-devanagari">
                              {item.name2}
                            </p>
                          )}
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
                            {available && lowStock && (
                              <span className="px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] rounded-full border border-brand-terracotta/20 bg-brand-terracotta/10 text-brand-terracotta">
                                Selling Out Soon
                              </span>
                            )}
                          </div>
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id, user?.id)}
                          className="text-brand-brown/20 hover:text-brand-terracotta transition-all p-2 hover:scale-110 shrink-0"
                        >
                          <Trash2 size={18} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex flex-row items-center justify-between mt-4 pt-4 border-t border-brand-gold/10 gap-4">
                        <div className="flex items-center border border-brand-brown rounded-full bg-brand-cream/50 p-0.5 scale-90 sm:scale-100 origin-left">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                user?.id,
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-brand-brown hover:text-brand-terracotta transition-all rounded-full hover:bg-brand-cream"
                            aria-label="Decrease quantity"
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
                            disabled={hasReachedStockLimit}
                            className="w-8 h-8 flex items-center justify-center text-brand-brown hover:text-brand-green transition-all rounded-full hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-25"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>

                        <div className="text-right shrink-0">
                          {!available ? (
                            <div className="relative inline-block">
                              <span className="text-sm md:text-lg font-light text-brand-brown/20 tracking-tight">
                                Available Soon
                              </span>
                            </div>
                          ) : launchOffer.isEligible ? (
                            <div className="flex flex-col">
                              <span className="text-[9px] text-brand-brown/30 line-through font-bold">
                                ₹{actualLinePrice.toFixed(2)}
                              </span>
                              <span className="text-lg md:text-xl font-medium text-brand-green-fresh tracking-tight">
                                ₹0.00
                              </span>
                              <span className="text-[7px] uppercase tracking-widest font-black text-brand-green-fresh">
                                Launch Offer
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {itemHasDiscount && (
                                <span className="text-[9px] text-brand-brown/30 line-through font-bold">
                                  ₹{actualLinePrice.toFixed(2)}
                                </span>
                              )}
                              <span className="text-lg md:text-xl font-medium text-brand-brown tracking-tight">
                                ₹{discountedLinePrice.toFixed(2)}
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

                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown/60 font-light">
                      Items subtotal
                    </span>
                    <span className="text-brand-brown font-bold tracking-tight">
                      ₹{actualSubtotal.toFixed(2)}
                    </span>
                  </div>
                  {launchOffer.isEligible && (
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-green-fresh font-light italic">
                        Launch Story Offer ({LAUNCH_OFFER_CODE})
                      </span>
                      <span className="text-brand-green-fresh font-bold tracking-tight">
                        -₹{launchOfferDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {!launchOffer.isEligible && productDiscount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-green-fresh font-light italic">
                        Product Discount (
                        {((productDiscount / actualSubtotal) * 100).toFixed(0)}
                        %)
                      </span>
                      <span className="text-brand-green-fresh font-bold tracking-tight">
                        -₹{productDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {!launchOffer.isEligible && cartDiscount.amount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-green-fresh font-light italic">
                        Coupon Discount
                        {cartDiscount.code ? ` (${cartDiscount.code})` : ""} (
                        {cartDiscount.percent}%)
                      </span>
                      <span className="text-brand-green-fresh font-bold tracking-tight">
                        -₹{cartDiscount.amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {convenienceFee > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-brown/60 font-light">
                        Convenience Fee
                      </span>
                      <span className="text-brand-brown font-bold tracking-tight">
                        ₹{convenienceFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {!launchOffer.isEligible && (
                  <div className="mb-8 rounded-2xl border border-brand-green/10 bg-brand-green/5 p-4 text-center">
                    <p className="text-[8px] uppercase tracking-[0.2em] font-black text-brand-green-fresh">
                      {subtotalAfterDiscount >= freeShippingThreshold
                        ? "Shipping unlocks free at checkout for this order"
                        : `Shipping will be calculated at checkout after delivery address. Add ₹${freeShippingShortfall.toFixed(2)} more for free shipping.`}
                    </p>
                  </div>
                )}

                <div className="mb-8 rounded-2xl border border-brand-gold/10 bg-brand-cream/40 p-4">
                  <div className="mb-3 flex items-center gap-2 text-brand-brown">
                    <BadgePercent size={16} className="text-brand-gold" />
                    <span className="text-[9px] font-black uppercase tracking-[0.22em]">
                      Coupon Code
                    </span>
                  </div>

                  {launchOffer.isEligible ? (
                    <div className="rounded-xl border border-brand-green/15 bg-white px-4 py-3">
                      <p className="text-xs font-black tracking-widest text-brand-green-fresh">
                        {LAUNCH_OFFER_CODE}
                      </p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-brand-green-fresh">
                        Product cost waived. Coupon codes are disabled for this
                        launch offer.
                      </p>
                    </div>
                  ) : appliedDiscountCoupon ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-green/15 bg-white px-4 py-3">
                      <div>
                        <p className="text-xs font-black tracking-widest text-brand-green-fresh">
                          {appliedDiscountCoupon.code}
                        </p>
                        <p
                          className={`mt-1 text-[9px] font-bold uppercase tracking-widest ${cartDiscount.isEligible ? "text-brand-green-fresh" : "text-brand-terracotta"}`}
                        >
                          {cartDiscount.isEligible
                            ? `${appliedDiscountCoupon.percent}% OFF APPLIED`
                            : `ADD ₹${cartDiscount.shortfall.toFixed(2)} MORE TO UNLOCK`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-brand-brown/40 transition-colors hover:bg-brand-cream hover:text-brand-terracotta"
                        aria-label="Remove coupon code"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountInput}
                        onChange={(event) => {
                          setDiscountInput(event.target.value.toUpperCase());
                          setDiscountError(null);
                          setDiscountMessage(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleApplyDiscount();
                          }
                        }}
                        className="min-w-0 flex-1 rounded-full border border-brand-gold/15 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-brown outline-none transition-colors placeholder:text-brand-brown/20 focus:border-brand-brown"
                        placeholder="ENTER CODE"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyDiscount()}
                        disabled={isApplyingDiscount}
                        className="shrink-0 rounded-full bg-brand-brown px-5 py-3 text-[9px] font-black uppercase tracking-widest text-brand-cream transition-colors hover:bg-brand-brown-light"
                      >
                        {isApplyingDiscount ? "..." : "Apply"}
                      </button>
                    </div>
                  )}

                  {publicCoupons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCoupons(true)}
                      className="mt-3 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-gold transition-colors hover:text-brand-brown"
                    >
                      <Sparkles size={12} />
                      View all coupons
                    </button>
                  )}

                  {(discountError || discountMessage) && (
                    <p
                      className={`mt-3 text-[9px] font-bold uppercase tracking-widest ${
                        discountError
                          ? "text-brand-terracotta"
                          : "text-brand-green-fresh"
                      }`}
                    >
                      {discountError || discountMessage}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-base font-serif text-brand-brown">
                    Total
                  </span>
                  <span className="text-3xl font-medium text-brand-brown tracking-tighter">
                    ₹{totalPayable.toFixed(2)}
                  </span>
                </div>

                {hasUnavailableItems && (
                  <div className="mb-6 p-3 bg-brand-gold/5 rounded-xl border border-brand-gold/10">
                    <p className="text-[8px] uppercase tracking-widest font-black text-brand-gold text-center">
                      Some items are coming soon
                    </p>
                  </div>
                )}

                {/* Mobile Floating Checkout Bar - Redesigned to be "Wow" and Premium */}
                <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-brand-cream/95 backdrop-blur-xl border border-brand-gold/25 shadow-[0_20px_50px_rgba(60,54,42,0.22)] z-40 rounded-[2.2rem] p-1 safe-bottom animate-fade-in overflow-hidden">
                  {/* Subtle Jute/Paper texture background overlay */}
                  <div className="absolute inset-0 bg-organic-texture opacity-25 pointer-events-none" />
                  <div className="absolute inset-0 bg-jute opacity-[0.03] pointer-events-none" />

                  {/* Background organic SVG Leaf/Vine illustration for luxury feel */}
                  <div className="absolute right-0 top-0 -translate-y-4 translate-x-4 opacity-[0.08] pointer-events-none text-brand-gold">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 100 100"
                      fill="currentColor"
                    >
                      <path d="M50,10 C60,25 90,35 90,55 C90,75 75,90 50,90 C25,90 10,75 10,55 C10,35 40,25 50,10 Z M50,22 C43,32 22,41 22,55 C22,69 35,80 50,80 C65,80 78,69 78,55 C78,41 57,32 50,22 Z" />
                    </svg>
                  </div>

                  {/* Inner double border container for luxury box packaging feel */}
                  <div className="border border-brand-gold/15 rounded-[2rem] p-4 flex items-center justify-between gap-4 relative z-10">
                    {/* Left Column: Premium Price & Savings details */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.25em] font-black text-brand-brown/40">
                        Total To Pay
                      </span>
                      <span className="text-2xl font-bold text-brand-brown font-serif tracking-tight">
                        ₹{totalPayable.toFixed(2)}
                      </span>
                      {/* Dynamic Savings Tag - Premium UX touch */}
                      {cartDiscount.amount > 0 || productDiscount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-brand-green bg-brand-green/8 px-2.5 py-0.5 rounded-full border border-brand-green/20 w-fit mt-0.5">
                          <span className="w-1 h-1 rounded-full bg-brand-green animate-ping" />
                          <span>
                            Save ₹
                            {(cartDiscount.amount + productDiscount).toFixed(2)}
                          </span>
                        </span>
                      ) : subtotalAfterDiscount >= freeShippingThreshold ? (
                        <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/8 px-2.5 py-0.5 rounded-full border border-brand-gold/20 w-fit mt-0.5">
                          <span>Free Shipping</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/8 px-2.5 py-0.5 rounded-full border border-brand-gold/20 w-fit mt-0.5">
                          <span>Shipping at checkout</span>
                        </span>
                      )}
                    </div>

                    {/* Right Column: Checkout Action Button */}
                    <Link
                      href={hasUnavailableItems ? "#" : "/checkout"}
                      className={`flex-1 max-w-[215px] group relative flex items-center justify-center gap-2 py-4 px-4 bg-brand-green text-brand-cream rounded-full text-[10px] uppercase tracking-[0.15em] font-black transition-all duration-500 overflow-hidden shadow-[0_10px_25px_rgba(45,58,38,0.3)] active:scale-95 border border-brand-gold/30 ${
                        hasUnavailableItems
                          ? "opacity-40 cursor-not-allowed grayscale"
                          : ""
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-1.5 w-full text-center">
                        <ShieldCheck
                          size={14}
                          className="text-brand-gold animate-pulse flex-shrink-0"
                        />
                        <span className="whitespace-nowrap">Checkout</span>
                        <ArrowRight
                          size={12}
                          className="group-hover:translate-x-1.5 transition-transform duration-300 flex-shrink-0"
                        />
                      </span>
                      {/* Soft Shimmer Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-cream/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      {/* Elegant background overlay */}
                      <div className="absolute inset-0 bg-[#3a4b32] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Link>
                  </div>
                </div>

                {/* Desktop Static Checkout Bar */}
                <div className="hidden lg:block lg:static lg:p-0 lg:border-none lg:shadow-none z-40">
                  <Link
                    href={hasUnavailableItems ? "#" : "/checkout"}
                    className={`w-full group relative flex flex-col items-center justify-center gap-1 px-8 py-5 bg-brand-brown text-brand-cream rounded-2xl text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 overflow-hidden shadow-[0_20px_40px_-10px_rgba(60,54,42,0.3)] hover:translate-y-[-2px] ${
                      hasUnavailableItems
                        ? "opacity-40 cursor-not-allowed grayscale"
                        : ""
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <ShieldCheck
                        size={16}
                        className="text-brand-green-fresh"
                      />
                      Secure Checkout
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </span>
                    <span className="relative z-10 text-[7px] tracking-[0.2em] opacity-50 font-bold uppercase">
                      Shipping calculated after address
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                  </Link>
                </div>

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
            </div>
          </div>
        )}
      </div>
      {showCoupons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-brown/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-brand-gold/10 bg-white p-6 shadow-2xl shadow-brand-brown/20">
            <div className="mb-6 flex items-start justify-between gap-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold">
                  Public Coupons
                </p>
                <h2 className="mt-2 text-2xl font-serif tracking-tight text-brand-brown">
                  Available <span className="italic">Offers</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCoupons(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-brown/40 transition-colors hover:bg-brand-cream hover:text-brand-brown"
                aria-label="Close coupon popup"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-3">
              {isLoadingCoupons ? (
                <div className="rounded-2xl border border-brand-gold/10 bg-brand-cream/40 p-5 text-center text-[9px] font-black uppercase tracking-widest text-brand-brown/40">
                  Loading offers
                </div>
              ) : (
                publicCoupons.map((coupon) => {
                  const shortfall = getCouponShortfall(coupon);
                  const canApply = shortfall === 0 && !isApplyingDiscount;
                  const savings = (effectiveSubtotal * coupon.percent) / 100;

                  return (
                    <div
                      key={coupon.code}
                      className={`rounded-2xl border transition-all p-5 ${
                        canApply
                          ? "border-brand-gold/10 bg-brand-cream/40"
                          : "border-brand-brown/5 bg-brand-brown/[0.02] grayscale opacity-75"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black tracking-widest text-brand-brown">
                              {coupon.code}
                            </p>
                            {canApply && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-brand-green/10 text-brand-green-fresh px-2 py-0.5 rounded-full">
                                Save ₹{savings.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-light text-brand-brown/60">
                            {coupon.label} · {coupon.percent}% off
                          </p>
                          <div className="mt-2 space-y-1">
                            <p
                              className={`text-[9px] font-bold uppercase tracking-widest ${
                                shortfall > 0
                                  ? "text-brand-terracotta"
                                  : "text-brand-brown/40"
                              }`}
                            >
                              {coupon.minOrderValue
                                ? `Minimum order ₹${coupon.minOrderValue.toFixed(2)}`
                                : "No minimum order"}
                            </p>
                            {shortfall > 0 && (
                              <p className="text-[9px] font-bold uppercase tracking-widest text-brand-terracotta italic">
                                Add ₹{shortfall.toFixed(2)} more to unlock this
                                offer
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyDiscount(coupon.code)}
                          disabled={!canApply}
                          className={`rounded-full px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
                            canApply
                              ? "bg-brand-brown text-brand-cream hover:bg-brand-brown-light"
                              : "bg-brand-brown/10 text-brand-brown/20 cursor-not-allowed"
                          }`}
                        >
                          {canApply ? "Apply" : "Locked"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
