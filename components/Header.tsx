"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold text-emerald-800 tracking-tight">
          Organica <span className="text-stone-400 font-light">Staples</span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link href="/#shop" className="text-stone-600 hover:text-emerald-700 transition-colors text-sm font-medium">Shop</Link>
          <Link href="#" className="text-stone-600 hover:text-emerald-700 transition-colors text-sm font-medium">Our Story</Link>
          <Link href="#" className="text-stone-600 hover:text-emerald-700 transition-colors text-sm font-medium">Journal</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-stone-600 hover:text-emerald-700 p-2 relative flex items-center justify-center">
            <ShoppingCart size={24} />
            {mounted && totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}