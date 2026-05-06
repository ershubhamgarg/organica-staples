"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/utils/supabase";
import { CartItem } from "./cartStore";
import { Address } from "./addressStore";

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  delivery_address: Address;
  payment_method: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

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
    totalAmount: number
  ) => Promise<void>;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,

      fetchOrders: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) {
            if (error.code === "42P01") {
              // relation does not exist - fallback for development
              set({ orders: [], isLoading: false });
              return;
            }
            throw error;
          }

          set({ orders: data || [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      placeOrder: async (
        userId: string,
        items: CartItem[],
        deliveryAddress: Address,
        paymentMethod: string,
        totalAmount: number
      ) => {
        set({ isLoading: true, error: null });
        try {
          const newOrderData = {
            user_id: userId,
            items,
            delivery_address: deliveryAddress,
            payment_method: paymentMethod,
            total_amount: totalAmount,
            status: "pending",
          };

          const { data, error } = await supabase
            .from("orders")
            .insert([newOrderData])
            .select()
            .single();

          if (error) {
            if (error.code === "42P01") {
              // relation does not exist - fallback for development
              console.warn("Orders table missing. Saving to local state only.");
              const localOrder = {
                id: crypto.randomUUID(),
                ...newOrderData,
                status: "pending" as const,
                created_at: new Date().toISOString(),
              };
              set({ orders: [localOrder, ...get().orders], isLoading: false });
              return;
            }
            throw error;
          }

          set({
            orders: [data, ...get().orders],
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error; // Re-throw to handle it in the component if necessary
        }
      },

      clearOrders: () => {
        set({ orders: [], error: null });
      },
    }),
    {
      name: "organica-order-storage",
    }
  )
);
