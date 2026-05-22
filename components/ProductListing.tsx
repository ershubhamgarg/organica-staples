"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronDown } from "lucide-react";
import QuickAddButton from "@/components/QuickAddButton";
import ProductImageCarousel from "@/components/ProductImageCarousel";

import { supabase } from "@/utils/supabase";
import { isProductAvailable, Product } from "@/lib/data";
import {
  getDiscountedPrice,
  getDiscountPercent,
  hasHighProductDiscount,
  hasProductDiscount,
} from "@/lib/pricing";

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function getProducts() {
      const { data: products } = await supabase.from("products").select("*");

      if (products) {
        setProducts(products);
      }
    }

    getProducts();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("default");

  const categories: string[] = [
    "All",
    ...Array.from(new Set(products.map((p: Product) => p.category))),
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (sortOrder === "price-asc") {
      result.sort((a, b) => getDiscountedPrice(a) - getDiscountedPrice(b));
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => getDiscountedPrice(b) - getDiscountedPrice(a));
    }

    return result;
  }, [selectedCategory, sortOrder, products]);

  return (
    <section
      id="shop"
      className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-gold/5 organic-border -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-green/5 organic-border-alt translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-4 mb-4">
          <span className="h-[1px] w-8 bg-brand-gold" />
          <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-gold">
            Purely Curated
          </span>
          <span className="h-[1px] w-8 bg-brand-gold" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-brand-brown mb-4 tracking-tight">
          Our <span className="italic text-brand-terracotta">Organic</span>{" "}
          Collection
        </h2>
        <p className="text-brand-brown/60 max-w-lg mx-auto font-light leading-relaxed text-base text-balance">
          A selection of India&apos;s finest staples, harvested with respect for
          the earth and delivered with uncompromising purity.
        </p>
      </div>

      {/* Filters & Sorting */}
      <div className="relative flex flex-col lg:flex-row justify-between items-center mb-20 gap-8">
        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`group relative px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden ${
                selectedCategory === category
                  ? "bg-brand-brown text-brand-cream shadow-xl shadow-brand-brown/20"
                  : "bg-brand-cream text-brand-brown border border-brand-gold/20 hover:border-brand-gold/40"
              }`}
            >
              <span className="relative z-10">{category}</span>
              {selectedCategory !== category && (
                <div className="absolute inset-0 bg-brand-gold/5 translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
              )}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[240px]">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full appearance-none bg-brand-cream border border-brand-gold/20 text-brand-brown text-[10px] font-bold uppercase tracking-[0.2em] py-4 pl-6 pr-12 rounded-full focus:outline-none focus:border-brand-gold transition-all cursor-pointer shadow-sm"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <ChevronDown
            className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-gold pointer-events-none"
            size={14}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
        {filteredProducts.map((product) => {
          const hasDiscount = hasProductDiscount(product);
          const hasHighDiscount = hasHighProductDiscount(product);
          const discountPercent = getDiscountPercent(product);
          const discountedPrice = getDiscountedPrice(product);
          const available = isProductAvailable(product);

          return (
            <div key={product.id} className="group flex flex-col">
              <Link
                href={`/product/${product.id}`}
                className="block relative mb-6"
              >
                <div className="relative aspect-square w-full overflow-hidden organic-border bg-brand-sand transition-all duration-700 group-hover:shadow-[0_30px_60px_-15px_rgba(60,54,42,0.2)]">
                  <ProductImageCarousel
                    product={product}
                    imageClassName="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/10 transition-colors duration-700" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-brand-cream/90 backdrop-blur-md text-[8px] uppercase tracking-[0.2em] font-black px-3 py-1.5 text-brand-brown rounded-full shadow-lg border border-brand-gold/10">
                      {product.category}
                    </div>
                    {available && hasDiscount && (
                      <div
                        className={`text-[8px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 text-white ${
                          hasHighDiscount
                            ? "bg-brand-terracotta"
                            : "bg-brand-green"
                        }`}
                      >
                        {hasHighDiscount
                          ? "Exclusive"
                          : `${discountPercent}% Off`}
                      </div>
                    )}
                  </div>

                  {!available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-brown/40 backdrop-blur-[2px]">
                      <span className="bg-brand-cream text-brand-brown px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl">
                        Available Soon
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex flex-col flex-grow text-center px-4">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5 text-brand-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={
                          i < Math.round(product.rating || 0)
                            ? "fill-brand-gold text-brand-gold"
                            : "text-brand-gold/20"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-brand-brown/40 uppercase tracking-widest font-bold">
                    {product.review_count || 0} Reviews
                  </span>
                </div>

                <Link href={`/product/${product.id}`}>
                  <h3 className="text-lg font-serif text-brand-brown group-hover:text-brand-terracotta transition-colors mb-0.5 tracking-tight">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-[10px] text-brand-brown/40 uppercase tracking-widest font-bold mb-2">
                  {product.weight}
                </p>

                <div className="mb-4 flex flex-col items-center gap-1">
                  {!available ? (
                    <div className="h-6" /> // Placeholder to keep spacing
                  ) : (
                    <>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-brand-brown/40 line-through font-light">
                            ₹{product.price.toFixed(0)}
                          </span>
                          <span className="text-lg text-brand-brown font-medium">
                            ₹{discountedPrice.toFixed(0)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg text-brand-brown font-medium">
                          ₹{product.price.toFixed(0)}
                        </span>
                      )}
                      {product.stock_quantity !== undefined &&
                        product.stock_quantity !== null && (
                          <span className="text-[8px] uppercase tracking-widest font-black text-brand-green/60">
                            {product.stock_quantity} units available
                          </span>
                        )}
                    </>
                  )}
                </div>

                <div className="mt-auto pt-2">
                  <QuickAddButton
                    product={product}
                    className="w-full bg-brand-cream hover:bg-brand-brown text-brand-brown hover:text-brand-cream border border-brand-brown py-4 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 hover:shadow-2xl hover:translate-y-[-2px]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
