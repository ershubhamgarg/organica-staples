"use client";

import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  Leaf,
  Minus,
  Plus,
} from "lucide-react";
import { useState, use } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = useProductStore((state) => state.getProduct(id));
  const { addToCart } = useCartStore();
  const { user } = useUserStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, user?.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/#shop"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="relative aspect-square md:aspect-auto md:h-full bg-stone-100">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Product Details */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full mb-4">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">
                {product.name}
              </h1>
              <p className="text-2xl text-stone-800 font-light mb-6">
                ₹{product.price.toFixed(2)}
              </p>

              <div className="prose prose-stone mb-8">
                <p className="text-stone-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="border border-stone-200 rounded-lg p-4 flex items-start gap-3">
                  <Leaf className="text-emerald-600 shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                      Origin
                    </h4>
                    <p className="text-sm text-stone-900 font-medium">
                      {product.origin}
                    </p>
                  </div>
                </div>
                <div className="border border-stone-200 rounded-lg p-4 flex items-start gap-3">
                  <ShieldCheck
                    className="text-emerald-600 shrink-0"
                    size={20}
                  />
                  <div>
                    <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                      Weight
                    </h4>
                    <p className="text-sm text-stone-900 font-medium">
                      {product.weight}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-medium text-stone-900 mb-3">
                  Key Benefits
                </h4>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-stone-600"
                    >
                      <Check className="text-emerald-600" size={16} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-8 border-t border-stone-100 flex flex-col gap-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 h-12 flex-shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-l-xl transition-colors h-full flex items-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-sm font-medium text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-r-xl transition-colors h-full flex items-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 h-12 ${
                      added
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={18} /> Added to Cart
                      </>
                    ) : (
                      "Add to Cart"
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
                  <Truck size={14} /> Free shipping on orders over ₹500
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
