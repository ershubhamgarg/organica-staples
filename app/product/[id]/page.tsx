"use client";

import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState, use, useMemo, useRef } from "react";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import QuickAddButton from "@/components/QuickAddButton";
import ScrollReveal from "@/components/ScrollReveal";
import { isProductAvailable, isProductLowStock, Product } from "@/lib/data";
import { supabase } from "@/utils/supabase";
import {
  getDiscountedPrice,
  getDiscountPercent,
  getUnitPriceInfo,
  hasHighProductDiscount,
  hasProductDiscount,
} from "@/lib/pricing";

const REVIEWS_PER_PAGE = 3;

type Review = {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string;
};

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const fetchProductById = useProductStore((state) => state.fetchProductById);
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const isLoading = useProductStore((state) => state.isLoading);
  const error = useProductStore((state) => state.error);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const { addToCart } = useCartStore();
  const { user } = useUserStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
    useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // New Review Form States
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      const fetchedProduct = await fetchProductById(id);
      if (isActive && fetchedProduct && fetchedProduct.isVisible !== false) {
        setProduct(fetchedProduct);
        setHasFetched(true);

        const { data: fetchedReviews } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", id)
          .order("created_at", { ascending: false });

        if (isActive && fetchedReviews) {
          setReviews(fetchedReviews);
        }
      }
    }

    loadData();

    if (products.length === 0) {
      fetchProducts();
    }

    return () => {
      isActive = false;
    };
  }, [fetchProductById, fetchProducts, id, products.length]);

  const recommendedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.category === product.category &&
          p.isVisible !== false,
      )
      .slice(0, 4);
  }, [product, products]);

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    return reviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [currentPage, reviews]);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  const { averageRating, reviewCount } = useMemo(() => {
    if (reviews.length === 0) {
      return {
        averageRating: product?.rating || 0,
        reviewCount: product?.review_count || 0,
      };
    }

    const reviewsWithRating = reviews.filter(
      (r): r is Review & { rating: number } => typeof r.rating === "number",
    );
    const total = reviewsWithRating.reduce((acc, r) => acc + r.rating, 0);
    const count = reviewsWithRating.length;

    return {
      averageRating: count > 0 ? total / count : product?.rating || 0,
      reviewCount:
        reviews.length > (product?.review_count || 0)
          ? reviews.length
          : product?.review_count || 0,
    };
  }, [reviews, product]);

  useEffect(() => {
    if (user && !newUserName) {
      setNewUserName(user.email?.split("@")[0] || "");
    }
  }, [user, newUserName]);

  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [product?.id]);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;
    setIsDescriptionOverflowing(el.scrollHeight > el.clientHeight + 2);
  }, [product?.description, isDescriptionExpanded]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!newRating && !newComment.trim()) {
      setSubmitMessage({
        type: "error",
        text: "Please provide a rating or a review comment.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const { error: submitError } = await supabase.from("reviews").insert({
        product_id: product.id,
        user_id: user?.id || null,
        user_name:
          newUserName.trim() || user?.email?.split("@")[0] || "Anonymous",
        rating: newRating,
        comment: newComment.trim() || null,
      });

      if (submitError) throw submitError;

      setSubmitMessage({
        type: "success",
        text: "Thank you! Your feedback has been submitted.",
      });
      setNewRating(null);
      setNewComment("");
      setNewUserName("");

      const { data: refreshedReviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (refreshedReviews) setReviews(refreshedReviews);
    } catch (err: unknown) {
      setSubmitMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit feedback.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((!hasFetched || isLoading) && !product) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-xl animate-pulse-slow" />
            <Image
              src="/annvriksh_logo_mark.png"
              alt="Loading"
              fill
              className="relative object-contain animate-spin-slow"
              style={{ animationDuration: "2.4s" }}
              sizes="96px"
              priority
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-brown/40">
            Fetching the harvest...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-12 bg-white rounded-3xl shadow-2xl">
          <h1 className="text-3xl font-serif text-brand-brown mb-4">
            Grain not found
          </h1>
          <p className="text-brand-brown/60 mb-8 font-light">
            The staple you seek is currently beyond our reach.
          </p>
          <Link
            href="/#shop"
            className="inline-flex items-center gap-3 bg-brand-brown text-brand-cream px-8 py-4 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light"
          >
            Explore Shop <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = hasProductDiscount(product);
  const hasHighDiscount = hasHighProductDiscount(product);
  const discountPercent = getDiscountPercent(product);
  const discountedPrice = getDiscountedPrice(product);
  const available = isProductAvailable(product);
  const lowStock = isProductLowStock(product);
  const unitPrice = product ? getUnitPriceInfo(product) : null;

  const handleAddToCart = () => {
    if (!available) return;
    addToCart(product, quantity, user?.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Product Hero Section */}
      <section className="relative pt-8 lg:pt-16 pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb - Mobile (above image) */}
          <nav className="flex lg:hidden items-center gap-2 mb-4 text-[8px] uppercase tracking-[0.2em] font-bold text-brand-brown/60 flex-wrap">
            <Link href="/" className="hover:text-brand-brown transition-colors">
              Home
            </Link>
            <span className="text-brand-brown/20">/</span>
            <Link
              href="/#shop"
              className="hover:text-brand-brown transition-colors"
            >
              Shop
            </Link>
            <span className="text-brand-brown/20">/</span>
            <span className="text-brand-brown/70">{product.category}</span>
            <span className="text-brand-brown/20">/</span>
            <span className="text-brand-gold/80 truncate max-w-[120px]">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Product Images */}
            <div className="relative lg:sticky lg:top-32 lg:w-full lg:max-w-[520px] lg:mx-auto">
              <div className="absolute -inset-6 bg-brand-gold/10 rounded-[2.5rem] blur-3xl pointer-events-none" />
              <div
                className="absolute -inset-3 rounded-[2rem] border border-dashed border-brand-gold/25 animate-spin-slow pointer-events-none"
                style={{ animationDuration: "36s" }}
              />

              <div className="relative">
                <div className="relative aspect-square w-full rounded-[2rem] bg-brand-sand overflow-hidden border-4 border-white shadow-[0_40px_80px_-20px_rgba(60,54,42,0.25)]">
                  <ProductImageCarousel
                    product={product}
                    imageClassName={`object-cover transition-transform duration-1000 ${!available ? "blur-[2px] opacity-60" : ""}`}
                    sizes="(max-width: 1024px) 100vw, 520px"
                  />

                  {/* Premium Corner Badge for Discount */}
                  {available && hasDiscount && (
                    <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                      <div
                        className={`absolute top-[20px] right-[-32px] rotate-45 w-32 py-1.5 text-center text-[9px] font-black uppercase tracking-[0.25em] shadow-xl border-y border-white/20 text-white ${
                          hasHighDiscount
                            ? "bg-brand-terracotta"
                            : "bg-brand-green-fresh"
                        }`}
                      >
                        {hasHighDiscount
                          ? "Exclusive"
                          : `${discountPercent}% Off`}
                      </div>
                    </div>
                  )}

                  {!available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-brown/20 backdrop-blur-[1px]">
                      <span className="bg-brand-cream/90 backdrop-blur-md text-brand-brown px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg border border-brand-gold/10">
                        Available Soon
                      </span>
                    </div>
                  )}
                </div>

                {/* Floating Trust Badge */}
                {available && (
                  <div className="hidden sm:flex absolute -right-4 lg:-right-6 -bottom-6 z-20 items-center gap-3 bg-white/90 backdrop-blur-md pl-4 pr-5 py-3.5 rounded-2xl shadow-xl border border-brand-gold/10 animate-float-slow">
                    <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                      <ShieldCheck size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-brown">
                        Purity Checked
                      </p>
                      <p className="text-[9px] text-brand-brown/50 font-light">
                        Farm to Table
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust Features */}
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 pt-6 border-t border-brand-gold/10">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Quality Checked",
                    body: "Every Batch Verified",
                    color: "text-brand-gold bg-brand-gold/10",
                  },
                  {
                    icon: Award,
                    title: "Farm Direct",
                    body: "Ethical Sourcing",
                    color: "text-brand-green bg-brand-green/10",
                  },
                  {
                    icon: Truck,
                    title: "Traceable Sourcing",
                    body: "Farm To Pantry",
                    color: "text-brand-terracotta bg-brand-terracotta/10",
                  },
                  {
                    icon: Leaf,
                    title: "100% Organic",
                    body: "Zero Chemicals",
                    color: "text-brand-green bg-brand-green/10",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.color}`}
                      >
                        <Icon size={16} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-[9px] uppercase tracking-widest font-black text-brand-brown">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-brand-brown/40 font-light mt-0.5">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 text-[10px] text-brand-brown/35 font-light leading-relaxed">
                Every batch is checked with care and sourced directly from
                trusted farm partners before it reaches your pantry.
              </p>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col lg:pl-12">
              {/* Breadcrumb - Desktop (in right column) */}
              <nav className="hidden lg:flex items-center gap-3 mb-8 text-[10px] uppercase tracking-[0.3em] font-black text-brand-brown/60">
                <Link
                  href="/"
                  className="hover:text-brand-brown transition-colors"
                >
                  Home
                </Link>
                <span>/</span>
                <Link
                  href="/#shop"
                  className="hover:text-brand-brown transition-colors"
                >
                  Shop
                </Link>
                <span>/</span>
                <span className="text-brand-brown/80">{product.category}</span>
                <span>/</span>
                <span className="text-brand-gold">{product.name}</span>
              </nav>

              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/5 rounded-full mb-4 border border-brand-gold/10">
                  <span className="w-1 h-1 rounded-full bg-brand-gold" />
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-gold">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-0.5 text-brand-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(averageRating)
                            ? "fill-brand-gold text-brand-gold"
                            : "text-brand-gold/20"
                        }
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      document
                        .getElementById("reviews")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-green hover:text-brand-brown transition-all duration-300 border-b border-brand-green/30 hover:border-brand-brown/50 pb-0.5 text-left active:scale-95"
                  >
                    {reviewCount} Customer Reviews
                  </button>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-[2.5rem] font-serif text-brand-brown mb-1 tracking-tight leading-[1.05]">
                  {product.name}
                </h1>

                {product.name2 && (
                  <p className="text-lg lg:text-xl font-medium text-brand-brown/60 mb-2 tracking-wide font-devanagari">
                    {product.name2}
                  </p>
                )}

                <p className="text-[12px] text-brand-gold uppercase tracking-[0.3em] font-black mb-3">
                  {product.weight}
                </p>

                <div className="flex items-center gap-6 mb-4">
                  {available && hasDiscount ? (
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-6">
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl lg:text-3xl font-medium text-brand-brown">
                            ₹{discountedPrice.toFixed(2)}
                          </span>
                          {unitPrice && (
                            <span className="text-sm text-brand-brown/50 font-light">
                              ({unitPrice})
                            </span>
                          )}
                        </div>
                        <span className="text-lg text-brand-brown/50 line-through font-light">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-fresh mt-1">
                        You Save ₹{(product.price - discountedPrice).toFixed(2)}{" "}
                        ({discountPercent}% Off)
                      </p>
                    </div>
                  ) : available ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl lg:text-3xl font-medium text-brand-brown">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {unitPrice && (
                        <span className="text-sm text-brand-brown/50 font-light">
                          ({unitPrice})
                        </span>
                      )}
                    </div>
                  ) : null}

                  {available &&
                    product.stock_quantity !== undefined &&
                    product.stock_quantity !== null && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-brand-green/10 rounded-full">
                        <div
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            lowStock ? "bg-brand-terracotta" : "bg-brand-green"
                          }`}
                        />
                        <span
                          className={`text-[10px] uppercase tracking-widest font-black ${
                            lowStock
                              ? "text-brand-terracotta"
                              : "text-brand-green"
                          }`}
                        >
                          {lowStock ? "Selling Out Soon" : "In Stock"}
                        </span>
                      </div>
                    )}
                </div>

                <div
                  ref={descriptionRef}
                  className={`text-base text-brand-brown/80 font-light leading-relaxed max-w-xl text-balance whitespace-pre-wrap ${
                    isDescriptionExpanded ? "" : "line-clamp-4"
                  }`}
                >
                  {product.description}
                </div>
                {(isDescriptionOverflowing || isDescriptionExpanded) && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((v) => !v)}
                    className="mt-2 text-[10px] uppercase tracking-[0.2em] font-black text-brand-green hover:text-brand-brown transition-colors"
                  >
                    {isDescriptionExpanded ? "See Less" : "See More"}
                  </button>
                )}

                {/* Compact Benefits List */}
                {product.benefits && product.benefits.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                    {product.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 group"
                      >
                        <div className="w-5 h-5 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors duration-300">
                          <Check size={10} strokeWidth={4} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-brown/70 group-hover:text-brand-brown transition-colors">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Actions */}
              <div className="p-6 bg-brand-cream rounded-3xl border border-brand-gold/10 shadow-xl shadow-brand-brown/5 mb-8">
                {!available ? (
                  <div className="flex flex-col items-center text-center p-2">
                    <Clock className="text-brand-gold mb-3" size={28} />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-brown">
                      Available Soon
                    </p>
                    <p className="text-xs text-brand-brown/40 font-light mt-1">
                      Sign up for availability alerts
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex items-center border border-brand-brown rounded-full px-6 py-3 lg:py-4 bg-white shadow-inner w-full sm:w-auto justify-between sm:justify-start">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-brand-brown hover:text-brand-terracotta transition-all p-2 lg:p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="text-brand-brown text-lg font-black w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(
                            typeof product.stock_quantity === "number"
                              ? Math.min(product.stock_quantity, quantity + 1)
                              : quantity + 1,
                          )
                        }
                        disabled={
                          typeof product.stock_quantity === "number" &&
                          quantity >= product.stock_quantity
                        }
                        className="text-brand-brown hover:text-brand-green transition-all p-2 lg:p-1 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className={`w-full sm:flex-1 group relative flex items-center justify-center gap-4 px-10 py-5 bg-brand-brown text-brand-cream rounded-xl lg:rounded-full text-[12px] uppercase tracking-[0.3em] font-black transition-all duration-500 overflow-hidden shadow-2xl hover:translate-y-[-2px] min-h-[56px] ${added ? "bg-brand-green" : ""}`}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {added ? (
                          <Check size={18} />
                        ) : (
                          <ShoppingBag size={18} />
                        )}
                        {added ? "Added" : "Add to Cart"}
                      </span>
                      <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assurance Strip */}
      <section className="relative bg-white py-8 lg:py-10 px-4 sm:px-6 lg:px-8 border-y border-brand-gold/10">
        <ScrollReveal className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {[
            { icon: Award, label: "Farm Direct" },
            { icon: Sparkles, label: "Quality Assured" },
            { icon: Leaf, label: "100% Organic" },
            { icon: Truck, label: "Pan-India Delivery" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 text-brand-brown/60"
              >
                <Icon size={18} className="text-brand-gold" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black">
                  {item.label}
                </span>
              </div>
            );
          })}
        </ScrollReveal>
      </section>

      {/* Customer Reviews */}
      <section
        id="reviews"
        className="bg-brand-cream border-b border-brand-gold/10 py-8 md:py-12 scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 md:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="h-[1px] w-6 bg-brand-terracotta" />
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-terracotta">
                  Reviews
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-serif text-brand-brown tracking-tight">
                Customer <span className="italic">Feedback</span>
              </h2>
            </div>

            <div className="flex items-center gap-3 text-brand-brown bg-white/50 px-4 py-2 rounded-2xl border border-brand-gold/10">
              <span className="text-3xl font-serif">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={
                        i < Math.round(averageRating)
                          ? "fill-brand-gold text-brand-gold"
                          : "text-brand-gold/20"
                      }
                    />
                  ))}
                </div>
                <span className="text-[8px] uppercase tracking-widest font-bold opacity-40">
                  {reviewCount} Reviews
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12">
            {/* Review List */}
            <div className="flex flex-col">
              {reviews.length === 0 ? (
                <div className="flex-grow flex items-center justify-center p-8 md:p-12 text-center border border-dashed border-brand-gold/15 rounded-3xl bg-white/30 min-h-[200px]">
                  <p className="text-brand-brown/40 text-sm font-light italic">
                    No customer reviews yet. Be the first to share your
                    experience!
                  </p>
                </div>
              ) : (
                <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl shadow-brand-brown/5 border border-brand-gold/5">
                <div
                  className={`space-y-4 md:space-y-6 ${reviews.length >= 3 ? "max-h-[600px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar" : ""}`}
                >
                  {paginatedReviews.map((review) => {
                    const isOwnReview = user && review.user_id === user.id;
                    return (
                      <div
                        key={review.id}
                        className={`group pb-4 md:pb-6 border-b border-brand-gold/10 last:border-0 ${
                          isOwnReview
                            ? "bg-brand-green/[0.03] -mx-4 px-4 py-4 rounded-2xl border-brand-green/10"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div
                              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-serif text-sm md:text-base ${
                                isOwnReview
                                  ? "bg-brand-green/10 text-brand-green ring-1 ring-brand-green/30"
                                  : "bg-brand-sand text-brand-brown"
                              }`}
                            >
                              {review.user_name?.[0].toUpperCase() || "A"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-[9px] uppercase tracking-widest font-black text-brand-brown">
                                  {review.user_name || "Anonymous"}
                                </h5>
                                {isOwnReview && (
                                  <span className="text-[6px] uppercase tracking-widest font-black text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded-full border border-brand-green/20">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-[8px] text-brand-brown/30 font-bold mt-0.5 uppercase tracking-tighter">
                                {new Date(review.created_at).toLocaleDateString(
                                  "en-IN",
                                  { month: "short", year: "numeric" },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-brand-gold">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={9}
                                className={
                                  i < (review.rating || 0)
                                    ? "fill-brand-gold text-brand-gold"
                                    : "text-brand-gold/10"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && review.comment.trim() && (
                          <div className="text-brand-brown/70 font-light leading-relaxed pl-0 mt-1 md:pl-12 text-xs md:text-[13px] whitespace-pre-wrap">
                            &quot;{review.comment}&quot;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-3 pl-0 md:pl-12 pt-4 md:pt-6 mt-4 md:mt-6 border-t border-brand-gold/10">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-full border border-brand-gold/20 flex items-center justify-center text-brand-brown disabled:opacity-20 hover:bg-brand-gold/5 transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-[9px] uppercase tracking-widest font-black text-brand-brown/40">
                      {currentPage} <span className="mx-2">/</span>{" "}
                      {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-full border border-brand-gold/20 flex items-center justify-center text-brand-brown disabled:opacity-20 hover:bg-brand-gold/5 transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="lg:sticky lg:top-32 h-max">
              <form
                onSubmit={handleSubmitReview}
                className="bg-white p-5 md:p-8 rounded-3xl shadow-xl shadow-brand-brown/5 border border-brand-gold/5"
              >
                <h3 className="text-xl font-serif text-brand-brown mb-1">
                  Write a Review
                </h3>
                <p className="text-[10px] text-brand-brown/40 font-light mb-6">
                  Share your experience with this product.
                </p>

                {submitMessage && (
                  <div
                    className={`mb-6 p-3 text-[9px] uppercase tracking-widest font-black rounded-xl ${
                      submitMessage.type === "success"
                        ? "bg-brand-green/10 text-brand-green"
                        : "bg-brand-terracotta/10 text-brand-terracotta"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-black text-brand-brown/60 mb-3">
                      Rating
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={20}
                            className={
                              star <= (newRating || 0)
                                ? "fill-brand-gold text-brand-gold"
                                : "text-brand-gold/20"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {!user && (
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-black text-brand-brown/60 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-brand-cream/30 border-b border-brand-gold/20 py-2 text-[13px] focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/20 font-light"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-black text-brand-brown/60 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full bg-brand-cream/30 border-b border-brand-gold/20 py-2 text-[13px] focus:outline-none focus:border-brand-brown transition-colors resize-none placeholder:text-brand-brown/20 font-light"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-brown text-brand-cream py-4 rounded-full text-[9px] uppercase tracking-[0.25em] font-black transition-all hover:bg-brand-brown-light disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Send Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {recommendedProducts.length > 0 && (
        <section className="py-12 md:py-16 px-4 md:px-6 overflow-hidden relative border-t border-brand-gold/5 bg-brand-cream/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-4 mb-3">
                <span className="h-[1px] w-6 bg-brand-gold/20" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-gold">
                  You May Also Like
                </span>
                <span className="h-[1px] w-6 bg-brand-gold/20" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-serif text-brand-brown tracking-tight">
                Related <span className="italic">Products</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {recommendedProducts.map((p) => {
                const available = isProductAvailable(p);
                const lowStock = isProductLowStock(p);
                const unitPrice = getUnitPriceInfo(p);
                return (
                  <div
                    key={p.id}
                    className="group flex flex-col items-center text-center bg-white/40 p-3 md:p-4 rounded-3xl border border-brand-gold/5 hover:border-brand-gold/20 transition-all duration-500"
                  >
                    <Link
                      href={`/product/${p.id}`}
                      className="relative block w-full aspect-square rounded-2xl bg-brand-sand overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-all duration-700"
                    >
                      <ProductImageCarousel
                        product={p}
                        imageClassName={`object-cover transition-transform duration-700 group-hover:scale-110 ${!available ? "blur-[2px] opacity-60" : ""}`}
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/5 transition-colors" />

                      {!available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-brown/10 backdrop-blur-[1px]">
                          <span className="bg-brand-cream/90 backdrop-blur-md text-brand-brown px-3 py-1 text-[7px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm border border-brand-gold/10">
                            Available Soon
                          </span>
                        </div>
                      )}
                      {available && lowStock && (
                        <div className="absolute top-2 left-2 bg-brand-terracotta text-white px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm border border-white/20">
                          Few Left
                        </div>
                      )}
                    </Link>
                    <Link
                      href={`/product/${p.id}`}
                      className="mb-2 block w-full"
                    >
                      <div className="flex flex-col items-center justify-center min-h-[3.5em]">
                        <h4
                          className={`text-sm sm:text-base lg:text-lg font-serif text-brand-brown group-hover:text-brand-terracotta transition-colors tracking-tight leading-tight line-clamp-2 text-center ${!available ? "opacity-40" : ""}`}
                        >
                          {p.name}
                        </h4>
                        {p.name2 && (
                          <span className="text-[9px] sm:text-[11px] text-brand-brown/40 font-medium mt-1 text-center line-clamp-1">
                            {p.name2}
                          </span>
                        )}
                      </div>
                    </Link>
                    {available ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <p className="text-[9px] text-brand-gold italic font-medium tracking-wide">
                          {p.weight}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-lg md:text-xl font-medium text-brand-brown tracking-tighter">
                            ₹{p.price.toFixed(2)}
                          </p>
                          {unitPrice && (
                            <span className="text-[9px] text-brand-brown/30 font-light">
                              ({unitPrice})
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
