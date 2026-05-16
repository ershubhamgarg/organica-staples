"use client";

import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { isProductAvailable, Product } from "@/lib/data";
import { Clock, Plus, Minus } from "lucide-react";

export default function QuickAddButton({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity } = useCartStore();
  const { user } = useUserStore();

  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const available = isProductAvailable(product);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!available) return;
    addToCart(product, 1, user?.id);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1, user?.id);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity - 1, user?.id);
  };

  if (!available) {
    return (
      <div
        aria-label={`${product.name} will be available soon`}
        className="mt-auto inline-flex items-center justify-center gap-2 border border-brand-brown/20 bg-brand-cream/40 px-4 py-2 w-max mx-auto text-brand-brown z-10 relative"
      >
        <Clock size={14} />
        <span className="text-xs uppercase tracking-widest font-bold">
          Available soon
        </span>
      </div>
    );
  }

  if (quantity > 0) {
    return (
      <div
        className="mt-auto flex items-center justify-between w-full max-w-[120px] mx-auto border border-brand-brown/30 rounded-full px-3 py-1 z-10 relative bg-white shadow-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          onClick={handleDecrease}
          className="text-brand-brown hover:text-brand-green transition-colors p-1"
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <span className="text-brand-brown text-sm font-medium w-6 text-center">
          {quantity}
        </span>
        <button
          onClick={handleIncrease}
          className="text-brand-brown hover:text-brand-green transition-colors p-1"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleAdd}
      className="mt-auto border-b border-brand-brown/20 pb-1 w-max mx-auto hover:border-brand-brown transition-colors cursor-pointer z-10 relative group-hover:border-brand-brown"
    >
      <span className="text-brand-brown text-sm uppercase tracking-widest font-medium">
        Quick Add
      </span>
    </div>
  );
}
