"use client";

import { CartItem, useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getDiscountedPrice } from "@/lib/pricing";
import { getProductThumbnail } from "@/lib/data";

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

  // Address state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
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
    // Only redirect if cart is empty AND an order hasn't just been placed
    if (items.length === 0 && mounted && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, mounted, router, orderPlaced]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8"></div>
    );
  }

  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 md:p-12 max-w-2xl w-full text-center">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-stone-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-stone-500 mb-2">
            Thank you for choosing Organica Staples. Your order will be
            delivered soon.
          </p>
          <p className="text-stone-900 font-bold text-lg mb-8">
            Order ID: #{placedOrderDetails.id.slice(0, 8).toUpperCase()}
          </p>

          <div className="bg-stone-50 rounded-xl p-6 text-left mb-8 border border-stone-100">
            <h3 className="font-medium text-stone-900 mb-4 border-b border-stone-200 pb-2">
              Order Summary
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {placedOrderDetails.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="relative w-32 aspect-video bg-stone-100 rounded-lg overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={getProductThumbnail(item)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-stone-900 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-stone-900 pt-1">
                    ₹{(getDiscountedPrice(item) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-end">
              <span className="text-sm font-medium text-stone-600">
                Total Paid ({placedOrderDetails.paymentMethod.toUpperCase()})
              </span>
              <span className="text-xl font-bold text-brand-brown">
                ₹{placedOrderDetails.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile"
              className="inline-block bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-8 py-3 rounded-xl transition-colors"
            >
              View Orders
            </Link>
            <Link
              href="/"
              className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/cart"
            className="p-2 -ml-2 text-stone-500 hover:text-emerald-700 transition-colors rounded-full hover:bg-stone-100"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-serif text-stone-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-stone-900">
                  1. Delivery Address
                </h2>
                {addressConfirmed && (
                  <button
                    onClick={() => setAddressConfirmed(false)}
                    className="text-sm text-emerald-700 hover:underline"
                  >
                    Change
                  </button>
                )}
              </div>

              {!addressConfirmed ? (
                <div>
                  {addresses.length > 0 && !showNewAddressForm && (
                    <div className="space-y-4 mb-6">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                            selectedAddressId === addr.id
                              ? "border-emerald-600 bg-emerald-50/30"
                              : "border-stone-200 hover:border-emerald-300"
                          }`}
                        >
                          <div className="pt-1">
                            <input
                              type="radio"
                              name="address"
                              value={addr.id}
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-600"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-stone-900">
                                {addr.name}
                              </span>
                              <span className="text-sm text-stone-500">
                                {addr.phone}
                              </span>
                            </div>
                            <p className="text-sm text-stone-600">
                              {addr.address}
                            </p>
                            <p className="text-sm text-stone-600">
                              {addr.city}, {addr.state} {addr.zipCode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {!showNewAddressForm && (
                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-emerald-700 font-medium text-sm hover:underline flex items-center gap-1 mb-6"
                    >
                      + Add a new address
                    </button>
                  )}

                  {showNewAddressForm && (
                    <form
                      className="space-y-4 mb-6 border border-stone-200 p-4 rounded-xl bg-stone-50/50"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (user) {
                          await addAddress(user.id, newAddress);
                          setShowNewAddressForm(false);
                          setNewAddress({
                            name: "",
                            phone: "",
                            address: "",
                            city: "",
                            state: "",
                            zipCode: "",
                          });
                          // Select the newest address if available (this is optimistic, exact ID depends on DB update)
                          // For a real app, `addAddress` might return the created address, but for now we just close the form.
                        } else {
                          router.push("/login");
                        }
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.name}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            required
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          Flat, House no., Building, Company, Apartment
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.address}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.zipCode}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                zipCode: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-800 transition-colors"
                        >
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          className="px-6 py-2 rounded-lg font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <button
                    onClick={() => {
                      if (selectedAddressId) {
                        setAddressConfirmed(true);
                      }
                    }}
                    disabled={!selectedAddressId || showNewAddressForm}
                    className="w-full sm:w-auto bg-brand-brown hover:bg-brand-brown-light text-white font-medium px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deliver Here
                  </button>
                </div>
              ) : (
                <div className="text-stone-600 text-sm">
                  {addresses
                    .filter((a) => a.id === selectedAddressId)
                    .map((addr) => (
                      <div key={addr.id}>
                        <span className="font-medium text-stone-900 block mb-1">
                          {addr.name}
                        </span>
                        <p>{addr.address}</p>
                        <p>
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                        <p className="mt-1">Phone: {addr.phone}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Step 2: Payment Options */}
            <div
              className={`bg-white rounded-xl shadow-sm border border-stone-100 p-6 transition-opacity duration-300 ${!addressConfirmed ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <h2 className="text-xl font-medium text-stone-900 mb-6">
                2. Payment Method
              </h2>

              <div className="space-y-4">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedPayment === "cod"
                      ? "border-emerald-600 bg-emerald-50/30"
                      : "border-stone-200 hover:border-emerald-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={selectedPayment === "cod"}
                    onChange={() => setSelectedPayment("cod")}
                    className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-600"
                  />
                  <div>
                    <span className="font-medium text-stone-900 block">
                      Cash on Delivery
                    </span>
                    <span className="text-sm text-stone-500">
                      Pay when your order arrives
                    </span>
                  </div>
                </label>

                {/* Card Payment */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedPayment === "card"
                      ? "border-emerald-600 bg-emerald-50/30"
                      : "border-stone-200 hover:border-emerald-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={selectedPayment === "card"}
                    onChange={() => setSelectedPayment("card")}
                    className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-600"
                  />
                  <div className="w-full">
                    <span className="font-medium text-stone-900 block">
                      Credit / Debit Card
                    </span>
                    {selectedPayment === "card" && (
                      <div className="mt-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Card Number"
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                        />
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* UPI Payment */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedPayment === "upi"
                      ? "border-emerald-600 bg-emerald-50/30"
                      : "border-stone-200 hover:border-emerald-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={selectedPayment === "upi"}
                    onChange={() => setSelectedPayment("upi")}
                    className="w-4 h-4 text-emerald-600 border-stone-300 focus:ring-emerald-600"
                  />
                  <div className="w-full">
                    <span className="font-medium text-stone-900 block">
                      UPI
                    </span>
                    {selectedPayment === "upi" && (
                      <div className="mt-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter UPI ID (e.g. username@upi)"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setUpiVerificationResult(null); // Reset on typing
                            }}
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              verifyUpiId();
                            }}
                            disabled={
                              !upiId ||
                              isVerifyingUpi ||
                              upiVerificationResult?.success
                            }
                            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isVerifyingUpi
                              ? "..."
                              : upiVerificationResult?.success
                                ? "Verified"
                                : "Verify"}
                          </button>
                        </div>

                        {upiVerificationResult && (
                          <div
                            className={`mt-2 text-xs font-medium ${upiVerificationResult.success ? "text-emerald-600" : "text-red-500"}`}
                          >
                            {upiVerificationResult.success
                              ? `✓ Verified: ${upiVerificationResult.name}`
                              : `✗ ${upiVerificationResult.error}`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <button
                  disabled={
                    !selectedPayment ||
                    isPlacingOrder ||
                    (selectedPayment === "upi" &&
                      !upiVerificationResult?.success)
                  }
                  onClick={async () => {
                    if (!user || !selectedAddressId || !selectedPayment) return;
                    const address = addresses.find(
                      (a) => a.id === selectedAddressId,
                    );
                    if (!address) return;

                    try {
                      const placedOrder = await placeOrder(
                        user.id,
                        items,
                        address,
                        selectedPayment,
                        finalTotal,
                      );

                      // Save details for the confirmation screen before clearing
                      setPlacedOrderDetails({
                        id: placedOrder.id,
                        items: [...items],
                        total: finalTotal,
                        paymentMethod: selectedPayment,
                      });

                      clearCart(user.id);
                      setOrderPlaced(true);
                    } catch (error) {
                      console.error("Failed to place order", error);
                      alert("Failed to place order. Please try again.");
                    }
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 sticky top-28">
              <h3 className="text-lg font-medium text-stone-900 mb-6">
                Order Summary
              </h3>

              {/* Items Preview */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="relative w-36 aspect-video bg-stone-100 rounded-lg overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={getProductThumbnail(item)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h4 className="text-sm font-medium text-stone-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-stone-900 mt-1">
                        ₹{(getDiscountedPrice(item) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm text-stone-600 mb-6 pt-6 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{totalPrice > 500 ? "Free" : "₹50.00"}</span>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-base font-medium text-stone-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-medium text-brand-brown">
                    ₹{finalTotal.toFixed(2)}
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
