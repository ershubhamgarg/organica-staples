import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCartTotals } from "@/lib/pricing";
import { supabase } from "@/services/supabase";
import { CartItem, Product } from "@/types/domain";

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

async function syncCartToSupabase(items: CartItem[], userId: string) {
  try {
    await supabase
      .from("carts")
      .upsert({ user_id: userId, items }, { onConflict: "user_id" });
  } catch (error) {
    console.warn("Cart sync failed", error);
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity = 1, userId) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          const items = existingItem
            ? state.items.map((item) =>
                item.id === product.id
                  ? { ...product, quantity: item.quantity + quantity }
                  : item,
              )
            : [...state.items, { ...product, quantity }];

          if (userId) syncCartToSupabase(items, userId);
          return { items };
        });
      },

      removeFromCart: (productId, userId) => {
        set((state) => {
          const items = state.items.filter((item) => item.id !== productId);
          if (userId) syncCartToSupabase(items, userId);
          return { items };
        });
      },

      updateQuantity: (productId, quantity, userId) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, userId);
          return;
        }

        set((state) => {
          const items = state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item,
          );
          if (userId) syncCartToSupabase(items, userId);
          return { items };
        });
      },

      clearCart: (userId) => {
        set({ items: [] });
        if (userId) syncCartToSupabase([], userId);
      },

      syncCartWithSupabase: async (userId) => {
        const { data, error } = await supabase
          .from("carts")
          .select("items")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") return;
        if (data?.items) set({ items: data.items as CartItem[] });
      },

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => getCartTotals(get().items).subtotal,
    }),
    {
      name: "amritya-mobile-cart",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
