"use client";

import { create } from "zustand";
import { Product } from "@/lib/data";

type ProductsResponse = {
  products?: Product[];
  product?: Product | null;
  error?: string;
};

interface ProductState {
  products: Product[];
  isLoading: boolean;
  /**
   * True once a catalogue fetch has finished, successfully or not.
   * `isLoading` alone can't tell "nothing loaded yet" from "loaded and
   * genuinely empty" — it's false on the very first render, before the
   * fetching effect runs, which made filtered views flash an empty state
   * before their products arrived. Consumers gate skeletons on this.
   */
  hasLoaded: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    const response = await fetch("/api/products", { cache: "no-store" });
    const result = (await response.json()) as ProductsResponse;

    if (!response.ok) {
      set({
        error: result.error ?? "Unable to fetch products.",
        isLoading: false,
        hasLoaded: true,
      });
      return;
    }

    set({ products: result.products ?? [], isLoading: false, hasLoaded: true });
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    const response = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const result = (await response.json()) as ProductsResponse;

    if (!response.ok || !result.product) {
      set({
        error: result.error ?? "Unable to fetch product.",
        isLoading: false,
      });
      return null;
    }

    set((state) => ({
      products: [
        result.product as Product,
        ...state.products.filter((product) => product.id !== result.product?.id),
      ],
      isLoading: false,
    }));

    return result.product;
  },
}));
