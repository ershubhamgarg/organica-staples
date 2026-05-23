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
  const hasReachedStockLimit =
    typeof product.stock_quantity === "number" &&
    quantity >= product.stock_quantity;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!available) return;
    addToCart(product, 1, user?.id);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasReachedStockLimit) return;
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
        className={`inline-flex items-center justify-center gap-2 border border-brand-gold/10 bg-brand-cream/40 px-4 py-3 sm:px-6 sm:py-4 rounded-full text-brand-brown/40 z-10 relative cursor-not-allowed ${className}`}
      >
        <Clock size={14} />
        <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black">
          Available Soon
        </span>
      </div>
    );
  }

  if (quantity > 0) {
    return (
      <div
        className={`flex items-center justify-between w-full max-w-[160px] mx-auto border border-brand-brown/20 rounded-full px-3 py-2 sm:px-5 sm:py-3.5 z-10 relative bg-white shadow-xl shadow-brand-brown/5 ${className}`}
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
        <span className="text-brand-brown text-[12px] font-black w-8 text-center">
          {quantity}
        </span>
        <button
          onClick={handleIncrease}
          disabled={hasReachedStockLimit}
          className="text-brand-brown hover:text-brand-green transition-all p-1 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-25"
          aria-label={
            hasReachedStockLimit
              ? `${product.name} stock limit reached`
              : "Increase quantity"
          }
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`group relative inline-flex items-center justify-center gap-2 sm:gap-3 overflow-hidden bg-brand-cream border border-brand-brown/20 text-brand-brown px-4 py-3 sm:px-6 sm:py-4 rounded-full transition-all duration-500 hover:border-brand-brown hover:translate-y-[-2px] shadow-sm hover:shadow-xl hover:shadow-brand-brown/5 ${className}`}
    >
      <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black group-hover:text-brand-cream transition-colors duration-500">
        <ShoppingBag size={14} strokeWidth={2.5} />
        Add to Cart
      </span>
      <div className="absolute inset-0 bg-brand-brown translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
    </button>
  );
}
