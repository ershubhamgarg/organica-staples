"use client";

import { useUserStore } from "@/store/userStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircle, ShoppingBag, LogOut, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, signOut } = useUserStore();
  const { items } = useCartStore();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors mb-8 text-sm font-medium">
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
            <div className="bg-stone-50 rounded-xl p-6">
              <h2 className="text-lg font-serif text-stone-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} />
                Cart Summary
              </h2>
              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-stone-700">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="border-t border-stone-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-stone-900">Total</p>
                      <p className="text-base font-bold text-brand-brown">
                        ₹{items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-stone-500 text-sm">Your cart is empty</p>
              )}
            </div>

            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
