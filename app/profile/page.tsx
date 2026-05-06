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
} from "lucide-react";
import { useState, useEffect } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";

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
    <div className="min-h-screen bg-stone-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-100">
            <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green">
              <UserCircle size={48} />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-stone-900">
                {user.email}
              </h1>
              <p className="text-stone-500 text-sm">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Addresses Section */}
            <div className="bg-stone-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-serif text-stone-900 flex items-center gap-2">
                  <MapPin size={20} />
                  Saved Addresses
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                  >
                    <Plus size={16} /> Add New
                  </button>
                )}
              </div>

              {showAddForm && (
                <form
                  className="mb-6 bg-white p-4 rounded-xl border border-stone-200"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
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
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Address (House No, Building, Street, Area)
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
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
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
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.slice(0, visibleAddressesCount).map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white p-4 rounded-xl border border-stone-200 flex justify-between items-start"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-stone-900">
                            {addr.name}
                          </span>
                          <span className="text-xs text-stone-500">
                            {addr.phone}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600">{addr.address}</p>
                        <p className="text-sm text-stone-600">
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                      </div>
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove address"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {visibleAddressesCount < addresses.length && (
                    <button
                      onClick={() =>
                        setVisibleAddressesCount((prev) => prev + 3)
                      }
                      className="w-full py-2 mt-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Show More Addresses
                    </button>
                  )}
                </div>
              ) : (
                !showAddForm && (
                  <p className="text-stone-500 text-sm">
                    No saved addresses yet.
                  </p>
                )
              )}
            </div>

            {/* My Orders Section */}
            <div className="bg-stone-50 rounded-xl p-6">
              <h2 className="text-lg font-serif text-stone-900 flex items-center gap-2 mb-6">
                <Package size={20} />
                My Orders
              </h2>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, visibleOrdersCount).map((order) => (
                    <div
                      key={order.id}
                      className="bg-white p-6 rounded-xl border border-stone-200"
                    >
                      <div className="flex flex-wrap gap-4 justify-between items-start mb-4 pb-4 border-b border-stone-100">
                        <div>
                          <p className="text-xs text-stone-500 mb-1">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm font-medium text-stone-900">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-2 ${
                              order.status === "delivered"
                                ? "bg-emerald-100 text-emerald-700"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {order.status}
                          </span>
                          <p className="text-sm font-bold text-stone-900">
                            ₹{order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="relative w-12 h-12 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-stone-900 line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-xs text-stone-500">
                                Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-stone-500 flex justify-between">
                        <span>
                          Paid via: {order.payment_method.toUpperCase()}
                        </span>
                        <span className="truncate max-w-[200px] text-right">
                          Delivered to: {order.delivery_address.name},{" "}
                          {order.delivery_address.city}
                        </span>
                      </div>
                    </div>
                  ))}

                  {visibleOrdersCount < orders.length && (
                    <button
                      onClick={() => setVisibleOrdersCount((prev) => prev + 3)}
                      className="w-full py-3 mt-4 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      Show More Orders
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                  <p className="text-stone-500 text-sm">
                    You haven't placed any orders yet.
                  </p>
                  <Link
                    href="/#shop"
                    className="text-emerald-700 font-medium text-sm hover:underline mt-2 inline-block"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
