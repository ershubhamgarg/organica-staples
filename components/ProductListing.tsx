"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronDown, Hourglass, Search, X } from "lucide-react";
import QuickAddButton from "@/components/QuickAddButton";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import ScrollReveal from "@/components/ScrollReveal";
import { useProductStore } from "@/store/productStore";

import { isProductAvailable, isProductLowStock, Product } from "@/lib/data";
import {
  getDiscountedPrice,
  getDiscountPercent,
  getUnitPriceInfo,
  hasHighProductDiscount,
  hasProductDiscount,
} from "@/lib/pricing";

type ProductsResponse = {
  products?: Product[];
};

export default function ProductListing() {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      void fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const visibleProducts = useMemo(() => {
    return products.filter((p) => p.isVisible !== false);
  }, [products]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const uniqueCategories = Array.from(
      new Set(visibleProducts.map((p) => p.category)),
    );

    return [
      { name: "All", count: visibleProducts.length },
      ...uniqueCategories.map((name) => ({
        name,
        count: counts[name] || 0,
      })),
    ];
  }, [visibleProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...visibleProducts];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((p) =>
        [p.name, p.name2, p.category, p.origin]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(query)),
      );
    }

    // Custom sorting logic:
    // 1. Available products with images first
    // 2. Available products without images second
    // 3. Unavailable products with images third
    // 4. Unavailable products without images fourth
    result.sort((a, b) => {
      const availA = isProductAvailable(a);
      const availB = isProductAvailable(b);

      const hasImages = (p: Product) => {
        if (p.image && p.image.trim() !== "") return true;
        if (Array.isArray(p.images) && p.images.length > 0) {
          return p.images.some((img) => img && img.trim() !== "");
        }
        if (
          typeof p.images === "string" &&
          p.images.trim() !== "" &&
          p.images !== "[]"
        ) {
          return true;
        }
        return false;
      };

      const imgA = hasImages(a);
      const imgB = hasImages(b);

      // Sort by Availability (Available first)
      if (availA !== availB) {
        return availA ? -1 : 1;
      }

      // Sort by Image presence (Has images first)
      if (imgA !== imgB) {
        return imgA ? -1 : 1;
      }

      // Within the same group, apply user-selected sort order
      if (sortOrder === "price-asc") {
        return getDiscountedPrice(a) - getDiscountedPrice(b);
      } else if (sortOrder === "price-desc") {
        return getDiscountedPrice(b) - getDiscountedPrice(a);
      }

      return 0;
    });

    return result;
  }, [selectedCategory, sortOrder, searchQuery, visibleProducts]);

  return (
    <section
      id="shop"
      className="max-w-[95rem] mx-auto px-4 sm:px-10 py-10 lg:py-14 bg-brand-cream relative"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold/10 indian-border-pattern opacity-30" />

      {/* Premium Header */}
      <div className="text-center mb-12 lg:mb-16 relative">
        <div className="inline-flex items-center gap-3 mb-4 text-brand-green/80">
          <span className="h-[1px] w-8 bg-brand-gold" />
          <span className="uppercase tracking-[0.3em] text-[9px] font-black">
            The ANNVRIKSH Pantry
          </span>
          <span className="h-[1px] w-8 bg-brand-gold" />
        </div>
        <h2 className="text-2xl md:text-4xl font-serif text-brand-brown tracking-tight leading-tight">
          Pure Staples, <br />
          <span className="text-brand-gold italic">Sourced Responsibly.</span>
        </h2>
        <div className="mt-6 flex justify-center">
          <div className="w-16 h-1 bg-brand-gold/20 rounded-full" />
        </div>
      </div>

      <div className="mb-8 lg:mb-10 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-brand-gold"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the pantry — turmeric, dal, besan..."
            className="w-full rounded-full border border-brand-gold/20 bg-white py-3.5 pl-12 pr-11 text-xs text-brand-brown placeholder:text-brand-brown/35 shadow-sm transition-all focus:border-brand-gold focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-brown/30 transition-colors hover:text-brand-brown"
            >
              <X size={15} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center mb-10 lg:mb-14 gap-6">
        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`group relative px-4 py-2 sm:px-5 sm:py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden ${
                selectedCategory === category.name
                  ? "bg-brand-brown text-brand-cream shadow-md"
                  : "bg-brand-cream text-brand-brown border border-brand-gold/15 hover:border-brand-gold/30"
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {category.name}
                <span
                  className={`text-[7px] px-1.5 py-0.5 rounded-full ${
                    selectedCategory === category.name
                      ? "bg-brand-cream/20 text-brand-cream"
                      : "bg-brand-gold/10 text-brand-gold"
                  }`}
                >
                  {category.count}
                </span>
              </span>
              {selectedCategory !== category.name && (
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
      {filteredProducts.length === 0 && searchQuery ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
            <Search size={22} strokeWidth={1.5} />
          </div>
          <p className="font-serif text-lg text-brand-brown">
            No products found for &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="mt-1.5 text-xs font-light text-brand-brown/50">
            Try a different name, or browse by category instead.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-6 rounded-full border border-brand-gold/20 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand-brown transition-colors hover:border-brand-gold/40"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <ScrollReveal
          animation="reveal-fade"
          threshold={0.05}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 min-h-[60vh] transition-all duration-500"
        >
        {filteredProducts.map((product) => {
          const hasDiscount = hasProductDiscount(product);
          const hasHighDiscount = hasHighProductDiscount(product);
          const discountPercent = getDiscountPercent(product);
          const discountedPrice = getDiscountedPrice(product);
          const available = isProductAvailable(product);
          const lowStock = isProductLowStock(product);
          const unitPrice = getUnitPriceInfo(product);

          return (
            <div
              key={product.id}
              className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-brand-gold/10 shadow-lg shadow-brand-brown/5 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-brown/10 hover:border-brand-gold/25 animate-fade-in"
            >
              <Link
                href={`/product/${product.id}`}
                className="block relative group/image"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-brand-sand">
                  <ProductImageCarousel
                    product={product}
                    imageClassName={`object-cover transition-transform duration-700 group-hover:scale-105 ${!available ? "blur-[2px] opacity-60" : ""}`}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />

                  {/* Just Launched Badge */}
                  {product.justLaunched && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-brand-green text-brand-cream px-3 py-1 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg border border-white/20">
                        Just Launched
                      </span>
                    </div>
                  )}

                  {/* Premium Corner Badge for Discount */}
                  {available && hasDiscount && (
                    <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 pointer-events-none">
                      <div
                        className={`absolute top-[12px] right-[-24px] rotate-45 w-24 py-1 text-center text-[7px] font-black uppercase tracking-[0.2em] shadow-lg border-y border-white/20 text-white ${
                          hasHighDiscount
                            ? "bg-brand-terracotta"
                            : "bg-brand-green-fresh"
                        }`}
                      >
                        {hasHighDiscount
                          ? "Special"
                          : `${discountPercent}% Off`}
                      </div>
                    </div>
                  )}

                  {!available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-brown/20 backdrop-blur-[1px]">
                      <span className="bg-brand-cream/90 backdrop-blur-md text-brand-brown px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg border border-brand-gold/10">
                        {product.isLaunchingSoon
                          ? "Launching Soon"
                          : "Available Soon"}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex flex-col flex-grow text-center px-3 sm:px-5 pt-3 sm:pt-5 pb-3 sm:pb-5">
                <div className="flex flex-col items-center mb-1">
                  <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-black text-brand-gold">
                    {product.category}
                    {product.origin && (
                      <details className="group/info relative inline-block">
                        <summary
                          className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 text-[8px] font-black text-brand-gold cursor-pointer list-none normal-case tracking-normal [&::-webkit-details-marker]:hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          i
                        </summary>
                        <div className="absolute left-1/2 top-full z-20 mt-2 w-36 -translate-x-1/2 rounded-xl border border-brand-gold/15 bg-white p-2.5 text-center shadow-xl shadow-brand-brown/10">
                          <p className="text-[7px] font-black uppercase tracking-wider text-brand-brown/40">
                            Sourced From
                          </p>
                          <p className="mt-0.5 font-serif text-[11px] normal-case tracking-normal text-brand-brown">
                            {product.origin}
                          </p>
                        </div>
                      </details>
                    )}
                  </span>
                </div>
                <Link
                  href={`/product/${product.id}`}
                  className="mb-1 sm:mb-2 block"
                >
                  <div className="flex flex-col items-center justify-center min-h-[2.5em] sm:min-h-[3.5em]">
                    <h3 className="text-sm sm:text-xl font-serif text-brand-brown group-hover:text-brand-terracotta transition-colors tracking-tight leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    {product.name2 && (
                      <span className="text-[10px] sm:text-[13px] text-brand-brown/60 font-medium mt-0.5 sm:mt-1 font-devanagari">
                        {product.name2}
                      </span>
                    )}
                  </div>
                </Link>

                <div
                  className={`flex flex-col items-center gap-1 ${available ? "mb-3 sm:mb-4" : "mb-2"}`}
                >
                  <p className="text-[8px] sm:text-[10px] text-brand-gold italic font-medium tracking-wide">
                    {product.weight}
                  </p>

                  {available && (
                    <div className="flex flex-col items-center">
                      {hasDiscount ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-xs sm:text-sm text-brand-brown/40 line-through font-light">
                              ₹{product.price.toFixed(2)}
                            </span>
                            <div className="flex items-baseline gap-1 sm:gap-1.5">
                              <span className="text-base sm:text-2xl font-medium text-brand-brown tracking-tighter">
                                ₹{discountedPrice.toFixed(2)}
                              </span>
                              {unitPrice && (
                                <span className="text-[8px] sm:text-[10px] text-brand-brown/50 font-light">
                                  ({unitPrice})
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-brand-green-fresh mt-1">
                            Save ₹{(product.price - discountedPrice).toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1 sm:gap-1.5">
                          <span className="text-base sm:text-2xl font-medium text-brand-brown tracking-tighter">
                            ₹{product.price.toFixed(2)}
                          </span>
                          {unitPrice && (
                            <span className="text-[8px] sm:text-[10px] text-brand-brown/50 font-light">
                              ({unitPrice})
                            </span>
                          )}
                        </div>
                      )}
                      {product.stock_quantity !== undefined &&
                        product.stock_quantity !== null && (
                          <span
                            className={`text-[7px] sm:text-[8px] uppercase tracking-[0.2em] font-black mt-0.5 sm:mt-1 ${
                              lowStock
                                ? "text-brand-terracotta"
                                : "text-brand-green"
                            }`}
                          >
                            {lowStock ? "Selling Out Soon" : "In Stock"}
                          </span>
                        )}
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <QuickAddButton product={product} className="w-full" />
                </div>

                <div className="flex justify-center items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-brand-gold/5">
                  <div className="flex items-center gap-0.5 text-brand-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={8}
                        className={
                          i < Math.round(product.rating || 0)
                            ? "fill-brand-gold text-brand-gold"
                            : "text-brand-gold/20"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[7px] sm:text-[8px] text-brand-brown/55 uppercase tracking-[0.2em] font-black">
                    {product.review_count || 0} Reviews
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Coming Soon Placeholder */}
        <div className="group flex flex-col bg-jute rounded-2xl sm:rounded-3xl border border-dashed border-brand-gold/15 overflow-hidden transition-all duration-1000 hover:border-brand-gold/30">
          <div className="relative aspect-square w-full overflow-hidden bg-brand-sand/10 flex flex-col items-center justify-center p-6 text-center group-hover:bg-brand-sand/20 transition-all duration-1000">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4 text-brand-gold/40 group-hover:scale-110 group-hover:text-brand-gold/60 transition-all duration-1000">
              <Hourglass size={20} strokeWidth={1.5} />
            </div>
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] font-black text-brand-gold/30 mb-2">
              Growing Soon
            </p>
            <h4 className="font-serif text-sm sm:text-lg text-brand-brown/30 group-hover:text-brand-brown/50 transition-colors duration-1000 leading-tight px-4">
              More healthy products are on the way...
            </h4>
            <div className="mt-4 w-12 h-[1px] bg-brand-gold/10 group-hover:w-20 group-hover:bg-brand-gold/20 transition-all duration-1000" />
          </div>
        </div>
        </ScrollReveal>
      )}
    </section>
  );
}
