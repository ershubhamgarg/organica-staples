"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronRight, Hourglass, Search, SlidersHorizontal, Star, X, PackagePlus } from "lucide-react";
import QuickAddButton from "@/components/QuickAddButton";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import ScrollReveal from "@/components/ScrollReveal";
import { useProductStore } from "@/store/productStore";
import { useBestSellerIds } from "@/lib/useBestSellers";

import {
  getComboOnlyVariants,
  getPurchasableVariants,
  hasVariants,
  isComboOnlyProduct,
  isProductAvailable,
  isProductLowStock,
  Product,
} from "@/lib/data";
import { getComboAddHref } from "@/lib/comboLink";
import { isComboLive, useCombo } from "@/lib/useCombo";
import {
  getDiscountedPrice,
  getDiscountPercent,
  getUnitPriceInfo,
  getVariantDiscountedPrice,
  getVariantDiscountPercent,
  hasHighProductDiscount,
  hasProductDiscount,
  hasVariantDiscount,
} from "@/lib/pricing";

const sortablePrice = (product: Product) =>
  hasVariants(product)
    ? Math.min(...product.variants.map((v) => v.price))
    : getDiscountedPrice(product);

/** True if a customer can find a discounted price anywhere on this product. */
const isOnSale = (product: Product) =>
  hasProductDiscount(product) ||
  (hasVariants(product) && product.variants.some((v) => hasVariantDiscount(v)));

type PriceBucketKey = "all" | "under-100" | "100-200" | "200-300" | "300-plus";

const PRICE_BUCKETS: {
  key: PriceBucketKey;
  label: string;
  test: (price: number) => boolean;
}[] = [
  { key: "all", label: "All Prices", test: () => true },
  { key: "under-100", label: "Under ₹100", test: (p) => p < 100 },
  { key: "100-200", label: "₹100 – ₹200", test: (p) => p >= 100 && p <= 200 },
  { key: "200-300", label: "₹200 – ₹300", test: (p) => p > 200 && p <= 300 },
  { key: "300-plus", label: "₹300 & Above", test: (p) => p > 300 },
];

type SortOrder = "default" | "price-asc" | "price-desc" | "best-selling";

/**
 * Thin wrapper: reads the URL once and keys the real content by it, so a
 * fresh header search (?q=...) resets the page's local state via React's
 * normal remount semantics — no effect syncing a URL value into state (that
 * pattern is exactly what react-hooks/set-state-in-effect flags: derive it,
 * don't mirror it). A fresh search resetting other filters/variant picks
 * too is the right call, not just a side effect of this approach — it's a
 * new intent, not a refinement of the last one.
 */
export default function ShopContent() {
  const searchParams = useSearchParams();
  return <ShopGrid key={searchParams.get("q") ?? ""} initialQuery={searchParams.get("q") ?? ""} />;
}

function ShopGrid({ initialQuery }: { initialQuery: string }) {
  const { products, fetchProducts } = useProductStore();
  const [selectedVariantIds, setSelectedVariantIds] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (products.length === 0) {
      void fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const { ids: bestSellerIds } = useBestSellerIds();
  const isBestSeller = (product: Product) =>
    bestSellerIds.includes(String(product.id));

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [priceBucket, setPriceBucket] = useState<PriceBucketKey>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const router = useRouter();
  // Prefills from the header's search bar (?q=...) via the `initialQuery`
  // prop — the ShopContent wrapper above remounts this component whenever
  // that URL value changes, so it only needs to seed state once here.
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  const clearSearch = () => {
    setSearchQuery("");
    if (initialQuery) {
      // Drop the stale ?q= param so a refresh doesn't silently re-apply a
      // search the customer explicitly cleared.
      router.replace("/shop", { scroll: false });
    }
  };

  const { data: comboData } = useCombo();
  const comboLive = isComboLive(comboData);

  // Unlike the old pantry section, combo-only products/sizes are NOT
  // stripped out here — they're shown in the grid with their own "Add to
  // Combo" CTA instead of a normal buy flow (computed per-card below, via
  // getPurchasableVariants/getComboOnlyVariants), so nothing eligible for
  // the combo is invisible to someone browsing the shop.
  const visibleProducts = useMemo(
    () => products.filter((p) => p.isVisible !== false),
    [products],
  );

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const uniqueCategories = Array.from(
      new Set(visibleProducts.map((p) => p.category)),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { name: "All", count: visibleProducts.length },
      ...uniqueCategories.map((name) => ({
        name,
        count: counts[name] || 0,
      })),
    ];
  }, [visibleProducts]);

  const activeFilterCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (priceBucket !== "all" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setPriceBucket("all");
    setInStockOnly(false);
    setOnSaleOnly(false);
  };

  const filteredProducts = useMemo(() => {
    let result = [...visibleProducts];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    const bucket = PRICE_BUCKETS.find((b) => b.key === priceBucket);
    if (bucket && bucket.key !== "all") {
      result = result.filter((p) => bucket.test(sortablePrice(p)));
    }

    if (inStockOnly) {
      result = result.filter((p) => isProductAvailable(p));
    }

    if (onSaleOnly) {
      result = result.filter((p) => isOnSale(p));
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

      if (sortOrder === "best-selling") {
        // Inlined against bestSellerIds directly (rather than calling the
        // isBestSeller closure) so this comparator only depends on values
        // already listed below, not a function recreated every render.
        const bestA = bestSellerIds.includes(String(a.id));
        const bestB = bestSellerIds.includes(String(b.id));
        if (bestA !== bestB) return bestA ? -1 : 1;
      } else if (sortOrder === "price-asc") {
        return sortablePrice(a) - sortablePrice(b);
      } else if (sortOrder === "price-desc") {
        return sortablePrice(b) - sortablePrice(a);
      }

      return 0;
    });

    return result;
  }, [
    selectedCategory,
    priceBucket,
    inStockOnly,
    onSaleOnly,
    sortOrder,
    searchQuery,
    visibleProducts,
    bestSellerIds,
  ]);

  const filtersPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-brown/50">
          Category
        </h3>
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.name}>
              <button
                type="button"
                onClick={() => setSelectedCategory(category.name)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  selectedCategory === category.name
                    ? "bg-brand-brown text-brand-cream"
                    : "text-brand-brown/70 hover:bg-brand-gold/10"
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`text-[9px] font-bold ${
                    selectedCategory === category.name
                      ? "text-brand-cream/70"
                      : "text-brand-brown/35"
                  }`}
                >
                  {category.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-brown/50">
          Price
        </h3>
        <ul className="space-y-1">
          {PRICE_BUCKETS.map((bucket) => (
            <li key={bucket.key}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-brand-brown/70 transition-colors hover:bg-brand-gold/10">
                <input
                  type="radio"
                  name="price-bucket"
                  checked={priceBucket === bucket.key}
                  onChange={() => setPriceBucket(bucket.key)}
                  className="h-3.5 w-3.5 accent-brand-brown"
                />
                {bucket.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-brown/50">
          Availability
        </h3>
        <div className="space-y-1">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-brand-brown/70 transition-colors hover:bg-brand-gold/10">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded accent-brand-brown"
            />
            In Stock Only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-brand-brown/70 transition-colors hover:bg-brand-gold/10">
            <input
              type="checkbox"
              checked={onSaleOnly}
              onChange={(e) => setOnSaleOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded accent-brand-brown"
            />
            On Sale
          </label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full rounded-full border border-brand-gold/20 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand-brown transition-colors hover:border-brand-gold/40"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-brand-cream">
      {/* Page header — kept slim on purpose: this used to be a full hero
          block plus the combo banner, which together pushed the actual
          products below the fold. Products are the point of this page. */}
      <div className="border-b border-brand-gold/10 bg-white">
        <div className="mx-auto max-w-[95rem] px-4 py-4 sm:px-10 sm:py-5">
          <nav className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-brand-brown/40">
            <Link href="/" className="hover:text-brand-brown">
              Home
            </Link>
            <ChevronRight size={10} />
            <span className="text-brand-brown">Shop</span>
          </nav>
          <h1 className="font-serif text-xl tracking-tight text-brand-brown sm:text-2xl">
            Pure Staples, <span className="text-brand-gold italic">Sourced Responsibly.</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[95rem] px-4 py-6 sm:px-10 lg:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 rounded-3xl border border-brand-gold/10 bg-white p-6 shadow-sm">
              {filtersPanel}
            </div>
          </aside>

          <div>
            {/* Top bar: search, mobile filter trigger, sort */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={14}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the pantry..."
                  className="w-full rounded-full border border-brand-gold/20 bg-white py-2.5 pl-10 pr-9 text-xs text-brand-brown placeholder:text-brand-brown/35 shadow-sm transition-all focus:border-brand-gold focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-brown/30 transition-colors hover:text-brand-brown"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="relative flex items-center gap-2 rounded-full border border-brand-gold/20 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand-brown shadow-sm lg:hidden"
                >
                  <SlidersHorizontal size={13} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-terracotta text-[8px] font-black text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="relative flex-1 sm:flex-none sm:min-w-[210px]">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="w-full cursor-pointer appearance-none rounded-full border border-brand-gold/20 bg-white py-2.5 pl-4 pr-10 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-brown shadow-sm transition-all focus:border-brand-gold focus:outline-none"
                  >
                    <option value="default">Sort: Featured</option>
                    <option value="best-selling">Best Selling</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-gold"
                    size={13}
                  />
                </div>
              </div>
            </div>

            <p className="mb-5 text-[10px] font-bold uppercase tracking-widest text-brand-brown/40">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "Product" : "Products"}
            </p>

            {/* Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
                  <Search size={22} strokeWidth={1.5} />
                </div>
                <p className="font-serif text-lg text-brand-brown">
                  {searchQuery
                    ? `No products found for "${searchQuery}"`
                    : "No products match your filters"}
                </p>
                <p className="mt-1.5 text-xs font-light text-brand-brown/50">
                  Try clearing a filter or searching a different name.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    clearSearch();
                    clearAllFilters();
                  }}
                  className="mt-6 rounded-full border border-brand-gold/20 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand-brown transition-colors hover:border-brand-gold/40"
                >
                  Clear Search &amp; Filters
                </button>
              </div>
            ) : (
              <ScrollReveal
                animation="reveal-fade"
                threshold={0.05}
                className="grid grid-cols-2 gap-4 transition-all duration-500 min-h-[60vh] sm:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-4"
              >
                {filteredProducts.map((product) => {
                  // Combo-only sizes are never in the buy dropdown (that's
                  // the whole merchandising point — try them cheaply via the
                  // combo, not as a one-off purchase), but they also aren't
                  // hidden from the grid entirely any more: comboEligible
                  // below drives a dedicated "Add to Combo" CTA instead.
                  const purchasableVariants = comboLive
                    ? getPurchasableVariants(product)
                    : (product.variants ?? []);
                  const comboEligibleVariants = comboLive
                    ? getComboOnlyVariants(product)
                    : [];
                  const isFullyComboOnly =
                    comboLive && isComboOnlyProduct(product);

                  const variants =
                    purchasableVariants.length > 0 ? purchasableVariants : null;
                  const selectedVariant = variants
                    ? (variants.find(
                        (v) => v.id === selectedVariantIds[product.id],
                      ) ?? variants[0])
                    : null;
                  const displayProduct: Product = selectedVariant
                    ? {
                        ...product,
                        price: selectedVariant.price,
                        weight: selectedVariant.weight,
                        discount: selectedVariant.discountPercent ?? null,
                        stock_quantity: selectedVariant.stockQuantity,
                      }
                    : product;

                  const hasDiscount = hasProductDiscount(displayProduct);
                  const hasHighDiscount = hasHighProductDiscount(displayProduct);
                  const discountPercent = getDiscountPercent(displayProduct);
                  const discountedPrice = getDiscountedPrice(displayProduct);
                  const available = isProductAvailable(displayProduct);
                  const lowStock = isProductLowStock(displayProduct);
                  const unitPrice = getUnitPriceInfo(displayProduct);
                  const bestSeller = isBestSeller(product);
                  // The specific combo-eligible size this card should deep
                  // link to — the cheapest one when there's a choice. For a
                  // plain (non-variant) combo-eligible product, comboUnit is
                  // undefined and getComboAddHref falls back to the bare
                  // product id, exactly as /api/combo's own key format does.
                  const comboUnit = [...comboEligibleVariants].sort(
                    (a, b) => a.price - b.price,
                  )[0];
                  const showComboCta = isFullyComboOnly || Boolean(comboUnit);
                  const comboHref = showComboCta
                    ? getComboAddHref(product.id, comboUnit?.id)
                    : undefined;

                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-brand-gold/10 shadow-lg shadow-brand-brown/5 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-brown/10 hover:border-brand-gold/25 animate-fade-in"
                    >
                      <Link
                        href={`/product/${product.slug ?? product.id}`}
                        className="block relative group/image"
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-brand-sand">
                          <ProductImageCarousel
                            product={product}
                            imageClassName={`object-cover transition-transform duration-700 group-hover:scale-105 ${!available ? "blur-[2px] opacity-60" : ""}`}
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            autoplay={false}
                          />

                          {product.justLaunched && (
                            <div className="absolute top-3 left-3 z-10">
                              <span className="bg-brand-green text-brand-cream px-3 py-1 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg border border-white/20">
                                Just Launched
                              </span>
                            </div>
                          )}

                          {/* Best Seller chip — bottom-left, so it never
                              collides with the launch badge (top-left) or
                              the discount ribbon (top-right corner). */}
                          {bestSeller && (
                            <div className="absolute bottom-3 left-3 z-10">
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] text-brand-brown shadow-lg backdrop-blur-sm border border-brand-gold/30">
                                <Star
                                  size={9}
                                  className="text-brand-gold"
                                  fill="currentColor"
                                  strokeWidth={0}
                                />
                                Best Seller
                              </span>
                            </div>
                          )}

                          {/* Discount/availability read off `displayProduct`,
                              which for a fully combo-only card falls back to
                              base product fields that don't describe the
                              actual combo-eligible variant — so both are
                              suppressed there in favour of the combo note
                              below instead of showing something misleading. */}
                          {!isFullyComboOnly && available && hasDiscount && (
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

                          {/* The corner the discount ribbon would otherwise
                              occupy — free here since that's suppressed. */}
                          {isFullyComboOnly && (
                            <div className="absolute right-3 top-3 z-10">
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green px-2.5 py-1 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] text-brand-cream shadow-lg">
                                <PackagePlus size={9} strokeWidth={2} />
                                Combo Only
                              </span>
                            </div>
                          )}

                          {!isFullyComboOnly && !available && (
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
                          href={`/product/${product.slug ?? product.id}`}
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

                        {isFullyComboOnly ? (
                          // Nothing here is purchasable on its own — the
                          // whole buy block is replaced with the sanctioned
                          // path into it, pre-loaded with this exact item.
                          <div className="mb-3 flex flex-col items-center gap-2 sm:mb-4">
                            <p className="text-[9px] sm:text-[11px] font-medium italic tracking-wide text-brand-gold">
                              {comboUnit?.label ?? displayProduct.weight}
                            </p>
                            <p className="text-[10px] font-light leading-relaxed text-brand-brown/50">
                              Only sold as part of a Build-Your-Own Combo
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`flex flex-col items-center gap-2 ${available ? "mb-3 sm:mb-4" : "mb-2"}`}
                          >
                            {variants && variants.length > 1 ? (
                              <div className="relative w-full">
                                <select
                                  value={selectedVariant?.id ?? ""}
                                  onChange={(event) =>
                                    setSelectedVariantIds((prev) => ({
                                      ...prev,
                                      [product.id]: event.target.value,
                                    }))
                                  }
                                  aria-label={`Choose size for ${product.name}`}
                                  className="w-full cursor-pointer appearance-none rounded-full border border-brand-gold/25 bg-white py-2 pl-3 pr-8 text-center text-[10px] sm:text-xs font-bold text-brand-brown transition-colors hover:border-brand-gold/50 focus:border-brand-gold focus:outline-none"
                                >
                                  {variants.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {v.label} · ₹
                                      {getVariantDiscountedPrice(v).toFixed(0)}
                                      {hasVariantDiscount(v)
                                        ? ` (${getVariantDiscountPercent(v)}% off)`
                                        : ""}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={12}
                                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold"
                                />
                              </div>
                            ) : (
                              <p className="text-[9px] sm:text-[11px] font-medium italic tracking-wide text-brand-gold">
                                {displayProduct.weight}
                              </p>
                            )}

                            {available && (
                              <>
                                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                                  <span className="text-lg sm:text-2xl font-semibold tracking-tight text-brand-brown">
                                    ₹
                                    {(hasDiscount
                                      ? discountedPrice
                                      : displayProduct.price
                                    ).toFixed(2)}
                                  </span>
                                  {hasDiscount && (
                                    <>
                                      <span className="text-xs sm:text-sm font-light text-brand-brown/40 line-through">
                                        ₹{displayProduct.price.toFixed(2)}
                                      </span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white ${
                                          hasHighDiscount
                                            ? "bg-brand-terracotta"
                                            : "bg-brand-green-fresh"
                                        }`}
                                      >
                                        {discountPercent}% off
                                      </span>
                                    </>
                                  )}
                                </div>

                                {unitPrice && (
                                  <p className="text-[9px] sm:text-[10px] font-light text-brand-brown/45">
                                    {unitPrice}
                                  </p>
                                )}

                                {lowStock && (
                                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-brand-terracotta">
                                    Selling out soon
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        <div className="pt-1">
                          {isFullyComboOnly ? (
                            <Link
                              href={comboHref!}
                              className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brand-cream transition-all duration-300 hover:bg-brand-green-light"
                            >
                              <PackagePlus size={13} />
                              Add to Combo
                              <ArrowRight
                                size={13}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </Link>
                          ) : (
                            <QuickAddButton
                              product={product}
                              selectedVariant={selectedVariant}
                              className="w-full"
                            />
                          )}
                        </div>

                        {/* Buyable in its own right, but also offered in a
                            combo-only size — a quieter secondary CTA, since
                            the main Add to Cart above already covers this
                            card's primary purchase. */}
                        {!isFullyComboOnly && showComboCta && (
                          <Link
                            href={comboHref!}
                            className="mt-2 flex items-center justify-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-brand-brown/45 transition-colors hover:text-brand-green sm:text-[9px]"
                          >
                            <PackagePlus size={10} className="text-brand-gold" />
                            Also In {comboUnit?.label ?? "100g"} Combo Pack
                          </Link>
                        )}

                        {/* `available` reflects displayProduct, which is
                            unreliable for a fully combo-only card (its own
                            base fields, not the combo-eligible variant's) —
                            ratings/reviews are a product-level fact either
                            way, so shown regardless there. */}
                        {(available || isFullyComboOnly) && (
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
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Coming Soon Placeholder — only when unfiltered, otherwise
                    it reads as a false "no more matches" result. */}
                {activeFilterCount === 0 && !searchQuery && (
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
                )}
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${isFilterDrawerOpen ? "" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-brand-brown/40 backdrop-blur-sm transition-opacity duration-300 ${
            isFilterDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsFilterDrawerOpen(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 w-[85vw] max-w-sm overflow-y-auto bg-brand-cream px-6 py-6 shadow-2xl transition-transform duration-300 ${
            isFilterDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg text-brand-brown">
              <SlidersHorizontal size={15} className="text-brand-gold" />
              Filters
            </h2>
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              aria-label="Close filters"
              className="flex h-9 w-9 items-center justify-center rounded-full text-brand-brown/50 hover:bg-brand-gold/10"
            >
              <X size={18} />
            </button>
          </div>
          {filtersPanel}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(false)}
            className="mt-8 w-full rounded-full bg-brand-brown py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-cream shadow-lg"
          >
            Show {filteredProducts.length} Results
          </button>
        </div>
      </div>
    </div>
  );
}
