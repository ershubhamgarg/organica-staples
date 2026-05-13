import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "@/services/supabase";
import { Address, CartItem, Order } from "@/types/domain";

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (userId: string) => Promise<void>;
  placeOrder: (
    userId: string,
    items: CartItem[],
    deliveryAddress: Address,
    paymentMethod: string,
    totalAmount: number,
  ) => Promise<Order>;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,

      fetchOrders: async (userId) => {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          if (error.code === "42P01") {
            set({ orders: [], isLoading: false });
            return;
          }
          set({ error: error.message, isLoading: false });
          return;
        }

        set({ orders: (data || []) as Order[], isLoading: false });
      },

      placeOrder: async (
        userId,
        items,
        deliveryAddress,
        paymentMethod,
        totalAmount,
      ) => {
        set({ isLoading: true, error: null });
        const payload = {
          user_id: userId,
          items,
          delivery_address: deliveryAddress,
          payment_method: paymentMethod,
          total_amount: totalAmount,
          status: "pending" as const,
        };

        const { data, error } = await supabase
          .from("orders")
          .insert([payload])
          .select()
          .single();

        if (error) {
          if (error.code === "42P01") {
            const order = {
              id: Math.random().toString(36).slice(2),
              ...payload,
              created_at: new Date().toISOString(),
            };
            set({ orders: [order, ...get().orders], isLoading: false });
            return order;
          }
          set({ error: error.message, isLoading: false });
          throw error;
        }

        const order = data as Order;
        set({ orders: [order, ...get().orders], isLoading: false });
        return order;
      },

      clearOrders: () => set({ orders: [], error: null }),
    }),
    {
      name: "amritya-mobile-orders",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
