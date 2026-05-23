"use client";

import { CartItem, useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { Address, useAddressStore } from "@/store/addressStore";
import type { PaymentDetails } from "@/store/orderStore";
import { useOrderStore } from "@/store/orderStore";
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
  CalendarClock,
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import type { DiscountCode } from "@/lib/discountCodes";
import { calculateDiscount } from "@/lib/discountCodes";
import { getDiscountedPrice } from "@/lib/pricing";
import { getProductThumbnail, isProductAvailable } from "@/lib/data";
import {
  calculatePreorderCart,
  formatPreorderDate,
  getPreorderFullPaymentDue,
  getPreorderLinePricing,
  getPreorderShipBy,
  isPreorderProduct,
  isShippingEligibleForPreorder,
} from "@/lib/preorder";

interface PlacedOrderDetails {
  id: string;
  items: CartItem[];
  paymentMethod: string;
  total: number;
  dueToday?: number;
  balanceDue?: number;
  isPreorder?: boolean;
}

type RazorpayOrderResponse = {
  keyId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
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
  const { addresses, addAddress } = useAddressStore();
  const { placeOrder, isLoading: isPlacingOrder } = useOrderStore();
  const [mounted, setMounted] = useState(false);

  // Use values from store (synced from cart) to avoid mismatch
  const totalPrice = orderSummary?.actualSubtotal ?? getTotalPrice();
  const actualSubtotal = orderSummary?.actualSubtotal ?? totalPrice;
  const productDiscount = orderSummary?.productDiscount ?? 0;
  const hasPreorderItems = items.some((item) => isPreorderProduct(item));
  const preorderCart = calculatePreorderCart(items);

  // Fallback calculation if orderSummary is missing
  const fallbackCartDiscount = calculateDiscount(
    totalPrice,
    appliedDiscountCoupon,
  );

  const subtotalAfterDiscount =
    orderSummary?.subtotalAfterDiscount ??
    fallbackCartDiscount.subtotalAfterDiscount;
  const shipping =
    orderSummary?.shipping ??
    (subtotalAfterDiscount >= 1500
      ? 0
      : subtotalAfterDiscount >= 1000
        ? 49
        : subtotalAfterDiscount >= 500
          ? 99
          : subtotalAfterDiscount > 0
            ? 149
            : 0);
  const convenienceFee =
    orderSummary?.convenienceFee ?? Number((totalPrice * 0.01).toFixed(2));

  const cartDiscount = orderSummary
    ? {
        amount: orderSummary.couponDiscount.amount,
        percent: orderSummary.couponDiscount.percent,
        code: orderSummary.couponDiscount.code,
        isEligible: true, // If it's in orderSummary, it was eligible on cart page
        shortfall: 0,
        subtotalAfterDiscount: orderSummary.subtotalAfterDiscount,
      }
    : fallbackCartDiscount;

  const hasUnavailableItems = items.some(
    (item) => !isProductAvailable(item) && !isPreorderProduct(item),
  );

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
  const selectedAddress = checkoutAddresses.find(
    (address) => address.id === selectedAddressId,
  );
  const preorderShippingEligible =
    !hasPreorderItems || isShippingEligibleForPreorder(selectedAddress?.zipCode);
  const preorderPaymentDueAt =
    orderSummary?.preorderBalanceDue !== undefined && items[0]
      ? getPreorderFullPaymentDue(items[0])
      : null;
  const preorderShipBy = hasPreorderItems && items[0] ? getPreorderShipBy(items[0]) : null;

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

  const codCharge = 15;
  const currentCodFee =
    selectedPayment === "cod" && !hasPreorderItems ? codCharge : 0;

  const standardFinalTotal =
    (orderSummary?.totalPayable ??
      subtotalAfterDiscount + shipping + convenienceFee) + currentCodFee;
  const preorderDueToday =
    orderSummary?.preorderDueToday ??
    preorderCart.preorderDepositDue + convenienceFee;
  const preorderBalanceDue =
    orderSummary?.preorderBalanceDue ??
    preorderCart.preorderBalanceDue + shipping - cartDiscount.amount;
  const preorderOrderTotal =
    preorderCart.preorderSubtotal + shipping + convenienceFee - cartDiscount.amount;
  const finalTotal = hasPreorderItems ? preorderDueToday : standardFinalTotal;
  const orderTotalForRecord = hasPreorderItems
    ? preorderOrderTotal
    : standardFinalTotal;
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] =
    useState<PlacedOrderDetails | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isStartingPayment, setIsStartingPayment] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && mounted && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, mounted, router, orderPlaced]);

  useEffect(() => {
    if (!appliedDiscountCode || appliedDiscountCoupon) return;

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
    user?.id,
  ]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-brand-gold/20" />
      </div>
    );
  }

  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 text-center shadow-sm border border-brand-gold/10">
          <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-green-fresh">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif text-brand-brown mb-2 tracking-tight">
            {placedOrderDetails.isPreorder
              ? "Pre-order Reserved"
              : "Order Received"}
          </h1>
          <p className="text-brand-brown/60 mb-8 font-light">
            {placedOrderDetails.isPreorder
              ? "Your deposit is confirmed. We will remind you before the remaining balance is due."
              : "Thank you for your order! We are preparing your package."}
          </p>

          <div className="bg-brand-cream/50 p-6 rounded-2xl mb-8 border border-brand-gold/10 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40">
                Order ID
              </span>
              <span className="text-xs font-medium text-brand-brown">
                #{placedOrderDetails.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40">
                {placedOrderDetails.isPreorder ? "Pre-order Value" : "Total Amount"}
              </span>
              <span className="text-lg font-medium text-brand-brown">
                ₹{placedOrderDetails.total.toFixed(0)}
              </span>
            </div>
            {placedOrderDetails.isPreorder && (
              <>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40">
                    Deposit Paid
                  </span>
                  <span className="text-lg font-medium text-brand-green-fresh">
                    ₹{(placedOrderDetails.dueToday ?? 0).toFixed(0)}
                  </span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40">
                    Balance Due
                  </span>
                  <span className="text-lg font-medium text-brand-brown">
                    ₹{(placedOrderDetails.balanceDue ?? 0).toFixed(0)}
                  </span>
                </div>
              </>
            )}
          </div>

          {placedOrderDetails.isPreorder && (
            <div className="mb-8 rounded-2xl border border-brand-gold/15 bg-brand-gold/5 p-5 text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold">
                Next steps
              </p>
              <p className="mt-2 text-xs leading-relaxed text-brand-brown/60">
                Watch your profile dashboard for milestone updates, balance
                reminders, and eligible self-service changes.
              </p>
            </div>
          )}

          <Link
            href="/"
            className="block w-full py-4 rounded-xl bg-brand-brown text-brand-cream text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-brown-light transition-colors"
          >
            Continue Shopping
          </Link>
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
      orderTotalForRecord,
      paymentDetails,
      {
        subtotalAmount: totalPrice,
        discountCode: cartDiscount.isEligible ? cartDiscount.code : null,
        discountPercent: cartDiscount.isEligible ? cartDiscount.percent : 0,
        discountAmount: cartDiscount.amount,
        shippingAmount: shipping,
        convenienceFeeAmount: convenienceFee,
        codAmount: currentCodFee,
        purchaseMode: hasPreorderItems ? "preorder" : "standard",
        preorderSubtotal: hasPreorderItems
          ? preorderCart.preorderSubtotal
          : undefined,
        preorderDepositAmount: hasPreorderItems ? preorderDueToday : undefined,
        preorderBalanceAmount: hasPreorderItems
          ? preorderBalanceDue
          : undefined,
        preorderPaymentDueAt: preorderPaymentDueAt,
        preorderShipBy: preorderShipBy,
      },
    );

    if (result) {
      setPlacedOrderDetails({
        id: result.id,
        items,
        paymentMethod,
        total: orderTotalForRecord,
        dueToday: hasPreorderItems ? preorderDueToday : undefined,
        balanceDue: hasPreorderItems ? preorderBalanceDue : undefined,
        isPreorder: hasPreorderItems,
      });
      setOrderPlaced(true);
      clearCart(user?.id);
    }
  };

  const handleCODPayment = async () => {
    if (hasPreorderItems) {
      setPaymentError("Pre-order deposits must be paid online.");
      return;
    }
    if (!selectedAddressId) return;

    const deliveryAddress = checkoutAddresses.find(
      (a) => a.id === selectedAddressId,
    );
    if (!deliveryAddress) return;

    try {
      await completeOrder(deliveryAddress, "cod", undefined);
    } catch (error) {
      console.error("COD placement error:", error);
      setPaymentError("Failed to place COD order. Please try again.");
    }
  };

  const handleRazorpayPayment = async () => {
    const deliveryAddress = checkoutAddresses.find(
      (a) => a.id === selectedAddressId,
    );

    if (!deliveryAddress || selectedPayment !== "razorpay") {
      return;
    }

    if (!preorderShippingEligible) {
      setPaymentError("Pre-orders require a valid 6-digit delivery PIN code.");
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
          receipt: `amritya_${Date.now().toString(36)}`,
          notes: {
            customer_name: deliveryAddress.name,
            customer_phone: deliveryAddress.phone || "",
            customer_email: deliveryAddress.email || user?.email || "",
            discount_code: cartDiscount.isEligible
              ? (cartDiscount.code ?? "")
              : "",
            discount_amount: cartDiscount.amount.toFixed(2),
            convenience_fee: convenienceFee.toFixed(2),
            purchase_mode: hasPreorderItems ? "preorder" : "standard",
            payment_phase: hasPreorderItems ? "deposit" : "full",
            balance_due: hasPreorderItems
              ? preorderBalanceDue.toFixed(2)
              : "0.00",
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
        name: "Amritya Organics",
        description: hasPreorderItems
          ? "Organic pantry pre-order deposit"
          : "Organic pantry order",
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
              payment_phase: hasPreorderItems ? "deposit" : "full",
              remaining_balance: hasPreorderItems ? preorderBalanceDue : 0,
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
                    onClick={() => setAddressConfirmed(false)}
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
                          onClick={() => setSelectedAddressId(addr.id)}
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
                              await addAddress(user.id, newAddress);
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
                              setShowNewAddressForm(false);
                            }
                          }}
                          className="flex-1 bg-brand-brown text-brand-cream py-4 rounded-xl lg:rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light min-h-[48px]"
                        >
                          Confirm Address
                        </button>
                        {checkoutAddresses.length > 0 && (
                          <button
                            onClick={() => setShowNewAddressForm(false)}
                            className="px-8 py-4 text-[10px] uppercase tracking-widest font-black text-brand-brown/40 hover:text-brand-brown transition-colors min-h-[48px]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAddressId && !showNewAddressForm && (
                    <button
                      onClick={() => setAddressConfirmed(true)}
                      className="w-full group relative flex flex-col items-center justify-center gap-1 bg-brand-brown text-brand-cream py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black transition-all duration-500 overflow-hidden shadow-[0_20px_40px_-10px_rgba(60,54,42,0.3)] hover:translate-y-[-2px] hover:shadow-[0_30px_60px_-15px_rgba(60,54,42,0.4)]"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Proceed to Payment
                        <ChevronRight
                          size={16}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                      <span className="relative z-10 text-[7px] tracking-[0.2em] opacity-50 font-bold uppercase">
                        Select Payment Method Next
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                    </button>
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

            {hasPreorderItems && (
              <div className="bg-white rounded-3xl border border-brand-gold/10 p-6 md:p-8 shadow-2xl shadow-brand-brown/5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-brand-brown tracking-tight">
                      Pre-order <span className="italic">Schedule</span>
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-brand-brown/60">
                      Deposit is collected today through Razorpay. Balance is
                      due by{" "}
                      {formatPreorderDate(preorderPaymentDueAt)} and dispatch
                      is estimated by {formatPreorderDate(preorderShipBy)}.
                    </p>
                    {selectedAddress && !preorderShippingEligible && (
                      <p className="mt-3 rounded-xl border border-brand-terracotta/20 bg-brand-terracotta/5 p-3 text-[10px] font-black uppercase tracking-widest text-brand-terracotta">
                        Enter a valid 6-digit PIN code to reserve pre-order
                        shipping.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            <div
              className={`bg-white rounded-3xl border border-brand-gold/10 p-6 md:p-8 shadow-2xl shadow-brand-brown/5 transition-opacity duration-500 ${!addressConfirmed ? "opacity-30 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-6 h-6 rounded-full bg-brand-brown text-brand-cream flex items-center justify-center text-[10px] font-black">
                  2
                </div>
                <h2 className="text-xl font-serif text-brand-brown tracking-tight">
                  Payment <span className="italic">Method</span>
                </h2>
              </div>

              <div className="space-y-6">
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
                    if (hasPreorderItems) return;
                    setSelectedPayment("cod");
                    setPaymentError(null);
                  }}
                  disabled={hasPreorderItems}
                  className={`w-full p-6 text-left rounded-2xl border shadow-xl flex items-center gap-5 relative transition-all ${
                    selectedPayment === "cod"
                      ? "bg-brand-brown text-brand-cream border-brand-brown"
                      : "bg-brand-cream text-brand-brown border-brand-gold/10 hover:border-brand-gold/40"
                  } ${hasPreorderItems ? "opacity-45 cursor-not-allowed" : ""}`}
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
                      {hasPreorderItems
                        ? "Unavailable for pre-order deposits"
                        : "Pay at your doorstep (Extra ₹15 charge)"}
                    </p>
                  </div>
                  {selectedPayment === "cod" && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 size={20} strokeWidth={1} />
                    </div>
                  )}
                </button>

                {paymentError && (
                  <div className="rounded-2xl border border-brand-terracotta/20 bg-brand-terracotta/5 p-4 text-[10px] font-bold uppercase tracking-widest text-brand-terracotta">
                    {paymentError}
                  </div>
                )}

                <div className="lg:static fixed bottom-0 left-0 w-full bg-white lg:bg-transparent p-4 lg:p-0 border-t border-brand-gold/10 lg:border-none shadow-[0_-20px_40px_-10px_rgba(60,54,42,0.1)] lg:shadow-none z-40 safe-bottom">
                  <button
                    onClick={
                      selectedPayment === "razorpay"
                        ? handleRazorpayPayment
                        : handleCODPayment
                    }
                    disabled={
                      isPlacingOrder ||
                      isStartingPayment ||
                      !selectedPayment ||
                      !preorderShippingEligible
                    }
                    className="w-full group relative flex flex-col items-center justify-center gap-1 bg-brand-brown text-brand-cream py-4 lg:py-6 rounded-xl lg:rounded-2xl text-[12px] uppercase tracking-[0.4em] font-black transition-all duration-500 overflow-hidden shadow-[0_20px_50px_-15px_rgba(60,54,42,0.4)] hover:translate-y-[-2px] disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      {selectedPayment === "razorpay" ? (
                        <Lock size={18} className="text-brand-green-fresh" />
                      ) : (
                        <Banknote
                          size={18}
                          className="text-brand-green-fresh"
                        />
                      )}
                      {isPlacingOrder || isStartingPayment
                        ? "Verifying Securely..."
                        : selectedPayment === "razorpay"
                          ? hasPreorderItems
                            ? `Pay Deposit ₹${finalTotal.toFixed(0)}`
                            : `Pay ₹${finalTotal.toFixed(0)}`
                          : `Confirm Order ₹${finalTotal.toFixed(0)}`}
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-2 transition-transform"
                      />
                    </span>
                    <span className="relative z-10 text-[8px] tracking-[0.3em] opacity-60 font-bold uppercase flex items-center gap-2">
                      <ShieldCheck size={10} />
                      {selectedPayment === "razorpay"
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
                  const preorder = isPreorderProduct(item);
                  const preorderLine = getPreorderLinePricing(item);
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
                        <p className="text-[9px] text-brand-brown/40 uppercase tracking-widest font-bold mt-1">
                          Qty: {item.quantity}
                        </p>
                        {preorder && (
                          <p className="mt-1 text-[8px] uppercase tracking-widest font-black text-brand-gold">
                            Pre-order · Deposit ₹
                            {preorderLine.depositDue.toFixed(0)}
                          </p>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-brand-brown shrink-0">
                        {preorder
                          ? `₹${preorderLine.lineTotal.toFixed(0)}`
                          : available
                          ? `₹${(getDiscountedPrice(item) * item.quantity).toFixed(0)}`
                          : "Coming Soon"}
                      </p>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-brown/60 font-light">
                    Subtotal
                  </span>
                  <span className="text-brand-brown font-bold tracking-tight">
                    ₹{actualSubtotal.toFixed(0)}
                  </span>
                </div>
                {productDiscount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-green-fresh font-light italic">
                      Product Discount (
                      {((productDiscount / actualSubtotal) * 100).toFixed(0)}
                      %)
                    </span>
                    <span className="text-brand-green-fresh font-bold tracking-tight">
                      -₹{productDiscount.toFixed(0)}
                    </span>
                  </div>
                )}
                {cartDiscount.amount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-green-fresh font-light italic">
                      Coupon Discount ({cartDiscount.code}) (
                      {cartDiscount.percent}%)
                    </span>
                    <span className="text-brand-green-fresh font-bold tracking-tight">
                      -₹{cartDiscount.amount.toFixed(0)}
                    </span>
                  </div>
                )}
                {shipping > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown/60 font-light">
                      Shipping
                    </span>
                    <span className="text-brand-brown font-bold tracking-tight">
                      ₹{shipping}
                    </span>
                  </div>
                )}
                {convenienceFee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown/60 font-light">
                      Convenience Fee
                    </span>
                    <span className="text-brand-brown font-bold tracking-tight">
                      ₹{convenienceFee.toFixed(0)}
                    </span>
                  </div>
                )}
                {currentCodFee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown/60 font-light">
                      COD Charge
                    </span>
                    <span className="text-brand-brown font-bold tracking-tight">
                      ₹{currentCodFee}
                    </span>
                  </div>
                )}
                {hasPreorderItems && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-green-fresh font-light italic">
                        Deposit due today
                      </span>
                      <span className="text-brand-green-fresh font-bold tracking-tight">
                        ₹{preorderDueToday.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-brown/60 font-light">
                        Balance due later
                      </span>
                      <span className="text-brand-brown font-bold tracking-tight">
                        ₹{preorderBalanceDue.toFixed(0)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between items-baseline mb-8 relative z-10 pt-8 border-t border-brand-gold/5">
                <span className="text-base font-serif text-brand-brown">
                  {hasPreorderItems ? "Due Today" : "Final Total"}
                </span>
                <span className="text-3xl font-medium text-brand-brown tracking-tighter">
                  ₹{finalTotal.toFixed(0)}
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
