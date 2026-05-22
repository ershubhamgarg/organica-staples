"use client";

import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { isProductAvailable, Product } from "@/lib/data";
import { Clock, Plus, Minus, ShoppingBag } from "lucide-react";

interface QuickAddButtonProps {
  product: Product;
  className?: string;
}

export default function QuickAddButton({
  product,
  className,
}: QuickAddButtonProps) {
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
        className={`inline-flex items-center justify-center gap-2 border border-brand-gold/20 bg-brand-cream/40 px-6 py-3 rounded-full text-brand-brown/40 z-10 relative cursor-not-allowed ${className}`}
      >
        <Clock size={14} />
        <span className="text-[10px] uppercase tracking-[0.2em] font-black">
          Available Soon
        </span>
      </div>
    );
  }

  if (quantity > 0) {
    return (
      <div
        className={`flex items-center justify-between w-full max-w-[140px] mx-auto border border-brand-brown rounded-full px-4 py-3 z-10 relative bg-brand-cream shadow-xl shadow-brand-brown/5 ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          onClick={handleDecrease}
          className="text-brand-brown hover:text-brand-terracotta transition-all p-1 hover:scale-110"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        <span className="text-brand-brown text-sm font-black w-6 text-center">
          {quantity}
        </span>
        <button
          onClick={handleIncrease}
          className="text-brand-brown hover:text-brand-green transition-all p-1 hover:scale-110"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-brand-brown text-brand-cream px-6 py-3 rounded-full transition-all duration-500 hover:translate-y-[-2px] shadow-lg hover:shadow-brand-brown/20 ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        <ShoppingBag size={14} strokeWidth={2.5} />
        Add to Cart
      </span>
      <div className="absolute inset-0 bg-brand-green translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
    </button>
  );
}
