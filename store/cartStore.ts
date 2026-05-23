"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/lib/data";
import type { DiscountCode } from "@/lib/discountCodes";
import { normalizeDiscountCode } from "@/lib/discountCodes";
import { getDiscountedPrice } from "@/lib/pricing";
import { supabase } from "@/utils/supabase";

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderSummary {
  actualSubtotal: number;
  productDiscount: number;
  couponDiscount: {
    amount: number;
    percent: number;
    code: string | null;
  };
  subtotalAfterDiscount: number;
  shipping: number;
  convenienceFee: number;
  totalPayable: number;
}

interface CartState {
  items: CartItem[];
  appliedDiscountCode: string | null;
  appliedDiscountCoupon: DiscountCode | null;
  orderSummary: OrderSummary | null;
  addToCart: (product: Product, quantity?: number, userId?: string) => void;
  removeFromCart: (productId: string, userId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    userId?: string,
  ) => void;
  clearCart: (userId?: string) => void;
  applyDiscountCode: (coupon: DiscountCode, userId?: string) => void;
  removeDiscountCode: (userId?: string) => void;
  syncCartWithSupabase: (userId: string) => Promise<void>;
  setOrderSummary: (summary: OrderSummary | null) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const syncCartToSupabase = async (
  items: CartItem[],
  userId: string,
  appliedDiscountCoupon?: DiscountCode | null,
) => {
  try {
    const { error } = await supabase.from("carts").upsert(
      {
        user_id: userId,
        items,
        discount_code: appliedDiscountCoupon?.code ?? null,
        discount_percent: appliedDiscountCoupon?.percent ?? null,
      },
      { onConflict: "user_id" },
    );

    if (!error) return;

    if (error.code === "42703" || error.code === "PGRST204") {
      const { error: fallbackError } = await supabase
        .from("carts")
        .upsert({ user_id: userId, items }, { onConflict: "user_id" });
      if (fallbackError) {
        console.error("Error syncing cart to Supabase:", fallbackError);
      }
      return;
    }

    console.error("Error syncing cart to Supabase:", error);
  } catch (error) {
    console.error("Error syncing cart to Supabase:", error);
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedDiscountCode: null,
      appliedDiscountCoupon: null,
      orderSummary: null,

      addToCart: (product: Product, quantity: number = 1, userId?: string) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id,
          );
          const newItems = existingItem
            ? state.items.map((item) =>
                item.id === product.id
                  ? { ...product, quantity: item.quantity + quantity }
                  : item,
              )
            : [...state.items, { ...product, quantity }];

          if (userId) {
            syncCartToSupabase(newItems, userId, state.appliedDiscountCoupon);
          }

          return { items: newItems };
        });
      },

      removeFromCart: (productId: string, userId?: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);

          if (userId) {
            syncCartToSupabase(newItems, userId, state.appliedDiscountCoupon);
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
            syncCartToSupabase(newItems, userId, state.appliedDiscountCoupon);
          }

          return { items: newItems };
        });
      },

      clearCart: (userId?: string) => {
        set({
          items: [],
          appliedDiscountCode: null,
          appliedDiscountCoupon: null,
          orderSummary: null,
        });
        if (userId) {
          syncCartToSupabase([], userId, null);
        }
      },

      applyDiscountCode: (coupon: DiscountCode, userId?: string) => {
        set({
          appliedDiscountCode: coupon.code,
          appliedDiscountCoupon: coupon,
        });
        if (userId) {
          syncCartToSupabase(get().items, userId, coupon);
        }
      },

      removeDiscountCode: (userId?: string) => {
        set({ appliedDiscountCode: null, appliedDiscountCoupon: null });
        if (userId) {
          syncCartToSupabase(get().items, userId, null);
        }
      },

      syncCartWithSupabase: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("carts")
            .select("items, discount_code")
            .eq("user_id", userId)
            .single();

          if (
            error &&
            (error.code === "42703" ||
              error.code === "PGRST200" ||
              error.code === "PGRST204")
          ) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("carts")
              .select("items")
              .eq("user_id", userId)
              .single();

            if (fallbackError && fallbackError.code !== "PGRST116") {
              console.error(
                "Error fetching cart from Supabase:",
                fallbackError,
              );
              return;
            }

            if (fallbackData?.items) {
              set({ items: fallbackData.items as CartItem[] });
            }
            return;
          }

          if (error && error.code !== "PGRST116") {
            console.error("Error fetching cart from Supabase:", error);
            return;
          }

          if (data?.items) {
            set({
              items: data.items as CartItem[],
              appliedDiscountCode: data.discount_code
                ? normalizeDiscountCode(data.discount_code)
                : null,
              appliedDiscountCoupon: null,
            });
          }
        } catch (error) {
          console.error("Error fetching cart from Supabase:", error);
        }
      },

      setOrderSummary: (summary: OrderSummary | null) => {
        set({ orderSummary: summary });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + getDiscountedPrice(item) * item.quantity,
          0,
        );
      },
    }),
    {
      name: "organica-cart-storage",
    },
  ),
);
