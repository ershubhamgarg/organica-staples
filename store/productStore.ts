"use client";

import { create } from "zustand";
import { Product } from "@/lib/data";
import { supabase } from "@/utils/supabase";

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    set({ products: data || [], isLoading: false });
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }

    set((state) => ({
      products: [
        data,
        ...state.products.filter((product) => product.id !== data.id),
      ],
      isLoading: false,
    }));

    return data;
  },
}));
