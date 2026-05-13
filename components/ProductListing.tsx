"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Leaf, Star, ChevronDown } from "lucide-react";
import QuickAddButton from "@/components/QuickAddButton";
import ProductImageCarousel from "@/components/ProductImageCarousel";

import { supabase } from "@/utils/supabase";
import { Product } from "@/lib/data";
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
        console.log("Data successfully fetched from Supabase:", products);

        setProducts(products);
      }
    }

    getProducts();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("default");

  // Extract unique categories
  const categories: string[] = [
    "All",
    ...Array.from(new Set(products.map((p: Product) => p.category))),
  ];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
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
      className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-end mb-14">
        <div>
          <div className="inline-flex items-center gap-3 text-brand-green mb-4">
            <Leaf className="fill-brand-green/15" size={25} />
            <span className="text-xs uppercase tracking-[0.28em] font-bold">
              Curated pantry
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-brown mb-4 leading-tight">
            Our Essentials
          </h2>
        </div>
        <p className="text-stone-600 max-w-2xl lg:ml-auto font-light leading-relaxed lg:text-right">
          The foundation of a wholesome pantry. Each product is carefully
          selected to bring the highest nutritional value to your table.
        </p>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-y border-brand-brown/10 py-5">
        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                selectedCategory === category
                  ? "bg-brand-brown text-white"
                  : "bg-white text-brand-brown border border-brand-brown/10 hover:bg-brand-brown/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative group">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="appearance-none bg-white border border-brand-brown/20 text-brand-brown text-xs font-semibold uppercase tracking-widest py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-brand-brown cursor-pointer"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown pointer-events-none"
            size={16}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
        {filteredProducts.map((product) => {
          const hasDiscount = hasProductDiscount(product);
          const hasHighDiscount = hasHighProductDiscount(product);
          const discountPercent = getDiscountPercent(product);
          const discountedPrice = getDiscountedPrice(product);

          return (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="group flex flex-col bg-white border border-brand-brown/10 p-3 shadow-[0_20px_70px_-55px_rgba(45,36,32,0.55)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_-48px_rgba(45,36,32,0.6)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 mb-6">
                <ProductImageCarousel
                  product={product}
                  imageClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/10 transition-colors duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest font-bold px-3 py-1 text-brand-brown shadow-sm">
                  {product.category}
                </div>
                {hasDiscount && (
                  <div
                    className={`absolute left-3 top-3 text-white shadow-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                      hasHighDiscount
                        ? "bg-brand-gold text-stone-950 ring-2 ring-white/80"
                        : "bg-brand-green"
                    }`}
                  >
                    {hasHighDiscount ? "Mega Deal" : `${discountPercent}% Off`}
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-grow text-center px-2 pb-3">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5 text-brand-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < Math.round(product.rating || 0)
                            ? "fill-brand-gold text-brand-gold"
                            : "text-stone-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {product.rating ? product.rating.toFixed(1) : "0.0"} (
                    {product.review_count || 0})
                  </span>
                </div>
                <h3 className="text-xl font-serif text-stone-900 group-hover:text-brand-brown transition-colors mb-2">
                  {product.name}
                </h3>
                <div className="mb-4 flex flex-col items-center gap-1">
                  {hasDiscount ? (
                    <>
                      <span className="text-sm text-stone-400 line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <span className="text-xl font-bold text-brand-green">
                        ₹{discountedPrice.toFixed(2)}{" "}
                        <span className="text-sm text-stone-400 font-light">
                          / {product.weight}
                        </span>
                      </span>
                    </>
                  ) : (
                    <span className="text-lg text-brand-green">
                      ₹{product.price.toFixed(2)}{" "}
                      <span className="text-sm text-stone-400 font-light">
                        / {product.weight}
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-500 mb-6 line-clamp-2 font-light px-4">
                  {product.description}
                </p>
                <QuickAddButton product={product} />
              </div>
            </Link>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-brand-brown">
          No products found matching your selection.
        </div>
      )}
    </section>
  );
}
