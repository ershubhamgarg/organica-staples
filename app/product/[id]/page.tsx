"use client";

import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  Leaf,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import { useEffect, useState, use } from "react";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { Product } from "@/lib/data";
import {
  getDiscountedPrice,
  getDiscountPercent,
  hasHighProductDiscount,
  hasProductDiscount,
} from "@/lib/pricing";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const fetchProductById = useProductStore((state) => state.fetchProductById);
  const isLoading = useProductStore((state) => state.isLoading);
  const error = useProductStore((state) => state.error);
  const [product, setProduct] = useState<Product | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { addToCart } = useCartStore();
  const { user } = useUserStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let isActive = true;

    fetchProductById(id).then((fetchedProduct) => {
      if (isActive) {
        setProduct(fetchedProduct);
        setHasFetched(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, [fetchProductById, id]);

  if ((!hasFetched || isLoading) && !product) {
    return (
      <div className="min-h-screen bg-brand-cream pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-stone-500">
          Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-cream pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/#shop"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-green transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Shop
          </Link>
          <div className="bg-white rounded-3xl shadow-sm border border-brand-cream p-12 text-center">
            <h1 className="text-2xl font-serif text-stone-900 mb-2">
              Product not found
            </h1>
            <p className="text-stone-500">
              {error || "This product is unavailable."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = hasProductDiscount(product);
  const hasHighDiscount = hasHighProductDiscount(product);
  const discountPercent = getDiscountPercent(product);
  const discountedPrice = getDiscountedPrice(product);

  const handleAddToCart = () => {
    addToCart(product, quantity, user?.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-cream pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/#shop"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-green transition-colors mb-12 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Image - Left Column */}
          <div className="space-y-6">
            <div className="relative aspect-video bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-cream">
              <ProductImageCarousel
                product={product}
                imageClassName="object-cover transition-transform duration-700"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {hasDiscount && (
                <div
                  className={`absolute left-6 top-6 shadow-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${hasHighDiscount
                      ? "bg-brand-gold text-stone-950 ring-2 ring-white"
                      : "bg-brand-green text-white"
                    }`}
                >
                  {hasHighDiscount ? "Mega Deal" : `${discountPercent}% Off`}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-brand-cream p-6">
              <h4 className="text-sm font-medium text-stone-900 mb-4 flex items-center gap-2">
                <Check className="text-brand-green" size={18} />
                Key Benefits
              </h4>
              <ul className="space-y-2">
                {(product.benefits || []).map((benefit, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm text-stone-600"
                  >
                    <div className="w-2 h-2 bg-brand-green rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Details - Right Column */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-brand-cream text-brand-brown text-xs font-medium rounded-full mb-3 uppercase tracking-widest">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-3 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-brand-gold text-brand-gold"
                  />
                ))}
              </div>

              <div className="mb-5">
                {hasDiscount ? (
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-lg text-stone-400 line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-3xl font-bold text-brand-green">
                      ₹{discountedPrice.toFixed(2)}
                    </span>
                    <span className="bg-brand-cream px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown rounded-full">
                      Save {discountPercent}%
                    </span>
                  </div>
                ) : (
                  <p className="text-2xl font-light text-stone-800">
                    ₹{product.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-stone-600 leading-relaxed text-base">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-2xl border border-brand-cream p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-cream flex items-center justify-center text-brand-green rounded-full">
                  <Leaf size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-medium text-stone-500 uppercase tracking-wider mb-0.5">
                    Origin
                  </h4>
                  <p className="text-sm text-stone-900 font-medium">
                    {product.origin}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-brand-cream p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-cream flex items-center justify-center text-brand-green rounded-full">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-medium text-stone-500 uppercase tracking-wider mb-0.5">
                    Weight
                  </h4>
                  <p className="text-sm text-stone-900 font-medium">
                    {product.weight}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-brand-brown/20 rounded-2xl bg-white h-12 flex-shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-stone-500 hover:text-brand-green hover:bg-brand-cream rounded-l-2xl transition-all h-full flex items-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-14 text-center text-base font-medium text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 text-stone-500 hover:text-brand-green hover:bg-brand-cream rounded-r-2xl transition-all h-full flex items-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 font-medium py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 h-12 text-sm ${added
                        ? "bg-brand-cream text-brand-brown"
                        : "bg-brand-brown hover:bg-brand-brown-light text-white shadow-lg hover:shadow-xl"
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

                <div className="flex items-center justify-center gap-2 text-xs text-stone-500 bg-white rounded-2xl py-3 border border-brand-cream">
                  <Truck size={16} className="text-brand-green" /> Free shipping
                  on orders over ₹500
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
