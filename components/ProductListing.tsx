"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Leaf, Star, ChevronDown } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import QuickAddButton from "@/components/QuickAddButton";
import { products, Product } from "@/lib/data";

export default function ProductListing() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("default");
  
  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sort
    if (sortOrder === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, sortOrder]);

  return (
    <section id="shop" className="py-32 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto">
      <div className="flex flex-col items-center text-center mb-16">
        <Leaf className="text-brand-green mb-4 fill-brand-green/20" size={32} />
        <h2 className="text-4xl md:text-5xl font-serif text-brand-brown mb-4">
          Our Essentials
        </h2>
        <p className="text-stone-600 max-w-lg mx-auto font-light leading-relaxed">
          The foundation of a wholesome pantry. Each product is carefully
          selected to bring the highest nutritional value to your table.
        </p>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-brand-brown/10 pb-6">
        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-colors ${
                selectedCategory === category 
                  ? "bg-brand-brown text-white" 
                  : "bg-transparent text-brand-brown hover:bg-brand-brown/10"
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
            className="appearance-none bg-transparent border border-brand-brown/30 text-brand-brown text-xs font-medium uppercase tracking-widest py-2 pl-4 pr-10 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-brown cursor-pointer"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown pointer-events-none" size={16} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {filteredProducts.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="group flex flex-col"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 mb-6 group-hover:shadow-xl transition-shadow duration-500">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/5 transition-colors duration-500" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest font-bold px-3 py-1 text-brand-brown shadow-sm">
                {product.category}
              </div>
            </div>
            <div className="flex flex-col flex-grow text-center">
              <div className="flex justify-center items-center gap-1 mb-2 text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <h3 className="text-xl font-serif text-stone-900 group-hover:text-brand-brown transition-colors mb-2">
                {product.name}
              </h3>
              <span className="text-lg text-brand-green mb-4">
                ₹{product.price.toFixed(2)}{" "}
                <span className="text-sm text-stone-400 font-light">
                  / {product.weight}
                </span>
              </span>
              <p className="text-sm text-stone-500 mb-6 line-clamp-2 font-light px-4">
                {product.description}
              </p>
              <QuickAddButton product={product} />
            </div>
          </Link>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-brand-brown">
          No products found matching your selection.
        </div>
      )}
    </section>
  );
}
