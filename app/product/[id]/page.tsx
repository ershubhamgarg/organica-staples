"use client";

import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Truck,
  Leaf,
  Minus,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState, use, useMemo } from "react";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import QuickAddButton from "@/components/QuickAddButton";
import { Product } from "@/lib/data";
import { supabase } from "@/utils/supabase";
import {
  getDiscountedPrice,
  getDiscountPercent,
  hasHighProductDiscount,
  hasProductDiscount,
} from "@/lib/pricing";

const REVIEWS_PER_PAGE = 3;

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
  const [reviews, setReviews] = useState<any[]>([]);
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
      if (isActive && fetchedProduct) {
        setProduct(fetchedProduct);
        setHasFetched(true);

        // Fetch reviews from Supabase
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
      .filter((p) => p.id !== product.id && p.category === product.category)
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

    const reviewsWithRating = reviews.filter((r) => r.rating);
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

    // Check if at least one field is provided (rating or comment)
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

      // Refresh reviews list
      const { data: refreshedReviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (refreshedReviews) setReviews(refreshedReviews);
    } catch (err: any) {
      setSubmitMessage({
        type: "error",
        text: err.message || "Failed to submit feedback.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="bg-white rounded-3xl shadow-sm border border-brand-cream p-12 text-center">
            <h1 className="text-2xl font-serif text-stone-900 mb-2">
              Product not found
            </h1>
            <p className="text-stone-500">
              {error || "This product is unavailable."}
            </p>
            <Link
              href="/#shop"
              className="mt-6 inline-flex items-center gap-2 bg-brand-brown text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-brand-brown-light transition-colors"
            >
              Browse Shop
            </Link>
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
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          {/* Product Image & Info - Left Column (5/12) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-24 space-y-8">
              <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-cream">
                <ProductImageCarousel
                  product={product}
                  imageClassName="object-cover transition-transform duration-700"
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                {hasDiscount && (
                  <div
                    className={`absolute left-6 top-6 shadow-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                      hasHighDiscount
                        ? "bg-brand-gold text-stone-950 ring-2 ring-white"
                        : "bg-brand-green text-white"
                    }`}
                  >
                    {hasHighDiscount ? "Mega Deal" : `${discountPercent}% Off`}
                  </div>
                )}
              </div>

              {/* Nutritional Content Section - Moved here for better balance */}
              <div className="bg-white rounded-3xl border border-brand-cream p-8 shadow-sm">
                <h4 className="text-sm font-bold text-stone-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                  <Leaf className="text-brand-green" size={18} />
                  Nutritional Value
                  <span className="text-[10px] text-stone-400 font-normal lowercase tracking-normal">
                    (per 100g)
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Energy", value: "364 kcal" },
                    { label: "Protein", value: "12.5g" },
                    { label: "Carbs", value: "71.2g" },
                    { label: "Fibre", value: "10.8g" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-4 bg-brand-cream/20 rounded-2xl border border-brand-cream/50"
                    >
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1 font-bold">
                        {stat.label}
                      </p>
                      <p className="text-base font-bold text-brand-brown">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details - Right Column (7/12) */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            <div className="bg-white rounded-3xl border border-brand-cream p-8 md:p-10 shadow-sm">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-brand-cream text-brand-brown text-[10px] font-bold rounded-full mb-4 uppercase tracking-[0.2em]">
                  {product.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.round(averageRating)
                            ? "fill-brand-gold text-brand-gold"
                            : "text-stone-200"
                        }
                      />
                    ))}
                    <span className="ml-2 text-sm font-bold text-stone-900">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <a
                    href="#reviews"
                    className="text-xs text-stone-500 font-medium hover:text-brand-green hover:underline transition-colors border-l border-stone-200 pl-4"
                  >
                    {reviewCount} customer reviews
                  </a>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-bold text-brand-green">
                        ₹{discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-xl text-stone-300 line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                        -{discountPercent}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-4xl font-bold text-brand-green">
                      ₹{product.price.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="prose prose-stone mb-6">
                <p className="text-stone-600 leading-relaxed text-lg font-light">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-brand-cream/20 rounded-2xl border border-brand-cream p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-brand-green rounded-xl shadow-sm">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Origin
                    </h4>
                    <p className="text-sm text-stone-900 font-bold">
                      {product.origin}
                    </p>
                  </div>
                </div>
                <div className="bg-brand-cream/20 rounded-2xl border border-brand-cream p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-brand-green rounded-xl shadow-sm">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Weight
                    </h4>
                    <p className="text-sm text-stone-900 font-bold">
                      {product.weight}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-brand-brown/10 rounded-2xl bg-brand-cream/10 h-14 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-full text-stone-400 hover:text-brand-green hover:bg-white rounded-xl transition-all flex items-center justify-center"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-full text-stone-400 hover:text-brand-green hover:bg-white rounded-xl transition-all flex items-center justify-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 h-14 uppercase tracking-widest text-xs ${
                      added
                        ? "bg-brand-green text-white shadow-brand-green/20"
                        : "bg-brand-brown hover:bg-brand-brown-light text-white shadow-lg shadow-brand-brown/20 hover:shadow-xl"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={20} /> Added to Cart
                      </>
                    ) : (
                      "Add to Cart"
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 bg-stone-50 rounded-2xl py-4 border border-stone-100">
                  <Truck size={18} className="text-brand-green" /> Free shipping
                  on orders over ₹500
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-brand-cream p-8 shadow-sm">
              <h4 className="text-sm font-bold text-stone-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Check className="text-brand-green" size={18} />
                Key Benefits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(product.benefits || []).map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-brand-cream/10 rounded-2xl border border-brand-cream/30"
                  >
                    <div className="w-2 h-2 bg-brand-green rounded-full flex-shrink-0" />
                    <span className="text-sm text-stone-600 font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Rating & Review Form */}
            <div className="bg-white rounded-3xl border border-brand-cream p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                  <Star size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest">
                    Share Your Feedback
                  </h4>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-1">
                    Rating and review are optional
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-3">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setNewRating(newRating === star ? null : star)
                        }
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          size={28}
                          className={
                            star <= (newRating || 0)
                              ? "fill-brand-gold text-brand-gold"
                              : "text-stone-200"
                          }
                        />
                      </button>
                    ))}
                    {newRating && (
                      <span className="ml-2 text-sm font-bold text-brand-gold">
                        {newRating}/5
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. John Doe (Optional)"
                    className="w-full px-4 py-3 bg-brand-cream/10 border border-brand-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell others about your experience (Optional)"
                    rows={4}
                    className="w-full px-4 py-3 bg-brand-cream/10 border border-brand-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-sm transition-all resize-none"
                  />
                </div>

                {submitMessage && (
                  <div
                    className={`p-4 rounded-xl text-xs font-medium ${
                      submitMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand-brown hover:bg-brand-brown-light text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-brand-brown/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Feedback <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div id="reviews" className="mb-24 scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                    <MessageCircle size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-green">
                    Testimonials
                  </span>
                </div>
                <h2 className="text-4xl font-serif text-stone-900">
                  Customer Reviews
                </h2>
              </div>
              <div className="flex items-center gap-6 bg-white px-8 py-6 rounded-3xl border border-brand-cream shadow-sm">
                <div className="text-center border-r border-stone-100 pr-6">
                  <span className="block text-4xl font-bold text-stone-900 mb-1">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    Average Rating
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.round(averageRating)
                            ? "fill-brand-gold text-brand-gold"
                            : "text-stone-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    Based on {reviewCount} reviews
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              {paginatedReviews.map((review) => {
                const isCurrentUserReview =
                  user?.id && review.user_id === user.id;

                return (
                  <div
                    key={review.id}
                    className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                      isCurrentUserReview
                        ? "border-brand-green ring-1 ring-brand-green/20"
                        : "border-brand-cream"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-cream rounded-full flex items-center justify-center text-brand-brown font-bold text-sm relative">
                          {review.user_name?.[0] || "A"}
                          {isCurrentUserReview && (
                            <div className="absolute -top-1 -right-1 bg-brand-green text-white rounded-full p-0.5 border-2 border-white">
                              <Check size={8} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-stone-900">
                              {review.user_name}
                            </h4>
                            {isCurrentUserReview && (
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-brand-green/10 text-brand-green px-2 py-0.5 rounded">
                                Your Review
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {review.rating && (
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < review.rating
                                  ? "fill-brand-gold text-brand-gold"
                                  : "text-stone-200"
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-stone-600 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-brand-cream hover:bg-brand-cream disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-stone-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-brand-cream hover:bg-brand-cream disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* More Products Section */}
        {recommendedProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] flex-1 bg-brand-cream"></div>
              <h2 className="text-2xl font-serif text-brand-brown px-4">
                More products for you
              </h2>
              <div className="h-[1px] flex-1 bg-brand-cream"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((p) => {
                const discPrice = getDiscountedPrice(p);
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="group bg-white rounded-2xl border border-brand-cream overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-video">
                      <ProductImageCarousel
                        product={p}
                        imageClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <div className="flex justify-center items-center gap-1.5 mb-2">
                        <div className="flex items-center gap-0.5 text-brand-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i < Math.round(p.rating || 0)
                                  ? "fill-brand-gold text-brand-gold"
                                  : "text-stone-200"
                              }
                            />
                          ))}
                        </div>
                        {(p.review_count || 0) > 0 && (
                          <span className="text-[9px] text-stone-400 font-medium">
                            ({p.review_count})
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-serif text-stone-900 mb-2 group-hover:text-brand-brown transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-brand-green font-bold">
                        ₹{discPrice.toFixed(2)}
                      </p>
                      <div className="mt-3">
                        <QuickAddButton product={p} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
