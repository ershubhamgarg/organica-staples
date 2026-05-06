"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/lib/data";
import { supabase } from "@/utils/supabase";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, userId?: string) => void;
  removeFromCart: (productId: string, userId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    userId?: string,
  ) => void;
  clearCart: (userId?: string) => void;
  syncCartWithSupabase: (userId: string) => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const syncCartToSupabase = async (items: CartItem[], userId: string) => {
  try {
    const { error } = await supabase
      .from("carts")
      .upsert({ user_id: userId, items: items }, { onConflict: "user_id" });
    if (error) console.error("Error syncing cart to Supabase:", error);
  } catch (error) {
    console.error("Error syncing cart to Supabase:", error);
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product: Product, quantity: number = 1, userId?: string) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id,
          );
          const newItems = existingItem
            ? state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [...state.items, { ...product, quantity }];

          if (userId) {
            syncCartToSupabase(newItems, userId);
          }

          return { items: newItems };
        });
      },

      removeFromCart: (productId: string, userId?: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);

          if (userId) {
            syncCartToSupabase(newItems, userId);
          }

          return { items: newItems };
        });
      },

      updateQuantity: (
        productId: string,
        quantity: number,
        userId?: string,
      ) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, userId);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item,
          );

          if (userId) {
            syncCartToSupabase(newItems, userId);
          }

          return { items: newItems };
        });
      },

      clearCart: (userId?: string) => {
        set({ items: [] });
        if (userId) {
          syncCartToSupabase([], userId);
        }
      },

      syncCartWithSupabase: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("carts")
            .select("items")
            .eq("user_id", userId)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Error fetching cart from Supabase:", error);
            return;
          }

          if (data?.items) {
            set({ items: data.items as CartItem[] });
          }
        } catch (error) {
          console.error("Error fetching cart from Supabase:", error);
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "organica-cart-storage",
    },
  ),
);
