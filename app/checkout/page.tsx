"use client";

import { CartItem, useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { Address, useAddressStore } from "@/store/addressStore";
import type { PaymentDetails } from "@/store/orderStore";
import { useOrderStore } from "@/store/orderStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  CreditCard,
  ChevronRight,
  ArrowRight,
  Clock,
  Plus,
  Lock,
  Banknote,
  Share2,
  X,
  Camera,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import type { DiscountCode } from "@/lib/discountCodes";
import { calculateDiscount } from "@/lib/discountCodes";
import { LAUNCH_OFFER_CODE, getLaunchOfferState } from "@/lib/launchOffer";
import { getDiscountedPrice } from "@/lib/pricing";
import { getProductThumbnail, isProductAvailable } from "@/lib/data";
import { useLaunchOfferClaimStatus } from "@/lib/useLaunchOfferClaimStatus";
import { createInstagramStoryReceiptImage } from "@/lib/instagramStoryReceipt";

interface PlacedOrderDetails {
  id: string;
  items: CartItem[];
  paymentMethod: string;
  total: number;
}

type RazorpayOrderResponse = {
  keyId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
};

type ShippingRateEstimate = {
  available: boolean;
  shippingAmount: number;
  courierName: string | null;
  courierCompanyId: number | null;
  expectedDeliveryDate: string | null;
  codCharges: number;
  freightCharge: number;
  chargeableWeightKg: number;
  error: string | null;
};

type ShippingRateResponse = {
  estimate?: ShippingRateEstimate;
  error?: string;
};

type RazorpayCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  method?: "card" | "netbanking" | "wallet" | "upi" | "emi";
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  config?: {
    display?: {
      blocks?: Record<
        string,
        {
          name: string;
          instruments: Array<{
            method: string;
          }>;
        }
      >;
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

const getOrderErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const getCheckoutAlertTitle = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("already claimed") ||
    normalizedMessage.includes("duplicate")
  ) {
    return "Launch offer already claimed";
  }

  if (normalizedMessage.includes("sign in")) {
    return "Sign in required";
  }

  if (
    normalizedMessage.includes("stock") ||
    normalizedMessage.includes("available")
  ) {
    return "Stock changed";
  }

  return "We could not place this order";
};

type CheckoutIssueAlertProps = {
  message: string;
  onClose: () => void;
};

function CheckoutIssueAlert({ message, onClose }: CheckoutIssueAlertProps) {
  return (
    <div
      role="alert"
      className="animate-reveal-down overflow-hidden rounded-3xl border border-brand-terracotta/25 bg-white shadow-[0_24px_70px_-30px_rgba(60,54,42,0.45)]"
    >
      <div className="relative p-1">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#F8C878,#E8D090,#7FB069)]" />
        <div className="absolute inset-0 bg-organic-texture opacity-30" />
        <div className="relative flex items-start gap-4 rounded-[1.35rem] bg-brand-cream/75 px-4 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-terracotta/20 bg-white text-brand-terracotta shadow-lg shadow-brand-terracotta/10">
            <AlertTriangle size={20} strokeWidth={1.7} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-brand-terracotta">
              {getCheckoutAlertTitle(message)}
            </p>
            <p className="mt-2 text-sm font-light leading-relaxed text-brand-brown/75">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-gold/15 bg-white text-brand-brown/45 transition-colors hover:border-brand-terracotta/30 hover:text-brand-terracotta"
            aria-label="Dismiss checkout alert"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
    };
  }
}

const loadRazorpayCheckout = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay Checkout."));
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const appliedDiscountCode = useCartStore(
    (state) => state.appliedDiscountCode,
  );
  const appliedDiscountCoupon = useCartStore(
    (state) => state.appliedDiscountCoupon,
  );
  const applyDiscountCode = useCartStore((state) => state.applyDiscountCode);
  const removeDiscountCode = useCartStore((state) => state.removeDiscountCode);
  const orderSummary = useCartStore((state) => state.orderSummary);
  const { user } = useUserStore();
  const launchOfferClaim = useLaunchOfferClaimStatus(user);
  const { addresses, addAddress } = useAddressStore();
  const { placeOrder, isLoading: isPlacingOrder } = useOrderStore();
  const [mounted, setMounted] = useState(false);

  // Use values from store (synced from cart) and keep a deterministic fallback
  // so every new order stores explicit financial fields.
  const fallbackActualSubtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const fallbackEffectiveSubtotal = getTotalPrice();
  const rawLaunchOffer = getLaunchOfferState(items);
  const launchOffer =
    launchOfferClaim.hasClaimed || (user && launchOfferClaim.isLoading)
      ? {
          ...rawLaunchOffer,
          isEligible: false,
          message: launchOfferClaim.hasClaimed ? "" : "Checking status...",
        }
      : rawLaunchOffer;
  const usableOrderSummary =
    orderSummary?.couponDiscount.code === LAUNCH_OFFER_CODE &&
    !launchOffer.isEligible
      ? null
      : orderSummary;
  const launchOfferDiscount = launchOffer.isEligible
    ? fallbackActualSubtotal
    : 0;
  const totalPrice =
    usableOrderSummary?.actualSubtotal ?? fallbackActualSubtotal;
  const actualSubtotal =
    usableOrderSummary?.actualSubtotal ?? fallbackActualSubtotal;
  const productDiscount = launchOffer.isEligible
    ? launchOfferDiscount
    : (usableOrderSummary?.productDiscount ??
      Math.max(fallbackActualSubtotal - fallbackEffectiveSubtotal, 0));

  // Fallback calculation if orderSummary is missing
  const fallbackCartDiscount = calculateDiscount(
    launchOffer.isEligible ? 0 : fallbackEffectiveSubtotal,
    launchOffer.isEligible ? null : appliedDiscountCoupon,
  );

  const subtotalAfterDiscount = launchOffer.isEligible
    ? 0
    : (usableOrderSummary?.subtotalAfterDiscount ??
      fallbackCartDiscount.subtotalAfterDiscount);
  const baseShipping = launchOffer.isEligible
    ? 0
    : subtotalAfterDiscount >= 1000
      ? 0
      : subtotalAfterDiscount >= 500
        ? 99
        : subtotalAfterDiscount > 0
          ? 149
          : 0;
  const convenienceFee = launchOffer.isEligible
    ? 0
    : (usableOrderSummary?.convenienceFee ?? (actualSubtotal <= 300 ? 5 : 10));

  const cartDiscount = usableOrderSummary
    ? {
        amount: launchOffer.isEligible
          ? 0
          : usableOrderSummary.couponDiscount.amount,
        percent: launchOffer.isEligible
          ? 100
          : usableOrderSummary.couponDiscount.percent,
        code: launchOffer.isEligible
          ? LAUNCH_OFFER_CODE
          : usableOrderSummary.couponDiscount.code,
        isEligible: true, // If it's in orderSummary, it was eligible on cart page
        shortfall: 0,
        subtotalAfterDiscount: launchOffer.isEligible
          ? 0
          : usableOrderSummary.subtotalAfterDiscount,
      }
    : fallbackCartDiscount;

  const hasUnavailableItems = items.some((item) => !isProductAvailable(item));

  // Address state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [guestAddress, setGuestAddress] = useState<Address | null>(null);
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>(
    {},
  );
  const checkoutAddresses = user
    ? addresses
    : guestAddress
      ? [guestAddress]
      : [];
  const selectedAddress =
    checkoutAddresses.find((address) => address.id === selectedAddressId) ??
    null;

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState<string | null>(
    "razorpay",
  );

  const [dynamicShipping, setDynamicShipping] =
    useState<ShippingRateEstimate | null>(null);
  const currentCodFee =
    selectedPayment === "cod" && !launchOffer.isEligible
      ? (dynamicShipping?.codCharges ?? 0)
      : 0;
  const [shippingRateError, setShippingRateError] = useState<string | null>(
    null,
  );
  const [isShippingRateLoading, setIsShippingRateLoading] = useState(false);

  // Real-time shipping logic with capping
  const rawShippingAmount = dynamicShipping?.shippingAmount ?? baseShipping;
  const shippingCap = 99;
  const isCapped =
    !launchOffer.isEligible &&
    subtotalAfterDiscount < 1000 &&
    rawShippingAmount > shippingCap;

  const shipping = launchOffer.isEligible
    ? 0
    : subtotalAfterDiscount >= 1000
      ? 0
      : isCapped
        ? shippingCap
        : rawShippingAmount;

  const extraShippingAmount = launchOffer.isEligible
    ? (dynamicShipping?.freightCharge ?? 0)
    : subtotalAfterDiscount >= 1000
      ? (dynamicShipping?.freightCharge ?? 0)
      : isCapped
        ? Number((rawShippingAmount - shippingCap).toFixed(2))
        : 0;

  const finalTotal = launchOffer.isEligible
    ? 0
    : subtotalAfterDiscount + shipping + convenienceFee + currentCodFee;
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] =
    useState<PlacedOrderDetails | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [isSharingToInstagram, setIsSharingToInstagram] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && mounted && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, mounted, router, orderPlaced]);

  useEffect(() => {
    if (user?.email && !newAddress.email) {
      setTimeout(() => {
        setNewAddress((prev) => ({
          ...prev,
          email: prev.email || user.email || "",
        }));
      }, 0);
    }
  }, [user, newAddress.email]);

  useEffect(() => {
    const deliveryPostcode = selectedAddress?.zipCode.replace(/\D/g, "") ?? "";

    if (deliveryPostcode.length !== 6) {
      setDynamicShipping(null);
      setShippingRateError(
        selectedAddress ? "Select a valid 6-digit delivery pincode." : null,
      );
      setIsShippingRateLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchShippingRate = async () => {
      setIsShippingRateLoading(true);
      setShippingRateError(null);

      try {
        const response = await fetch("/api/shiprocket/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            deliveryPostcode,
            items,
            paymentMethod: selectedPayment,
            declaredValue: actualSubtotal,
          }),
        });
        const result = (await response.json()) as ShippingRateResponse;

        if (!response.ok || !result.estimate) {
          throw new Error(
            result.error ?? "Unable to calculate live shipping right now.",
          );
        }

        if (!result.estimate.available) {
          setDynamicShipping(null);
          setShippingRateError(
            result.estimate.error ??
              "Shiprocket does not show a serviceable courier for this pincode.",
          );
          return;
        }

        setDynamicShipping(result.estimate);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setDynamicShipping(null);
        setShippingRateError(
          error instanceof Error
            ? error.message
            : "Unable to calculate live shipping right now.",
        );
      } finally {
        setIsShippingRateLoading(false);
      }
    };

    void fetchShippingRate();

    return () => controller.abort();
  }, [items, selectedAddress, selectedPayment, actualSubtotal]);

  useEffect(() => {
    if (!orderPlaced) return;

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [orderPlaced]);

  useEffect(() => {
    if (launchOffer.isEligible || !appliedDiscountCode || appliedDiscountCoupon)
      return;

    const fetchAppliedCoupon = async () => {
      try {
        const response = await fetch("/api/discount-coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: appliedDiscountCode,
            subtotal: totalPrice,
          }),
        });
        const result = (await response.json()) as
          | { coupon: DiscountCode }
          | { error?: string };

        if (!response.ok || !("coupon" in result)) {
          throw new Error("Coupon is no longer available.");
        }

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
    totalPrice,
    launchOffer.isEligible,
    user?.id,
  ]);

  const createInstagramStoryImage = async (
    orderDetails: PlacedOrderDetails,
  ) => {
    return createInstagramStoryReceiptImage(orderDetails);
  };

  const handleInstagramStoryShare = async () => {
    if (!placedOrderDetails) return;

    setIsSharingToInstagram(true);
    try {
      const storyImage = await createInstagramStoryImage(placedOrderDetails);
      const shareData: ShareData = {
        files: [storyImage],
        text: "I just ordered some organic goodies from Urban Kisan! 🌿 Check out their website https://www.urbankisan.co and grab amazing launch offers. Don’t forget to tag them when you order! #UrbanKisan #OrganicFood #HealthyLiving #LaunchOffer",
        title: "Urban Kisan Launch Order",
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      const downloadUrl = URL.createObjectURL(storyImage);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = storyImage.name;
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);

      window.location.href = "instagram://story-camera";
      window.setTimeout(() => {
        window.open("https://www.instagram.com/urbankisan.co/", "_blank");
      }, 800);
    } catch (error) {
      console.error("Instagram story share error:", error);
      window.open("https://www.instagram.com/urbankisan.co/", "_blank");
    } finally {
      setIsSharingToInstagram(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-brand-gold/20" />
      </div>
    );
  }

  if (orderPlaced && placedOrderDetails) {
    const isLaunchOfferConfirmation =
      placedOrderDetails.paymentMethod === "instagram_story_verification";
    const shortOrderId = placedOrderDetails.id.slice(0, 8).toUpperCase();

    return (
      <div className="min-h-screen overflow-hidden bg-brand-cream px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4">
          <div className="order-confirmation-card relative overflow-hidden rounded-[1.65rem] border border-brand-gold/20 bg-white shadow-[0_30px_90px_-45px_rgba(60,54,42,0.45)]">
            <div className="absolute inset-0 bg-organic-texture opacity-35" />
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[linear-gradient(90deg,#F8C878,#E8D090,#112C24)]" />
            <div className="relative z-10 px-5 py-5 text-center">
              <div className="mb-3 flex items-center justify-between gap-4">
                <Image
                  src="/logo-horizon-new1.png"
                  alt="Urban Kisan"
                  width={80}
                  height={80}
                  className="h-auto w-16 object-contain"
                  priority
                />
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand-gold/25 bg-brand-cream shadow-xl confirmation-seal">
                  <CheckCircle2
                    size={30}
                    strokeWidth={1.4}
                    className="text-brand-green-fresh"
                  />
                </div>
              </div>

              <p className="mb-1 text-[8px] font-black uppercase tracking-[0.24em] text-brand-gold">
                {isLaunchOfferConfirmation
                  ? "Launch Offer Claimed"
                  : "Order Confirmed"}
              </p>
              <h1 className="mx-auto text-2xl font-serif leading-[1] tracking-tight text-brand-brown">
                Order Received
              </h1>
              <p className="mx-auto mt-2 max-w-xs text-[11px] font-light leading-relaxed text-brand-brown/60">
                {isLaunchOfferConfirmation
                  ? "Your launch offer products are reserved for Instagram verification."
                  : "Thank you for your order. We are preparing your package with care."}
              </p>

              <div className="my-4 border-t border-dashed border-brand-gold/30" />

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="confirmation-detail rounded-2xl border border-brand-gold/10 bg-brand-cream/45 px-3 py-2.5">
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-brand-brown/35">
                    Order ID
                  </p>
                  <p className="mt-1 font-serif text-lg tracking-tight text-brand-brown">
                    #{shortOrderId}
                  </p>
                </div>
                <div className="confirmation-detail rounded-2xl border border-brand-green/10 bg-brand-green/5 px-3 py-2.5 text-right">
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-brand-brown/35">
                    Total Amount
                  </p>
                  <p className="mt-1 font-serif text-lg tracking-tight text-brand-green">
                    ₹{placedOrderDetails.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-left">
                {placedOrderDetails.items.slice(0, 3).map((item, index) => (
                  <div
                    key={item.id}
                    className="confirmation-line flex items-center justify-between gap-3 rounded-2xl border border-brand-gold/10 bg-white/75 px-3 py-2.5"
                    style={{ animationDelay: `${200 + index * 90}ms` }}
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-serif text-sm tracking-tight text-brand-brown">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[7px] font-black uppercase tracking-[0.16em] text-brand-brown/35">
                        Qty {item.quantity} / {item.weight}
                      </p>
                    </div>
                    <p className="shrink-0 text-[8px] font-black uppercase tracking-[0.14em] text-brand-green">
                      Reserved
                    </p>
                  </div>
                ))}
                {placedOrderDetails.items.length > 3 && (
                  <div className="rounded-2xl border border-brand-gold/10 bg-brand-cream/45 px-3 py-2 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-brand-brown/45">
                      +{placedOrderDetails.items.length - 3} more items in this
                      order
                    </p>
                  </div>
                )}
              </div>

              {isLaunchOfferConfirmation && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-brand-terracotta/15 bg-brand-terracotta/5 px-4 py-2 text-brand-terracotta">
                  <Sparkles size={13} strokeWidth={1.8} />
                  <p className="text-[7px] font-black uppercase tracking-[0.2em]">
                    @urbankisan.co
                  </p>
                  <Sparkles size={13} strokeWidth={1.8} />
                </div>
              )}
            </div>
          </div>

          {isLaunchOfferConfirmation ? (
            <div className="animate-reveal-up space-y-3">
              <p className="rounded-2xl border border-brand-gold/20 bg-white px-4 py-3 text-center text-[10px] font-semibold leading-relaxed text-brand-brown/65 shadow-lg shadow-brand-brown/5">
                Before posting, add an Instagram mention tag for @urbankisan.co on
                your Story.
              </p>
              <button
                type="button"
                onClick={handleInstagramStoryShare}
                disabled={isSharingToInstagram}
                className="relative inline-flex min-h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[#DD2A7B] px-8 text-[9px] font-black uppercase tracking-[0.22em] text-white shadow-xl shadow-[#DD2A7B]/25 transition-all hover:translate-y-[-2px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#F58529,#DD2A7B,#8134AF,#515BD4)]" />
                <span className="absolute inset-0 bg-white/0 transition-colors hover:bg-white/10" />
                <span className="relative z-10 flex items-center gap-3">
                  {isSharingToInstagram ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                  ) : (
                    <Camera size={16} strokeWidth={2} />
                  )}
                  {isSharingToInstagram
                    ? "Preparing Story"
                    : "Take Me To Instagram"}
                </span>
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="animate-reveal-up inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-brown px-8 text-[9px] font-black uppercase tracking-[0.22em] text-brand-cream shadow-xl shadow-brand-brown/15 transition-all hover:translate-y-[-2px] hover:bg-brand-brown-light"
            >
              Continue Shopping
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (hasUnavailableItems) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-12 bg-white rounded-3xl shadow-2xl border border-brand-gold/10">
          <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-gold">
            <Clock size={32} />
          </div>
          <h2 className="text-3xl font-serif text-brand-brown mb-4 tracking-tight">
            Items Out of Stock
          </h2>
          <p className="text-brand-brown/60 mb-10 font-light text-balance">
            Some of your selected items are currently out of stock. Please
            refine your cart before proceeding.
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-3 bg-brand-brown text-brand-cream px-10 py-5 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light shadow-xl"
          >
            Refine Cart <ArrowLeft size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const completeOrder = async (
    deliveryAddress: Address,
    paymentMethod: string,
    paymentDetails?: PaymentDetails,
  ) => {
    const result = await placeOrder(
      user?.id || null,
      items,
      deliveryAddress,
      paymentMethod,
      finalTotal,
      paymentDetails,
      {
        subtotalAmount: totalPrice,
        productDiscountAmount: productDiscount,
        discountCode: launchOffer.isEligible
          ? LAUNCH_OFFER_CODE
          : cartDiscount.isEligible
            ? cartDiscount.code
            : null,
        discountPercent: launchOffer.isEligible
          ? 100
          : cartDiscount.isEligible
            ? cartDiscount.percent
            : 0,
        couponDiscountAmount: launchOffer.isEligible ? 0 : cartDiscount.amount,
        shippingAmount: shipping,
        extraShippingAmount: extraShippingAmount,
        convenienceFeeAmount: convenienceFee,
        codAmount: currentCodFee,
        freightCharge: dynamicShipping?.freightCharge ?? 0,
      },
    );

    if (result) {
      setPlacedOrderDetails({
        id: result.id,
        items,
        paymentMethod,
        total: finalTotal,
      });
      setOrderPlaced(true);
      clearCart(user?.id);
    }
  };

  const handleLaunchOfferOrder = async () => {
    if (!selectedAddressId || !launchOffer.isEligible) return;

    if (launchOfferClaim.hasClaimed) {
      setPaymentError(
        "You have already claimed the launch offer. Please place this as a regular paid order.",
      );
      return;
    }

    if (!user?.email) {
      setPaymentError("Please sign in to claim the launch offer.");
      router.push("/login");
      return;
    }

    const deliveryAddress = checkoutAddresses.find(
      (a) => a.id === selectedAddressId,
    );
    if (!deliveryAddress) return;

    try {
      setPaymentError(null);
      await completeOrder(
        deliveryAddress,
        "instagram_story_verification",
        undefined,
      );
    } catch (error) {
      console.error("Launch offer placement error:", error);
      setPaymentError(
        getOrderErrorMessage(
          error,
          "We could not place your launch offer order. Please try again.",
        ),
      );
    }
  };

  const handleCODPayment = async () => {
    if (!selectedAddressId) return;

    const deliveryAddress = checkoutAddresses.find(
      (a) => a.id === selectedAddressId,
    );
    if (!deliveryAddress) return;

    try {
      await completeOrder(deliveryAddress, "cod", undefined);
    } catch (error) {
      console.error("COD placement error:", error);
      setPaymentError(
        getOrderErrorMessage(
          error,
          "We could not place your COD order. Please try again.",
        ),
      );
    }
  };

  const handleRazorpayPayment = async () => {
    const deliveryAddress = checkoutAddresses.find(
      (a) => a.id === selectedAddressId,
    );

    if (!deliveryAddress || selectedPayment !== "razorpay") {
      return;
    }

    setPaymentError(null);
    setIsStartingPayment(true);

    try {
      await loadRazorpayCheckout();

      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          receipt: `urbankisan_${Date.now().toString(36)}`,
          notes: {
            customer_name: deliveryAddress.name,
            customer_phone: deliveryAddress.phone || "",
            customer_email: deliveryAddress.email || user?.email || "",
            discount_code: cartDiscount.isEligible
              ? (cartDiscount.code ?? "")
              : "",
            discount_amount: cartDiscount.amount.toFixed(2),
            convenience_fee: convenienceFee.toFixed(2),
          },
        }),
      });
      const orderData = (await orderResponse.json()) as
        | RazorpayOrderResponse
        | { error?: string };

      if (!orderResponse.ok || !("order" in orderData)) {
        throw new Error(
          "error" in orderData && orderData.error
            ? orderData.error
            : "Unable to initialise Razorpay payment.",
        );
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is not available.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Urban Kisan",
        description: "Organic pantry order",
        order_id: orderData.order.id,
        prefill: {
          name: deliveryAddress.name,
          email: deliveryAddress.email || user?.email || "",
          contact: deliveryAddress.phone,
        },
        method: "upi",
        notes: {
          address: `${deliveryAddress.address}, ${deliveryAddress.city}`,
        },
        theme: {
          color: "#4A533E",
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async (response) => {
          try {
            setIsStartingPayment(true);
            const verificationResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: orderData.order.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verificationData = await verificationResponse.json();

            if (!verificationResponse.ok || !verificationData.success) {
              throw new Error(
                verificationData.error || "Payment verification failed.",
              );
            }

            await completeOrder(deliveryAddress, "razorpay", {
              provider: "razorpay",
              provider_order_id: response.razorpay_order_id,
              provider_payment_id: response.razorpay_payment_id,
              provider_signature: response.razorpay_signature,
              amount: orderData.order.amount,
              currency: orderData.order.currency,
              status: "verified",
              verified_at: new Date().toISOString(),
            });
          } catch (error) {
            setPaymentError(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );
          } finally {
            setIsStartingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsStartingPayment(false);
          },
        },
      });

      razorpay.open();
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to start Razorpay payment.",
      );
      setIsStartingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream py-6 px-4 sm:px-6 lg:px-12">
      {paymentError && (
        <div className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-xl lg:left-auto lg:right-8 lg:top-8 lg:w-[420px]">
          <CheckoutIssueAlert
            message={paymentError}
            onClose={() => setPaymentError(null)}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto pb-32 lg:pb-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-3 mb-2">
              <span className="h-[1px] w-8 bg-brand-gold" />
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-gold">
                Final Step
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif text-brand-brown tracking-tight">
              Check<span className="italic">out</span>
            </h1>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-3 text-brand-brown/60 hover:text-brand-brown transition-all text-[9px] uppercase tracking-[0.2em] font-black"
          >
            <ArrowLeft size={12} /> Back to Cart
          </Link>
        </div>

        {launchOffer.isEligible && (
          <div className="mb-8 rounded-3xl border border-brand-green/15 bg-brand-green/5 p-5 shadow-xl shadow-brand-brown/5">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-green-fresh">
                <Share2 size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-green-fresh">
                  Launch Story Offer Unlocked
                </p>
                <h2 className="mt-2 text-2xl font-serif tracking-tight text-brand-brown">
                  Product cost is waived for this order.
                </h2>
                <p className="mt-2 max-w-2xl text-xs font-light leading-relaxed text-brand-brown/60">
                  Place the order for ₹0, then upload the final order
                  confirmation to your Instagram Story and tag @urbankisan.co.
                  We will process the order after verification.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
          {/* Left Column - Steps */}
          <div className="space-y-8">
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-3xl border border-brand-gold/10 p-6 md:p-8 shadow-2xl shadow-brand-brown/5">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-brown text-brand-cream flex items-center justify-center text-[10px] font-black">
                    1
                  </div>
                  <h2 className="text-xl font-serif text-brand-brown tracking-tight">
                    Shipping <span className="italic">Address</span>
                  </h2>
                </div>
                {addressConfirmed && (
                  <button
                    onClick={() => {
                      setAddressConfirmed(false);
                      setSelectedAddressId(null);
                      setDynamicShipping(null);
                    }}
                    className="text-[10px] uppercase tracking-widest font-black text-brand-gold hover:text-brand-terracotta transition-colors"
                  >
                    Change
                  </button>
                )}
              </div>

              {!addressConfirmed ? (
                <div className="space-y-6">
                  {checkoutAddresses.length > 0 && !showNewAddressForm && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {checkoutAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setAddressConfirmed(true);
                            window.setTimeout(() => {
                              document
                                .getElementById("checkout-payment-step")
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            }, 100);
                          }}
                          className={`p-6 text-left rounded-2xl border transition-all duration-500 relative group ${
                            selectedAddressId === addr.id
                              ? "bg-brand-brown text-brand-cream border-brand-brown shadow-xl"
                              : "bg-brand-cream text-brand-brown border-brand-gold/10 hover:border-brand-gold/40"
                          }`}
                        >
                          <div className="relative z-10">
                            <h4 className="text-[9px] uppercase tracking-[0.2em] font-black mb-3 opacity-60">
                              Deliver to
                            </h4>
                            <p className="text-base font-serif mb-1 tracking-tight">
                              {addr.name}
                            </p>
                            <p className="text-[11px] font-light opacity-80 leading-relaxed mb-3">
                              {addr.address}, {addr.city}, {addr.state} -{" "}
                              {addr.zipCode}
                            </p>
                            <p className="text-[9px] font-bold tracking-widest opacity-60">
                              {addr.phone}
                            </p>
                          </div>
                          {selectedAddressId === addr.id && (
                            <div className="absolute top-4 right-4">
                              <CheckCircle2 size={20} strokeWidth={1} />
                            </div>
                          )}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="p-6 text-left rounded-2xl border border-dashed border-brand-gold/30 hover:border-brand-gold/60 text-brand-brown/40 hover:text-brand-brown transition-all group flex flex-col items-center justify-center text-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus size={20} strokeWidth={1} />
                        </div>
                        <span className="text-[9px] uppercase tracking-widest font-black">
                          Add New Address
                        </span>
                      </button>
                    </div>
                  )}

                  {(checkoutAddresses.length === 0 || showNewAddressForm) && (
                    <div className="p-6 bg-brand-cream/50 rounded-2xl border border-brand-gold/5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            autoComplete="name"
                            value={newAddress.name}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                name: e.target.value,
                              })
                            }
                            className={`w-full bg-transparent border-b ${addressErrors.name ? "border-red-500" : "border-brand-gold/20"} py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2`}
                            placeholder="Full Name"
                          />
                          {addressErrors.name && (
                            <p className="text-xs text-red-500 mt-1">
                              {addressErrors.name}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            autoComplete="tel"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                            className={`w-full bg-transparent border-b ${addressErrors.phone ? "border-red-500" : "border-brand-gold/20"} py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2`}
                            placeholder="+91"
                          />
                          {addressErrors.phone && (
                            <p className="text-xs text-red-500 mt-1">
                              {addressErrors.phone}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            autoComplete="email"
                            value={newAddress.email}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                email: e.target.value,
                              })
                            }
                            className={`w-full bg-transparent border-b ${addressErrors.email ? "border-red-500" : "border-brand-gold/20"} py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2`}
                            placeholder="you@example.com"
                          />
                          {addressErrors.email && (
                            <p className="text-xs text-red-500 mt-1">
                              {addressErrors.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mb-6 space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                          Complete Address
                        </label>
                        <textarea
                          rows={2}
                          autoComplete="street-address"
                          value={newAddress.address}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              address: e.target.value,
                            })
                          }
                          className={`w-full bg-transparent border-b ${addressErrors.address ? "border-red-500" : "border-brand-gold/20"} py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors resize-none placeholder:text-brand-brown/10 font-light px-2`}
                          placeholder="Complete Address"
                        />
                        {addressErrors.address && (
                          <p className="text-xs text-red-500 mt-1">
                            {addressErrors.address}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            autoComplete="address-level2"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            className={`w-full bg-transparent border-b ${addressErrors.city ? "border-red-500" : "border-brand-gold/20"} py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2`}
                            placeholder="City"
                          />
                          {addressErrors.city && (
                            <p className="text-xs text-red-500 mt-1">
                              {addressErrors.city}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            autoComplete="address-level1"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                state: e.target.value,
                              })
                            }
                            className={`w-full bg-transparent border-b ${addressErrors.state ? "border-red-500" : "border-brand-gold/20"} py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2`}
                            placeholder="State"
                          />
                          {addressErrors.state && (
                            <p className="text-xs text-red-500 mt-1">
                              {addressErrors.state}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            Zip Code
                          </label>
                          <input
                            type="text"
                            autoComplete="postal-code"
                            inputMode="numeric"
                            value={newAddress.zipCode}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                zipCode: e.target.value,
                              })
                            }
                            className={`w-full bg-transparent border-b ${addressErrors.zipCode ? "border-red-500" : "border-brand-gold/20"} py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2`}
                            placeholder="Pin Code"
                          />
                          {addressErrors.zipCode && (
                            <p className="text-xs text-red-500 mt-1">
                              {addressErrors.zipCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button
                          onClick={async () => {
                            setAddressErrors({});
                            const errors: { [key: string]: string } = {};
                            if (!newAddress.name)
                              errors.name = "Name is required";
                            if (!newAddress.address)
                              errors.address = "Address is required";
                            if (!newAddress.city)
                              errors.city = "City is required";
                            if (!newAddress.state)
                              errors.state = "State is required";
                            if (!newAddress.zipCode)
                              errors.zipCode = "Pin Code is required";
                            if (!user) {
                              if (!newAddress.email)
                                errors.email =
                                  "Email is required for guest checkout";
                              if (!newAddress.phone)
                                errors.phone =
                                  "Phone is required for guest checkout";
                            } else {
                              if (!newAddress.email)
                                errors.email = "Email is required";
                              if (!newAddress.phone)
                                errors.phone = "Phone is required";
                            }
                            if (Object.keys(errors).length > 0) {
                              setAddressErrors(errors);
                              return;
                            }
                            if (user) {
                              const addedAddress = await addAddress(
                                user.id,
                                newAddress,
                              );
                              if (addedAddress?.id) {
                                setSelectedAddressId(addedAddress.id);
                                setAddressConfirmed(true);
                                window.setTimeout(() => {
                                  document
                                    .getElementById("checkout-payment-step")
                                    ?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                }, 100);
                              }
                              setShowNewAddressForm(false);
                            } else {
                              const tempAddr: Address = {
                                id: "guest",
                                user_id: null,
                                name: newAddress.name,
                                phone: newAddress.phone,
                                email: newAddress.email,
                                address: newAddress.address,
                                city: newAddress.city,
                                state: newAddress.state,
                                zipCode: newAddress.zipCode,
                              };
                              setGuestAddress(tempAddr);
                              setSelectedAddressId("guest");
                              setAddressConfirmed(true);
                              window.setTimeout(() => {
                                document
                                  .getElementById("checkout-payment-step")
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                              }, 100);
                              setShowNewAddressForm(false);
                            }
                          }}
                          className="flex-1 bg-brand-brown text-brand-cream py-3 rounded-xl lg:rounded-full text-[9px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light min-h-[42px]"
                        >
                          Confirm Address
                        </button>
                        {checkoutAddresses.length > 0 && (
                          <button
                            onClick={() => setShowNewAddressForm(false)}
                            className="px-6 py-3 text-[9px] uppercase tracking-widest font-black text-brand-brown/40 hover:text-brand-brown transition-colors min-h-[42px]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-brand-green/5 rounded-2xl border border-brand-green/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-green-fresh text-brand-cream flex items-center justify-center">
                        <MapPin size={20} strokeWidth={1} />
                      </div>
                      <p className="text-[10px] text-brand-green-fresh uppercase tracking-widest font-bold">
                        Confirmed for Delivery
                      </p>
                    </div>
                    <CheckCircle2
                      className="text-brand-green-fresh"
                      size={20}
                      strokeWidth={1}
                    />
                  </div>
                  {(() => {
                    const addr = checkoutAddresses.find(
                      (a) => a.id === selectedAddressId,
                    );
                    if (!addr) return null;
                    return (
                      <div className="ml-[52px]">
                        <p className="text-base font-serif text-brand-brown tracking-tight">
                          {addr.name}
                        </p>
                        <p className="text-[11px] font-light text-brand-brown/70 leading-relaxed mt-1">
                          {addr.address}, {addr.city}, {addr.state} -{" "}
                          {addr.zipCode}
                        </p>
                        {addr.phone && (
                          <p className="text-[10px] font-bold text-brand-brown/50 tracking-widest mt-1.5">
                            {addr.phone}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div
              id="checkout-payment-step"
              className={`bg-white rounded-3xl border border-brand-gold/10 p-6 md:p-8 shadow-2xl shadow-brand-brown/5 transition-opacity duration-500 ${!addressConfirmed ? "opacity-30 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-6 h-6 rounded-full bg-brand-brown text-brand-cream flex items-center justify-center text-[10px] font-black">
                  2
                </div>
                <h2 className="text-xl font-serif text-brand-brown tracking-tight">
                  {launchOffer.isEligible ? "Story" : "Payment"}{" "}
                  <span className="italic">
                    {launchOffer.isEligible ? "Verification" : "Method"}
                  </span>
                </h2>
              </div>

              <div className="space-y-6">
                {launchOffer.isEligible ? (
                  <div className="w-full rounded-2xl border border-brand-green/15 bg-brand-green/5 p-5 text-left shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-green-fresh">
                        <Share2 size={22} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-green-fresh mb-1">
                          Verification Method
                        </h4>
                        <p className="text-lg font-serif tracking-tight text-brand-brown">
                          Instagram Story Tag
                        </p>
                        <p className="mt-1 text-[10px] font-light leading-relaxed text-brand-brown/60">
                          No online payment is needed. Your order remains
                          pending until you share the confirmation on Instagram
                          Story and tag @urbankisan.co.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayment("razorpay");
                        setPaymentError(null);
                      }}
                      className={`w-full p-6 text-left rounded-2xl border shadow-xl flex items-center gap-5 relative transition-all ${
                        selectedPayment === "razorpay"
                          ? "bg-brand-brown text-brand-cream border-brand-brown"
                          : "bg-brand-cream text-brand-brown border-brand-gold/10 hover:border-brand-gold/40"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                        <CreditCard
                          size={24}
                          strokeWidth={1}
                          className="text-brand-gold"
                        />
                      </div>
                      <div>
                        <h4 className="text-[9px] uppercase tracking-[0.2em] font-black mb-1 opacity-60">
                          Payment Method
                        </h4>
                        <p className="text-lg font-serif tracking-tight">
                          Razorpay Checkout
                        </p>
                        <p className="text-[10px] font-light opacity-70 mt-1">
                          Test mode cards, UPI, wallets, and netbanking
                        </p>
                      </div>
                      {selectedPayment === "razorpay" && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle2 size={20} strokeWidth={1} />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayment("cod");
                        setPaymentError(null);
                      }}
                      className={`w-full p-6 text-left rounded-2xl border shadow-xl flex items-center gap-5 relative transition-all ${
                        selectedPayment === "cod"
                          ? "bg-brand-brown text-brand-cream border-brand-brown"
                          : "bg-brand-cream text-brand-brown border-brand-gold/10 hover:border-brand-gold/40"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                        <Banknote
                          size={24}
                          strokeWidth={1}
                          className="text-brand-gold"
                        />
                      </div>
                      <div>
                        <h4 className="text-[9px] uppercase tracking-[0.2em] font-black mb-1 opacity-60">
                          Payment Method
                        </h4>
                        <p className="text-lg font-serif tracking-tight">
                          Cash on Delivery
                        </p>
                        <p className="text-[10px] font-light opacity-70 mt-1">
                          Pay at your doorstep
                        </p>
                      </div>
                      {selectedPayment === "cod" && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle2 size={20} strokeWidth={1} />
                        </div>
                      )}
                    </button>
                  </>
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
                    {/* Left Column: Premium Price & Payment state details */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.25em] font-black text-brand-brown/40">
                        Total To Pay
                      </span>
                      <span className="text-2xl font-bold text-brand-brown font-serif tracking-tight">
                        ₹{finalTotal.toFixed(2)}
                      </span>
                      {/* Payment Mode Badge - Premium UX verification */}
                      {launchOffer.isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-brand-green bg-brand-green/8 px-2.5 py-0.5 rounded-full border border-brand-green/20 w-fit mt-0.5">
                          <span>Story Verification</span>
                        </span>
                      ) : selectedPayment ? (
                        <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/8 px-2.5 py-0.5 rounded-full border border-brand-gold/20 w-fit mt-0.5">
                          <span>
                            {selectedPayment === "razorpay"
                              ? "Secure Online"
                              : "Cash on Delivery"}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-brand-terracotta bg-brand-terracotta/8 px-2.5 py-0.5 rounded-full border border-brand-terracotta/20 w-fit mt-0.5">
                          <span>Choose Payment</span>
                        </span>
                      )}
                    </div>

                    {/* Right Column: Place Order/Pay Action Button */}
                    <button
                      onClick={
                        launchOffer.isEligible
                          ? handleLaunchOfferOrder
                          : selectedPayment === "razorpay"
                            ? handleRazorpayPayment
                            : handleCODPayment
                      }
                      disabled={
                        isPlacingOrder ||
                        isStartingPayment ||
                        isShippingRateLoading ||
                        (!launchOffer.isEligible && !selectedPayment)
                      }
                      className="flex-1 max-w-[180px] group relative flex items-center justify-center gap-2 py-3 px-4 bg-brand-green text-brand-cream rounded-full text-[9px] uppercase tracking-[0.15em] font-black transition-all duration-500 overflow-hidden shadow-[0_10px_25px_rgba(45,58,38,0.3)] active:scale-95 border border-brand-gold/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-1.5 w-full text-center">
                        {isPlacingOrder ||
                        isStartingPayment ||
                        isShippingRateLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        ) : launchOffer.isEligible ? (
                          <Share2
                            size={12}
                            className="text-brand-gold flex-shrink-0"
                          />
                        ) : selectedPayment === "razorpay" ? (
                          <Lock
                            size={12}
                            className="text-brand-gold animate-pulse flex-shrink-0"
                          />
                        ) : (
                          <Banknote
                            size={12}
                            className="text-brand-gold flex-shrink-0"
                          />
                        )}
                        <span className="whitespace-nowrap">
                          {isPlacingOrder ||
                          isStartingPayment ||
                          isShippingRateLoading
                            ? "Verifying..."
                            : launchOffer.isEligible
                              ? user
                                ? "Place Order"
                                : "Sign In"
                              : selectedPayment === "razorpay"
                                ? "Pay Securely"
                                : "Place Order"}
                        </span>
                        <ArrowRight
                          size={12}
                          className="group-hover:translate-x-1.5 transition-transform duration-300 flex-shrink-0"
                        />
                      </span>
                      {/* Soft Shimmer Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-cream/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      {/* Elegant background overlay */}
                      <div className="absolute inset-0 bg-[#3a4b32] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>
                  </div>
                </div>

                {/* Desktop Static Checkout Bar */}
                <div className="hidden lg:block lg:static lg:p-0 lg:border-none lg:shadow-none z-40">
                  <button
                    onClick={
                      launchOffer.isEligible
                        ? handleLaunchOfferOrder
                        : selectedPayment === "razorpay"
                          ? handleRazorpayPayment
                          : handleCODPayment
                    }
                    disabled={
                      isPlacingOrder ||
                      isStartingPayment ||
                      isShippingRateLoading ||
                      (!launchOffer.isEligible && !selectedPayment)
                    }
                    className="w-full group relative flex flex-col items-center justify-center gap-1 bg-brand-brown text-brand-cream py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black transition-all duration-500 overflow-hidden shadow-[0_20px_50px_-15px_rgba(60,54,42,0.4)] hover:translate-y-[-2px] disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      {launchOffer.isEligible ? (
                        <Share2 size={18} className="text-brand-green-fresh" />
                      ) : selectedPayment === "razorpay" ? (
                        <Lock size={18} className="text-brand-green-fresh" />
                      ) : (
                        <Banknote
                          size={18}
                          className="text-brand-green-fresh"
                        />
                      )}
                      {isPlacingOrder ||
                      isStartingPayment ||
                      isShippingRateLoading
                        ? "Verifying Securely..."
                        : launchOffer.isEligible
                          ? user
                            ? "Place Launch Offer Order"
                            : "Sign In To Claim Offer"
                          : selectedPayment === "razorpay"
                            ? `Pay ₹${finalTotal.toFixed(2)}`
                            : `Confirm Order ₹${finalTotal.toFixed(2)}`}
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-2 transition-transform"
                      />
                    </span>
                    <span className="relative z-10 text-[8px] tracking-[0.3em] opacity-60 font-bold uppercase flex items-center gap-2">
                      <ShieldCheck size={10} />
                      {launchOffer.isEligible
                        ? "Pending Instagram Story Verification"
                        : selectedPayment === "razorpay"
                          ? "Powered by Razorpay"
                          : "Verified Cash on Delivery Order"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="sticky top-32">
            <div className="bg-white rounded-3xl border border-brand-gold/10 p-8 shadow-2xl shadow-brand-brown/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full translate-x-1/2 -translate-y-1/2" />

              <h3 className="text-xl font-serif text-brand-brown mb-8 tracking-tight relative z-10">
                Order <span className="italic">Review</span>
              </h3>

              <div className="space-y-6 mb-8 pb-8 border-b border-brand-gold/10 relative z-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {items.map((item) => {
                  const available = isProductAvailable(item);
                  return (
                    <Link
                      key={item.id}
                      href={`/product/${item.id}`}
                      className="flex gap-4 items-center group hover:bg-brand-brown/[0.02] -m-2 p-2 rounded-2xl transition-all"
                    >
                      <div className="w-16 aspect-square rounded-xl bg-brand-sand overflow-hidden shrink-0 relative">
                        <ImageWithFallback
                          src={getProductThumbnail(item)}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-[11px] font-serif text-brand-brown line-clamp-1 group-hover:text-brand-terracotta transition-colors">
                          {item.name}
                        </h4>
                        {item.name2 && (
                          <p className="text-[9px] text-brand-brown/40 font-medium truncate font-devanagari">
                            {item.name2}
                          </p>
                        )}
                        <p className="text-[9px] text-brand-brown/40 uppercase tracking-widest font-bold mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-[11px] font-bold text-brand-brown shrink-0">
                        {!available
                          ? "Coming Soon"
                          : launchOffer.isEligible
                            ? "₹0.00"
                            : `₹${(getDiscountedPrice(item) * item.quantity).toFixed(2)}`}
                      </p>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-brown/80 font-light">
                    Subtotal
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
                      Coupon Discount ({cartDiscount.code}) (
                      {cartDiscount.percent}%)
                    </span>
                    <span className="text-brand-green-fresh font-bold tracking-tight">
                      -₹{cartDiscount.amount.toFixed(2)}
                    </span>
                  </div>
                )}

                {convenienceFee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown/80 font-light">
                      Convenience Fee
                    </span>
                    <span className="text-brand-brown font-bold tracking-tight">
                      ₹{convenienceFee.toFixed(2)}
                    </span>
                  </div>
                )}

                {!addressConfirmed ? (
                  <div className="bg-brand-cream/50 border border-brand-gold/10 rounded-2xl p-4 text-center mt-2">
                    <div className="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-2 text-brand-gold">
                      <MapPin size={12} />
                    </div>
                    <p className="text-[9px] text-brand-brown/40 uppercase tracking-widest font-black leading-relaxed">
                      Select delivery address to
                      <br />
                      calculate shipping charges
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-brand-brown/80 font-light">
                          Shipping
                        </span>
                        <span className="text-brand-brown font-bold tracking-tight">
                          {shipping > 0 ? `₹${shipping.toFixed(2)}` : "Free"}
                        </span>
                      </div>
                      {/* {dynamicShipping?.courierName && (
                          <p className="text-[8px] font-bold uppercase tracking-widest text-brand-green-fresh">
                            {dynamicShipping.courierName}
                            {dynamicShipping.expectedDeliveryDate
                              ? ` • ETA ${dynamicShipping.expectedDeliveryDate}`
                              : ""}
                          </p>
                        )} */}
                      {/* {isCapped && (
                          <p className="text-[8px] font-bold uppercase tracking-widest text-brand-gold italic">
                            Shipping Capped at ₹{shippingCap}
                          </p>
                        )} */}
                    </div>

                    {currentCodFee > 0 && (
                      <div className="mt-4 rounded-2xl border border-brand-gold/10 bg-brand-gold/5 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck
                              size={14}
                              className="text-brand-gold"
                            />
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold">
                              COD Handling Fee
                            </span>
                          </div>
                          <span className="text-brand-brown font-bold tracking-tight text-xs">
                            ₹{currentCodFee.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-brand-brown/60 font-medium">
                          These charges are taken by our shipping partner for
                          handling cash. Please make an{" "}
                          <button
                            type="button"
                            onClick={() => setSelectedPayment("razorpay")}
                            className="text-brand-green-fresh font-bold hover:underline"
                          >
                            online payment
                          </button>{" "}
                          to avoid these extra charges.
                        </p>
                      </div>
                    )}

                    {isShippingRateLoading && !launchOffer.isEligible && (
                      <div className="flex justify-between text-xs">
                        <span className="text-brand-brown/60 font-light">
                          Checking live shipping
                        </span>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
                      </div>
                    )}
                    {shippingRateError && !launchOffer.isEligible && (
                      <p className="rounded-2xl border border-brand-gold/10 bg-brand-cream/60 px-3 py-2 text-[9px] font-semibold leading-relaxed text-brand-brown/50">
                        {shippingRateError} Using standard shipping estimate for
                        now.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-between items-baseline mb-8 relative z-10 pt-8 border-t border-brand-gold/5">
                <span className="text-base font-serif text-brand-brown">
                  Final Total
                </span>
                <span className="text-3xl font-medium text-brand-brown tracking-tighter">
                  {addressConfirmed ? `₹${finalTotal.toFixed(2)}` : "—"}
                </span>
              </div>

              {/* Secure Checkout Trust */}
              <div className="grid grid-cols-2 gap-4 opacity-40 relative z-10">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} />
                  <span className="text-[7px] uppercase tracking-widest font-bold">
                    Secure
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} />
                  <span className="text-[7px] uppercase tracking-widest font-bold">
                    Original
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
