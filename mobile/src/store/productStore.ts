import { create } from "zustand";
import { supabase } from "@/services/supabase";
import { Product, Review } from "@/types/domain";

interface ProductState {
  products: Product[];
  reviewsByProduct: Record<string, Review[]>;
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchReviews: (productId: string) => Promise<Review[]>;
  submitReview: (
    productId: string,
    userId: string | null,
    userName: string,
    rating: number | null,
    comment: string | null,
  ) => Promise<void>;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  reviewsByProduct: {},
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({ products: (data || []) as Product[], isLoading: false });
  },

  fetchProductById: async (id) => {
    const existing = get().products.find((product) => product.id === id);
    if (existing) return existing;

    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }

    const product = data as Product;
    set((state) => ({
      products: [
        product,
        ...state.products.filter((item) => item.id !== product.id),
      ],
      isLoading: false,
    }));

    return product;
  },

  fetchReviews: async (productId) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) return [];

    const reviews = (data || []) as Review[];
    set((state) => ({
      reviewsByProduct: { ...state.reviewsByProduct, [productId]: reviews },
    }));
    return reviews;
  },

  submitReview: async (productId, userId, userName, rating, comment) => {
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: userId,
      user_name: userName || "Anonymous",
      rating,
      comment,
    });

    if (error) throw error;
    await get().fetchReviews(productId);
  },
}));
