"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronDown } from "lucide-react";
import QuickAddButton from "@/components/QuickAddButton";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import ScrollReveal from "@/components/ScrollReveal";

import { supabase } from "@/utils/supabase";
import { isProductAvailable, Product } from "@/lib/data";
import {
  getDiscountedPrice,
  getDiscountPercent,
  getUnitPriceInfo,
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

  const visibleProducts = useMemo(() => {
    return products.filter((p) => p.isVisible !== false);
  }, [products]);

  const categories: string[] = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(visibleProducts.map((p: Product) => p.category))),
    ];
  }, [visibleProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...visibleProducts];

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
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-green/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <ScrollReveal className="relative flex flex-col items-center text-center mb-16">
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
      </ScrollReveal>

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
      <ScrollReveal
        animation="reveal-fade"
        threshold={0.05}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 min-h-[60vh] transition-all duration-500"
      >
        {filteredProducts.map((product) => {
          const hasDiscount = hasProductDiscount(product);
          const hasHighDiscount = hasHighProductDiscount(product);
          const discountPercent = getDiscountPercent(product);
          const discountedPrice = getDiscountedPrice(product);
          const available = isProductAvailable(product);
          const unitPrice = getUnitPriceInfo(product);

          return (
            <div
              key={product.id}
              className="group flex flex-col animate-fade-in"
            >
              <Link
                href={`/product/${product.id}`}
                className="block relative mb-6 group/image"
              >
                {/* Decorative Organic Outline */}
                <div className="absolute -inset-2 border border-brand-gold/15 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] group-hover/image:scale-105 group-hover/image:border-brand-gold/30 transition-all duration-700 pointer-events-none" />
                <div className="absolute -inset-1.5 border border-brand-green/5 rounded-[50%_50%_30%_70%/50%_50%_70%_30%] group-hover/image:scale-105 group-hover/image:border-brand-green/10 transition-all duration-700 pointer-events-none delay-100" />

                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-sand transition-all duration-700 group-hover:shadow-[0_30px_60px_-15px_rgba(60,54,42,0.2)]">
                  <ProductImageCarousel
                    product={product}
                    imageClassName="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />

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
                            : "bg-brand-green-fresh"
                        }`}
                      >
                        {hasHighDiscount
                          ? "Exclusive"
                          : `${discountPercent}% Off`}
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              <div className="flex flex-col flex-grow text-center px-4">
                <Link href={`/product/${product.id}`} className="mb-2">
                  <h3 className="text-xl font-serif text-brand-brown group-hover:text-brand-terracotta transition-colors tracking-tight leading-[1.1] line-clamp-2 min-h-[2.2em] flex items-center justify-center">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex flex-col items-center gap-1.5 mb-6">
                  <p className="text-[10px] text-brand-gold italic font-medium tracking-wide">
                    {product.weight}
                  </p>

                  {!available ? (
                    <div className="h-8" />
                  ) : (
                    <div className="flex flex-col items-center">
                      {hasDiscount ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-brand-brown/20 line-through font-light">
                              ₹{product.price.toFixed(0)}
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-medium text-brand-brown tracking-tighter">
                                ₹{discountedPrice.toFixed(0)}
                              </span>
                              {unitPrice && (
                                <span className="text-[10px] text-brand-brown/30 font-light">
                                  ({unitPrice})
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-brand-green-fresh mt-1">
                            Save ₹{(product.price - discountedPrice).toFixed(0)}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-medium text-brand-brown tracking-tighter">
                            ₹{product.price.toFixed(0)}
                          </span>
                          {unitPrice && (
                            <span className="text-[10px] text-brand-brown/30 font-light">
                              ({unitPrice})
                            </span>
                          )}
                        </div>
                      )}
                      {product.stock_quantity !== undefined &&
                        product.stock_quantity !== null && (
                          <span className="text-[7px] uppercase tracking-[0.2em] font-black text-brand-green/40 mt-1">
                            {product.stock_quantity} units left
                          </span>
                        )}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-2">
                  <QuickAddButton product={product} className="w-full" />
                </div>

                <div className="flex justify-center items-center gap-3 mt-4">
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
                  <span className="text-[8px] text-brand-brown/30 uppercase tracking-[0.2em] font-black">
                    {product.review_count || 0} Reviews
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </ScrollReveal>
    </section>
  );
}
