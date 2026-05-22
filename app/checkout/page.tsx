"use client";

import { CartItem, useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { Address, useAddressStore } from "@/store/addressStore";
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
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getDiscountedPrice } from "@/lib/pricing";
import { getProductThumbnail, isProductAvailable } from "@/lib/data";

interface PlacedOrderDetails {
  id: string;
  items: CartItem[];
  paymentMethod: string;
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useUserStore();
  const { addresses, addAddress } = useAddressStore();
  const { placeOrder, isLoading: isPlacingOrder } = useOrderStore();
  const [mounted, setMounted] = useState(false);

  const totalPrice = getTotalPrice();
  const finalTotal =
    totalPrice + (totalPrice > 0 && totalPrice <= 500 ? 50 : 0);
  const hasUnavailableItems = items.some((item) => !isProductAvailable(item));

  // Address state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [guestAddress, setGuestAddress] = useState<Address | null>(null);
  const checkoutAddresses = user
    ? addresses
    : guestAddress
      ? [guestAddress]
      : [];

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState<string | null>("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] =
    useState<PlacedOrderDetails | null>(null);

  // UPI state
  const [upiId, setUpiId] = useState("");
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiVerificationResult, setUpiVerificationResult] = useState<{
    success: boolean;
    name?: string;
    error?: string;
  } | null>(null);

  const verifyUpiId = async () => {
    if (!upiId) return;

    setIsVerifyingUpi(true);
    setUpiVerificationResult(null);

    try {
      const response = await fetch("/api/verify-vpa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vpa: upiId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUpiVerificationResult({
          success: true,
          name: data.data.customer_name,
        });
      } else {
        setUpiVerificationResult({
          success: false,
          error: data.error?.message || data.message || "Invalid UPI ID",
        });
      }
    } catch {
      setUpiVerificationResult({
        success: false,
        error: "Verification failed. Please try again.",
      });
    } finally {
      setIsVerifyingUpi(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && mounted && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, mounted, router, orderPlaced]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-brand-gold/20" />
      </div>
    );
  }

  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="min-h-screen bg-brand-cream py-24 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-brand-gold/10 p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-green/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full translate-x-1/2 translate-y-1/2" />

          <div className="relative">
            <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-10 text-brand-cream shadow-xl shadow-brand-green/20 animate-float">
              <CheckCircle2 size={48} strokeWidth={1} />
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif text-brand-brown tracking-tight mb-4">
              Order <span className="italic">Confirmed</span>
            </h1>
            <p className="text-brand-brown/60 mb-10 font-light text-lg">
              Thank you for shopping with Amritya Organics.
            </p>

            <div className="inline-block px-8 py-3 bg-brand-sand/50 rounded-full border border-brand-gold/10 mb-16">
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-brown">
                Order Number #{placedOrderDetails.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left mb-16">
              <div className="p-8 bg-brand-cream/50 rounded-2xl border border-brand-gold/5">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-gold mb-6">
                  Order Summary
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                  {placedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-16 h-12 rounded-xl bg-brand-sand overflow-hidden shrink-0">
                        <ImageWithFallback
                          src={getProductThumbnail(item)}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs font-serif text-brand-brown line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[9px] text-brand-brown/40 uppercase tracking-widest font-bold mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-brand-brown">
                        ₹{(getDiscountedPrice(item) * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-brand-brown/40 font-light">
                      Total Paid
                    </span>
                    <span className="text-2xl font-medium text-brand-brown tracking-tighter">
                      ₹{placedOrderDetails.total.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-brand-gold">
                    <span>Payment Method</span>
                    <span>{placedOrderDetails.paymentMethod}</span>
                  </div>
                </div>
                <div className="p-6 bg-brand-green/5 rounded-2xl border border-brand-green/10 flex items-center gap-4">
                  <ShieldCheck
                    className="text-brand-green"
                    size={24}
                    strokeWidth={1}
                  />
                  <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest leading-relaxed">
                    A confirmation email has been sent to your inbox.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href={user ? "/profile" : "/"}
                className="inline-flex items-center justify-center gap-3 bg-brand-cream border border-brand-brown text-brand-brown px-10 py-5 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown hover:text-brand-cream"
              >
                {user ? "View Orders" : "Back to Home"}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-3 bg-brand-brown text-brand-cream px-10 py-5 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light shadow-xl shadow-brand-brown/20"
              >
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </div>
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

  return (
    <div className="min-h-screen bg-brand-cream py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={newAddress.name}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                name: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2"
                            placeholder="Full Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2"
                            placeholder="+91"
                          />
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                          Complete Address
                        </label>
                        <textarea
                          rows={2}
                          value={newAddress.address}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              address: e.target.value,
                            })
                          }
                          className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors resize-none placeholder:text-brand-brown/10 font-light px-2"
                          placeholder="Complete Address"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                state: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2"
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                            Zip Code
                          </label>
                          <input
                            type="text"
                            value={newAddress.zipCode}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                zipCode: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2"
                            placeholder="Pin Code"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button
                          onClick={async () => {
                            if (
                              !newAddress.name ||
                              !newAddress.address ||
                              !newAddress.zipCode
                            )
                              return;
                            if (user) {
                              await addAddress(user.id, newAddress);
                              setShowNewAddressForm(false);
                            } else {
                              const tempAddr: Address = {
                                id: "guest",
                                user_id: null,
                                name: newAddress.name,
                                phone: newAddress.phone,
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
                          className="flex-1 bg-brand-brown text-brand-cream py-4 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light"
                        >
                          Confirm Address
                        </button>
                        {checkoutAddresses.length > 0 && (
                          <button
                            onClick={() => setShowNewAddressForm(false)}
                            className="px-8 py-4 text-[10px] uppercase tracking-widest font-black text-brand-brown/40 hover:text-brand-brown transition-colors"
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
                      className="w-full bg-brand-brown text-brand-cream py-4 rounded-full text-[10px] uppercase tracking-[0.4em] font-black transition-all hover:bg-brand-brown-light shadow-2xl shadow-brand-brown/20 flex items-center justify-center gap-4"
                    >
                      Proceed to Payment <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-brand-green/5 rounded-2xl border border-brand-green/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-green text-brand-cream flex items-center justify-center">
                      <MapPin size={20} strokeWidth={1} />
                    </div>
                    <div>
                      <p className="text-base font-serif text-brand-brown">
                        {
                          checkoutAddresses.find(
                            (a) => a.id === selectedAddressId,
                          )?.name
                        }
                      </p>
                      <p className="text-[10px] text-brand-green uppercase tracking-widest font-bold mt-0.5">
                        Confirmed for Delivery
                      </p>
                    </div>
                  </div>
                  <CheckCircle2
                    className="text-brand-green"
                    size={20}
                    strokeWidth={1}
                  />
                </div>
              )}
            </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button
                    onClick={() => setSelectedPayment("cod")}
                    className={`p-8 text-left rounded-2xl border transition-all duration-500 flex flex-col items-center text-center gap-4 relative group overflow-hidden ${
                      selectedPayment === "cod"
                        ? "bg-brand-brown text-brand-cream border-brand-brown shadow-xl"
                        : "bg-brand-cream text-brand-brown border-brand-gold/10 hover:border-brand-gold/40"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <CreditCard
                        size={24}
                        strokeWidth={1}
                        className={
                          selectedPayment === "cod"
                            ? "text-brand-gold"
                            : "text-brand-brown/40"
                        }
                      />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-[9px] uppercase tracking-[0.2em] font-black mb-1">
                        Standard
                      </h4>
                      <p className="text-lg font-serif tracking-tight">
                        Cash on Delivery
                      </p>
                    </div>
                    {selectedPayment === "cod" && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 size={20} strokeWidth={1} />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedPayment("upi")}
                    className={`p-8 text-left rounded-2xl border transition-all duration-500 flex flex-col items-center text-center gap-4 relative group overflow-hidden ${
                      selectedPayment === "upi"
                        ? "bg-brand-brown text-brand-cream border-brand-brown shadow-xl"
                        : "bg-brand-cream text-brand-brown border-brand-gold/10 hover:border-brand-gold/40"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className={
                          selectedPayment === "upi"
                            ? "text-brand-gold"
                            : "text-brand-brown/40"
                        }
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-[9px] uppercase tracking-[0.2em] font-black mb-1">
                        Instant
                      </h4>
                      <p className="text-lg font-serif tracking-tight">
                        UPI Payment
                      </p>
                    </div>
                    {selectedPayment === "upi" && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 size={20} strokeWidth={1} />
                      </div>
                    )}
                  </button>
                </div>

                {selectedPayment === "upi" && (
                  <div className="p-8 bg-brand-cream rounded-2xl border border-brand-gold/10 animate-fade-in">
                    <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-3">
                      UPI ID
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 bg-white border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-4"
                        placeholder="username@bank"
                      />
                      <button
                        onClick={verifyUpiId}
                        disabled={isVerifyingUpi || !upiId}
                        className="px-8 py-2 bg-brand-gold text-brand-cream rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown shadow-xl disabled:opacity-50"
                      >
                        {isVerifyingUpi ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                    {upiVerificationResult && (
                      <div
                        className={`mt-4 p-3 rounded-xl text-[9px] uppercase tracking-widest font-black ${
                          upiVerificationResult.success
                            ? "bg-brand-green/10 text-brand-green"
                            : "bg-brand-terracotta/10 text-brand-terracotta"
                        }`}
                      >
                        {upiVerificationResult.success
                          ? `Verified: ${upiVerificationResult.name}`
                          : upiVerificationResult.error}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={async () => {
                    const deliveryAddress = checkoutAddresses.find(
                      (a) => a.id === selectedAddressId,
                    );
                    if (!deliveryAddress || !selectedPayment) return;
                    if (
                      selectedPayment === "upi" &&
                      !upiVerificationResult?.success
                    )
                      return;

                    const result = await placeOrder(
                      user?.id || null,
                      items,
                      deliveryAddress,
                      selectedPayment,
                      finalTotal,
                    );

                    if (result) {
                      setPlacedOrderDetails({
                        id: result.id,
                        items: items,
                        paymentMethod: selectedPayment,
                        total: finalTotal,
                      });
                      setOrderPlaced(true);
                      clearCart(user?.id);
                    }
                  }}
                  disabled={
                    isPlacingOrder ||
                    !selectedPayment ||
                    (selectedPayment === "upi" &&
                      !upiVerificationResult?.success)
                  }
                  className="w-full bg-brand-brown text-brand-cream py-5 rounded-full text-[12px] uppercase tracking-[0.4em] font-black transition-all hover:bg-brand-brown-light shadow-2xl shadow-brand-brown/20 flex items-center justify-center gap-6 disabled:opacity-50 mt-8 group overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {isPlacingOrder ? "Processing Order..." : "Place Order"}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-2 transition-transform"
                    />
                  </span>
                  <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                </button>
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
                    <div
                      key={item.id}
                      className="flex gap-4 items-center group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-brand-sand overflow-hidden shrink-0 relative">
                        <ImageWithFallback
                          src={getProductThumbnail(item)}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-[11px] font-serif text-brand-brown line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-brand-brown/40 uppercase tracking-widest font-bold mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-[11px] font-bold text-brand-brown">
                        {available
                          ? `₹${(getDiscountedPrice(item) * item.quantity).toFixed(0)}`
                          : "Coming Soon"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-brown/60 font-light">
                    Subtotal
                  </span>
                  <span className="text-brand-brown font-bold tracking-tight">
                    ₹{totalPrice.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-brand-brown/60 font-light">
                    Shipping
                  </span>
                  <span className="text-brand-brown font-bold tracking-tight">
                    {totalPrice > 500 ? (
                      <span className="text-brand-green italic">Free</span>
                    ) : (
                      `₹50`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-8 relative z-10 pt-8 border-t border-brand-gold/5">
                <span className="text-base font-serif text-brand-brown">
                  Final Total
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
