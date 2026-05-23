"use client";

import { useUserStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserCircle,
  LogOut,
  ArrowLeft,
  MapPin,
  Trash2,
  Plus,
  Package,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getProductThumbnail } from "@/lib/data";

export default function ProfilePage() {
  const { user, signOut } = useUserStore();
  const { addresses, fetchAddresses, addAddress, removeAddress } =
    useAddressStore();
  const { orders, fetchOrders } = useOrderStore();
  const router = useRouter();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [visibleAddressesCount, setVisibleAddressesCount] = useState(3);
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(3);

  useEffect(() => {
    if (user) {
      fetchAddresses(user.id);
      fetchOrders(user.id);
    }
  }, [user, fetchAddresses, fetchOrders]);

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-cream py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 organic-border translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/5 organic-border-alt -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-[85rem] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 bg-brand-gold" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-gold">
                Member Account
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif text-brand-brown tracking-tight">
              My <span className="italic">Profile</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-brand-brown/60 hover:text-brand-brown transition-all text-[10px] uppercase tracking-[0.2em] font-black"
            >
              <ArrowLeft size={14} /> Back to Shop
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="inline-flex items-center gap-3 text-brand-terracotta hover:text-brand-terracotta/80 transition-all text-[10px] uppercase tracking-[0.2em] font-black border border-brand-terracotta/20 px-6 py-3 rounded-full hover:bg-brand-terracotta/5"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 items-start">
          {/* Left: Profile Info */}
          <div className="bg-white rounded-3xl border border-brand-gold/10 p-10 shadow-2xl shadow-brand-brown/5 text-center">
            <div className="w-32 h-32 rounded-full bg-brand-sand mx-auto mb-8 flex items-center justify-center text-brand-gold shadow-xl shadow-brand-brown/5 relative">
              <UserCircle size={64} strokeWidth={1} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white border-4 border-white">
                <ShieldCheck size={18} />
              </div>
            </div>
            <h2 className="text-2xl font-serif text-brand-brown mb-2 break-all px-4">
              {user.email}
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-brown/40 mb-8">
              Member since{" "}
              {new Date(user.created_at).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="pt-8 border-t border-brand-gold/10 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-serif text-brand-brown">
                  {orders.length}
                </p>
                <p className="text-[8px] uppercase tracking-widest font-black text-brand-brown/40">
                  Orders
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-serif text-brand-brown">
                  {addresses.length}
                </p>
                <p className="text-[8px] uppercase tracking-widest font-black text-brand-brown/40">
                  Addresses
                </p>
              </div>
            </div>
          </div>

          {/* Right: Activities & Addresses */}
          <div className="space-y-12">
            {/* Saved Addresses */}
            <div className="bg-white rounded-3xl border border-brand-gold/10 p-10 md:p-12 shadow-2xl shadow-brand-brown/5">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <MapPin size={24} className="text-brand-gold" />
                  <h3 className="text-3xl font-serif text-brand-brown tracking-tight">
                    Saved <span className="italic">Addresses</span>
                  </h3>
                </div>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="group flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-brand-brown hover:text-brand-gold transition-colors"
                  >
                    <Plus
                      size={16}
                      className="group-hover:rotate-90 transition-transform duration-500"
                    />{" "}
                    Add New
                  </button>
                )}
              </div>

              {showAddForm && (
                <form
                  className="mb-12 bg-brand-cream/50 rounded-3xl border border-brand-gold/10 p-8 animate-fade-in"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (user) {
                      await addAddress(user.id, newAddress);
                      setShowAddForm(false);
                      setNewAddress({
                        name: "",
                        phone: "",
                        address: "",
                        city: "",
                        state: "",
                        zipCode: "",
                      });
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                        Address Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, name: e.target.value })
                        }
                        className="w-full bg-transparent border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light"
                        placeholder="Home / Work"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                        Phone Number
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
                        className="w-full bg-transparent border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light"
                        placeholder="+91"
                      />
                    </div>
                  </div>
                  <div className="mb-8">
                    <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                      Street Address
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
                      className="w-full bg-transparent border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light"
                      placeholder="Street, Building, House No."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light"
                      placeholder="State"
                    />
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
                      className="w-full bg-transparent border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light"
                      placeholder="Pin Code"
                    />
                  </div>
                  <div className="flex gap-6">
                    <button
                      type="submit"
                      className="flex-1 bg-brand-brown text-brand-cream py-4 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-8 py-4 text-[10px] uppercase tracking-widest font-black text-brand-brown/40 hover:text-brand-brown transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.slice(0, visibleAddressesCount).map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-brand-cream/30 rounded-3xl border border-brand-gold/10 p-8 flex flex-col justify-between group hover:bg-brand-cream hover:border-brand-gold/30 transition-all duration-500"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-serif text-brand-brown tracking-tight">
                            {addr.name}
                          </h4>
                          <button
                            onClick={() => removeAddress(addr.id)}
                            className="text-brand-brown/20 hover:text-brand-terracotta transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="text-xs font-light text-brand-brown/60 leading-relaxed mb-1">
                          {addr.address}
                        </p>
                        <p className="text-xs font-light text-brand-brown/60 leading-relaxed">
                          {addr.city}, {addr.state} - {addr.zipCode}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold tracking-widest text-brand-gold mt-6 uppercase">
                        {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-brand-gold/10 rounded-3xl">
                  <p className="text-brand-brown/40 font-light italic">
                    No addresses saved yet.
                  </p>
                </div>
              )}

              {addresses.length > visibleAddressesCount && (
                <button
                  onClick={() => setVisibleAddressesCount(addresses.length)}
                  className="mt-10 w-full py-4 text-[10px] uppercase tracking-widest font-black text-brand-gold border-t border-brand-gold/10 hover:text-brand-brown transition-colors"
                >
                  View All Addresses
                </button>
              )}
            </div>

            {/* Order History */}
            <div className="bg-white rounded-3xl border border-brand-gold/10 p-10 md:p-12 shadow-2xl shadow-brand-brown/5">
              <div className="flex items-center gap-4 mb-10">
                <Package size={24} className="text-brand-gold" />
                <h3 className="text-3xl font-serif text-brand-brown tracking-tight">
                  Order <span className="italic">History</span>
                </h3>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-8">
                  {orders.slice(0, visibleOrdersCount).map((order) => (
                    <div
                      key={order.id}
                      className="bg-brand-cream/30 rounded-3xl border border-brand-gold/5 p-8 group hover:bg-brand-cream hover:border-brand-gold/20 transition-all duration-500"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-brand-gold/10">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-gold mb-2">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs font-light text-brand-brown/60">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[8px] uppercase tracking-widest font-black border ${
                              order.status === "delivered"
                                ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                                : order.status === "cancelled"
                                  ? "bg-brand-terracotta/10 text-brand-terracotta border-brand-terracotta/20"
                                  : "bg-brand-gold/10 text-brand-gold border-brand-gold/20"
                            }`}
                          >
                            {order.status}
                          </span>
                          <p className="text-xl font-medium text-brand-brown tracking-tighter">
                            ₹{order.total_amount.toFixed(0)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                        <div className="flex flex-col gap-6 flex-1">
                          <div className="space-y-4">
                            {order.items.map((item, idx) => (
                              <Link
                                key={idx}
                                href={`/product/${item.id}`}
                                className="flex items-center gap-4 group/item hover:bg-brand-brown/[0.02] p-2 -m-2 rounded-2xl transition-all"
                              >
                                <div className="relative shrink-0 w-16 aspect-square rounded-xl bg-brand-sand overflow-hidden shadow-sm group-hover/item:shadow-md transition-shadow">
                                  <ImageWithFallback
                                    src={getProductThumbnail(item)}
                                    alt={item.name}
                                    fill
                                    className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-serif text-brand-brown truncate group-hover/item:text-brand-terracotta transition-colors">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] text-brand-gold italic font-medium tracking-wide">
                                      {item.weight}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-brand-gold/30" />
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-brown/40">
                                      Qty: {item.quantity}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-brand-gold/30" />
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-gold">
                                      ₹{(item.price * item.quantity).toFixed(0)}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight
                                  size={14}
                                  className="text-brand-gold/40 group-hover/item:text-brand-gold transition-colors group-hover/item:translate-x-1 transition-transform"
                                />
                              </Link>
                            ))}
                          </div>

                          {/* Order Summary Breakdown */}
                          <div className="bg-brand-brown/[0.02] border border-brand-gold/5 rounded-2xl p-6 space-y-3">
                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                              <span className="text-brand-brown/40 font-bold">
                                Items Subtotal
                              </span>
                              <span className="text-brand-brown font-black">
                                ₹{(order.subtotal_amount || 0).toFixed(0)}
                              </span>
                            </div>

                            {order.discount_amount &&
                              order.discount_amount > 0 && (
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                  <span className="text-brand-green-fresh font-bold italic">
                                    Discount
                                    {order.discount_code
                                      ? ` (${order.discount_code})`
                                      : ""}
                                  </span>
                                  <span className="text-brand-green-fresh font-black">
                                    -₹{order.discount_amount.toFixed(0)}
                                  </span>
                                </div>
                              )}

                            {order.shipping_amount !== undefined &&
                              order.shipping_amount !== null &&
                              order.shipping_amount > 0 && (
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                  <span className="text-brand-brown/40 font-bold">
                                    Shipping
                                  </span>
                                  <span className="text-brand-brown font-black">
                                    ₹{order.shipping_amount.toFixed(0)}
                                  </span>
                                </div>
                              )}

                            {order.convenience_fee_amount !== undefined &&
                              order.convenience_fee_amount !== null &&
                              order.convenience_fee_amount > 0 && (
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                  <span className="text-brand-brown/40 font-bold">
                                    Convenience Fee
                                  </span>
                                  <span className="text-brand-brown font-black">
                                    ₹{order.convenience_fee_amount.toFixed(0)}
                                  </span>
                                </div>
                              )}

                            <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.2em] pt-3 border-t border-brand-gold/10">
                              <span className="text-brand-brown font-black">
                                Total Paid
                              </span>
                              <span className="text-brand-brown font-black text-lg tracking-tighter">
                                ₹{order.total_amount.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {order.payment_method === "razorpay" &&
                          order.payment_details && (
                            <div className="md:w-72 bg-white/50 border border-brand-gold/15 rounded-3xl p-6 shrink-0 shadow-sm">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                                  <ShieldCheck size={16} />
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-brown/60">
                                  Verified Payment
                                </p>
                              </div>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] uppercase tracking-widest text-brand-brown/40 font-bold">
                                    Provider
                                  </span>
                                  <span className="text-[10px] uppercase tracking-widest text-brand-brown font-black">
                                    Razorpay
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] uppercase tracking-widest text-brand-brown/40 font-bold">
                                    Payment ID
                                  </span>
                                  <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/5 px-2 py-1 rounded">
                                    {order.payment_details.provider_payment_id.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] uppercase tracking-widest text-brand-brown/40 font-bold">
                                    Method
                                  </span>
                                  <span className="text-[10px] uppercase tracking-widest text-brand-brown font-black">
                                    {order.payment_details.method ||
                                      "UPI / Card"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] uppercase tracking-widest text-brand-brown/40 font-bold">
                                    Status
                                  </span>
                                  <span className="text-[9px] uppercase tracking-widest text-brand-green font-black flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                                    {order.payment_details.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center border-2 border-dashed border-brand-gold/10 rounded-3xl flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-brand-gold/5 rounded-full flex items-center justify-center text-brand-gold/20">
                    <ShoppingBag size={32} strokeWidth={1} />
                  </div>
                  <p className="text-brand-brown/40 font-light italic">
                    You haven&apos;t placed any orders yet.
                  </p>
                  <Link
                    href="/#shop"
                    className="inline-flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-brand-gold hover:text-brand-brown transition-colors"
                  >
                    Explore Shop <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {orders.length > visibleOrdersCount && (
                <button
                  onClick={() => setVisibleOrdersCount(orders.length)}
                  className="mt-10 w-full py-4 text-[10px] uppercase tracking-widest font-black text-brand-gold border-t border-brand-gold/10 hover:text-brand-brown transition-colors"
                >
                  View All Orders
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
