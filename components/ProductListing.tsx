"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronDown, Hourglass } from "lucide-react";
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

  const visibleProducts = useMemo(() => {
    return products.filter(
      (p) => p.isVisible !== false && p.launch_status !== "launching_soon",
    );
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
  }, [selectedCategory, sortOrder, visibleProducts]);

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
            The Urban Kisan Pantry
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
      <ScrollReveal
        animation="reveal-fade"
        threshold={0.05}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12 min-h-[60vh] transition-all duration-500"
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
              className="group flex flex-col animate-fade-in"
            >
              <Link
                href={`/product/${product.id}`}
                className="block relative mb-3 sm:mb-6 group/image"
              >
                {/* Decorative Organic Outline */}
                <div className="absolute -inset-1 sm:-inset-2 border border-brand-gold/15 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] group-hover/image:scale-105 group-hover/image:border-brand-gold/30 transition-all duration-700 pointer-events-none" />
                <div className="absolute -inset-0.5 sm:-inset-1.5 border border-brand-green/5 rounded-[50%_50%_30%_70%/50%_50%_70%_30%] group-hover/image:scale-105 group-hover/image:border-brand-green/10 transition-all duration-700 pointer-events-none delay-100" />

                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-sand transition-all duration-700 group-hover:shadow-[0_30px_60px_-15px_rgba(60,54,42,0.2)]">
                  <ProductImageCarousel
                    product={product}
                    imageClassName={`object-cover transition-transform duration-1000 group-hover:scale-110 ${!available ? "blur-[2px] opacity-60" : ""}`}
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

              <div className="flex flex-col flex-grow text-center px-1 sm:px-4">
                <div className="flex flex-col items-center mb-1">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-black text-brand-gold/50">
                    {product.category}
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
                  className={`flex flex-col items-center gap-1 ${available ? "mb-4 sm:mb-6" : "mb-2"}`}
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
                            className={`text-[6px] sm:text-[7px] uppercase tracking-[0.2em] font-black mt-0.5 sm:mt-1 ${
                              lowStock
                                ? "text-brand-terracotta"
                                : "text-brand-green/60"
                            }`}
                          >
                            {lowStock ? "Selling Out Soon" : "In Stock"}
                          </span>
                        )}
                    </div>
                  )}
                </div>

                <div className={`${available ? "mt-auto" : ""} pt-2`}>
                  <QuickAddButton product={product} className="w-full" />
                </div>

                <div className="flex justify-center items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
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
                  <span className="text-[7px] sm:text-[8px] text-brand-brown/30 uppercase tracking-[0.2em] font-black">
                    {product.review_count || 0} Reviews
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Coming Soon Placeholder */}
        <div className="group flex flex-col animate-fade-in">
          <div className="block relative mb-3 sm:mb-6">
            <div className="absolute -inset-1 sm:-inset-2 border border-brand-gold/15 organic-border-alt pointer-events-none opacity-50" />
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-sand/10 flex flex-col items-center justify-center p-6 text-center group-hover:bg-brand-sand/30 transition-all duration-1000 border border-brand-gold/5 bg-jute">
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
        </div>
      </ScrollReveal>
    </section>
  );
}
