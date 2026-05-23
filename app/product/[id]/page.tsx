"use client";

import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Truck,
  Clock,
  Leaf,
  Minus,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
  Award,
} from "lucide-react";
import { useEffect, useState, use, useMemo } from "react";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import QuickAddButton from "@/components/QuickAddButton";
import { isProductAvailable, Product } from "@/lib/data";
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
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-gold/20" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-brown/40">
            Loading...
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
      <section className="relative pt-8 lg:pt-16 pb-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb - Mobile (above image) */}
          <nav className="flex lg:hidden items-center gap-2 mb-4 text-[8px] uppercase tracking-[0.2em] font-bold text-brand-brown/40 flex-wrap">
            <Link
              href="/"
              className="hover:text-brand-brown transition-colors"
            >
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
            <span className="text-brand-brown/50">{product.category}</span>
            <span className="text-brand-brown/20">/</span>
            <span className="text-brand-gold/80 truncate max-w-[120px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Product Images */}
            <div className="relative lg:sticky lg:top-32">
              <div className="relative aspect-square w-full rounded-3xl bg-brand-sand overflow-hidden">
                <ProductImageCarousel
                  product={product}
                  imageClassName="object-cover transition-transform duration-1000"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Product Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  <div className="bg-brand-cream border border-brand-gold/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-black text-brand-brown shadow-md">
                    {product.category}
                  </div>
                  {available && hasDiscount && (
                    <div
                      className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-black text-white shadow-xl ${
                        hasHighDiscount
                          ? "bg-brand-terracotta"
                          : "bg-brand-green-fresh"
                      }`}
                    >
                      {hasHighDiscount
                        ? "Special Edition"
                        : `${discountPercent}% Off`}
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative Ring */}
              <div className="absolute -inset-4 z-[-1] border border-brand-gold/10 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-float-slow" />
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col lg:pl-12">
              {/* Breadcrumb - Desktop (in right column) */}
              <nav className="hidden lg:flex items-center gap-3 mb-8 text-[10px] uppercase tracking-[0.3em] font-black text-brand-brown/40">
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
                <span className="text-brand-brown/60">{product.category}</span>
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
                      document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-green hover:text-brand-brown transition-all duration-300 border-b border-brand-green/30 hover:border-brand-brown/30 pb-0.5 text-left active:scale-95"
                  >
                    {reviewCount} Customer Reviews
                  </button>
                </div>

                <h1 className="text-4xl lg:text-5xl font-serif text-brand-brown mb-2 tracking-tight leading-[0.95]">
                  {product.name}
                </h1>

                <p className="text-[12px] text-brand-gold uppercase tracking-[0.3em] font-black mb-6">
                  {product.weight}
                </p>

                <div className="flex items-center gap-6 mb-6">
                  {available && hasDiscount ? (
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-6">
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl lg:text-3xl font-medium text-brand-brown">
                            ₹{discountedPrice.toFixed(0)}
                          </span>
                          {unitPrice && (
                            <span className="text-sm text-brand-brown/30 font-light">
                              ({unitPrice})
                            </span>
                          )}
                        </div>
                        <span className="text-lg text-brand-brown/30 line-through font-light">
                          ₹{product.price.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-fresh mt-2">
                        You Save ₹{(product.price - discountedPrice).toFixed(0)}{" "}
                        ({discountPercent}% Off)
                      </p>
                    </div>
                  ) : available ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl lg:text-3xl font-medium text-brand-brown">
                        ₹{product.price.toFixed(0)}
                      </span>
                      {unitPrice && (
                        <span className="text-sm text-brand-brown/30 font-light">
                          ({unitPrice})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-8" /> // Placeholder if out of stock
                  )}

                  {available &&
                    product.stock_quantity !== undefined &&
                    product.stock_quantity !== null && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-brand-green/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-brand-green">
                          {product.stock_quantity} in stock
                        </span>
                      </div>
                    )}
                </div>

                <p className="text-base text-brand-brown/60 font-light leading-relaxed max-w-xl text-balance">
                  {product.description}
                </p>
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
                        onClick={() => setQuantity(quantity + 1)}
                        className="text-brand-brown hover:text-brand-green transition-all p-2 lg:p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
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

              {/* Trust Features */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-brand-gold/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-brand-brown">
                      Certified Pure
                    </h4>
                    <p className="text-[10px] text-brand-brown/40 font-light mt-0.5">
                      100% Lab Tested
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                    <Award size={16} />
                  </div>
                  <div>
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-brand-brown">
                      Farm Direct
                    </h4>
                    <p className="text-[10px] text-brand-brown/40 font-light mt-0.5">
                      Ethical Sourcing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section id="reviews" className="bg-brand-cream border-y border-brand-gold/10 py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
            <div>
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="h-[1px] w-8 bg-brand-terracotta" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-terracotta">
                  Reviews
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-serif text-brand-brown tracking-tight">
                Customer <span className="italic">Feedback</span>
              </h2>
            </div>

            <div className="flex items-center gap-4 text-brand-brown">
              <span className="text-4xl font-serif">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex flex-col gap-0.5">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < Math.round(averageRating)
                          ? "fill-brand-gold text-brand-gold"
                          : "text-brand-gold/20"
                      }
                    />
                  ))}
                </div>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
                  {reviewCount} Reviews
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-20">
            {/* Review List */}
            <div className="space-y-6 md:space-y-10">
              {reviews.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-brand-gold/10 rounded-3xl">
                  <p className="text-brand-brown/40 font-light italic">
                    Be the first to share your experience.
                  </p>
                </div>
              ) : (
                <>
                  {paginatedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="group pb-6 md:pb-10 border-b border-brand-gold/10 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown font-serif text-base md:text-lg">
                            {review.user_name?.[0].toUpperCase() || "A"}
                          </div>
                          <div>
                            <h5 className="text-[10px] uppercase tracking-widest font-black text-brand-brown">
                              {review.user_name || "Anonymous"}
                            </h5>
                            <p className="text-[9px] text-brand-brown/30 font-bold mt-1 uppercase tracking-tighter">
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
                              size={10}
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
                        <p className="text-brand-brown/70 font-light leading-relaxed text-balance pl-0 mt-2 md:pl-14 text-xs md:text-sm">
                          &quot;{review.comment}&quot;
                        </p>
                      )}
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="flex items-center gap-4 pl-0 md:pl-14 pt-6 md:pt-8">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="w-10 h-10 rounded-full border border-brand-gold/20 flex items-center justify-center text-brand-brown disabled:opacity-20 hover:bg-brand-gold/5 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-[10px] uppercase tracking-widest font-black text-brand-brown/40">
                        {currentPage} <span className="mx-2">of</span>{" "}
                        {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-full border border-brand-gold/20 flex items-center justify-center text-brand-brown disabled:opacity-20 hover:bg-brand-gold/5 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Review Form */}
            <div className="sticky top-32 h-max">
              <form
                onSubmit={handleSubmitReview}
                className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl shadow-brand-brown/5 border border-brand-gold/5"
              >
                <h3 className="text-2xl font-serif text-brand-brown mb-2">
                  Write a Review
                </h3>
                <p className="text-xs text-brand-brown/40 font-light mb-6 md:mb-8">
                  Share your experience with this product.
                </p>

                {submitMessage && (
                  <div
                    className={`mb-6 md:mb-8 p-4 text-[10px] uppercase tracking-widest font-black rounded-xl ${
                      submitMessage.type === "success"
                        ? "bg-brand-green/10 text-brand-green"
                        : "bg-brand-terracotta/10 text-brand-terracotta"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <div className="space-y-5 md:space-y-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-4">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="transition-transform hover:scale-125"
                        >
                          <Star
                            size={24}
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
                      <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/20 font-light"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors resize-none placeholder:text-brand-brown/20 font-light"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-brown text-brand-cream py-5 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-brown-light disabled:opacity-50"
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
        <section className="py-16 px-6 overflow-hidden relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-3">
                <span className="h-[1px] w-8 bg-brand-gold" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-gold">
                  You May Also Like
                </span>
                <span className="h-[1px] w-8 bg-brand-gold" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-serif text-brand-brown tracking-tight">
                Related <span className="italic">Products</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendedProducts.map((p) => {
                const available = isProductAvailable(p);
                const unitPrice = getUnitPriceInfo(p);
                return (
                  <div
                    key={p.id}
                    className="group flex flex-col items-center text-center"
                  >
                    <Link
                      href={`/product/${p.id}`}
                      className="relative block w-full aspect-square rounded-3xl bg-brand-sand overflow-hidden mb-4 shadow-xl shadow-brand-brown/5 transition-transform duration-700 hover:scale-[1.02]"
                    >
                      <ProductImageCarousel
                        product={p}
                        imageClassName={`object-cover ${!available ? "blur-[2px] opacity-60" : ""}`}
                        sizes="25vw"
                      />
                      <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/5 transition-colors" />

                      {!available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-brown/20 backdrop-blur-[1px]">
                          <span className="bg-brand-cream/90 backdrop-blur-md text-brand-brown px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg border border-brand-gold/10">
                            Available Soon
                          </span>
                        </div>
                      )}
                    </Link>
                    <Link href={`/product/${p.id}`} className="mb-2">
                      <h4
                        className={`text-xl font-serif text-brand-brown group-hover:text-brand-terracotta transition-colors tracking-tight leading-[1.1] line-clamp-2 min-h-[2.2em] flex items-center justify-center ${!available ? "opacity-40" : ""}`}
                      >
                        {p.name}
                      </h4>
                    </Link>
                    {available ? (
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-[10px] text-brand-gold italic font-medium tracking-wide">
                          {p.weight}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-2xl font-medium text-brand-brown tracking-tighter">
                            ₹{p.price.toFixed(0)}
                          </p>
                          {unitPrice && (
                            <span className="text-[10px] text-brand-brown/30 font-light">
                              ({unitPrice})
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-10" /> // Spacer for layout consistency
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
