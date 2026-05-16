"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/utils/supabase";
import { CartItem } from "./cartStore";
import { Address } from "./addressStore";

export interface Order {
  id: string;
  user_id: string | null;
  items: CartItem[];
  delivery_address: Address;
  payment_method: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (userId: string) => Promise<void>;
  placeOrder: (
    userId: string | null,
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
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false });
        }
      },

      placeOrder: async (
        userId: string | null,
        items: CartItem[],
        deliveryAddress: Address,
        paymentMethod: string,
        totalAmount: number,
      ) => {
        set({ isLoading: true, error: null });
        const saveLocalOrder = (
          newOrderData: Omit<Order, "id" | "created_at">,
        ) => {
          const localOrder = {
            id: crypto.randomUUID(),
            ...newOrderData,
            created_at: new Date().toISOString(),
          };
          set({ orders: [localOrder, ...get().orders], isLoading: false });
          return localOrder;
        };

        try {
          const newOrderData = {
            user_id: userId,
            items,
            delivery_address: deliveryAddress,
            payment_method: paymentMethod,
            total_amount: totalAmount,
            status: "pending" as const,
          };

          if (!userId) {
            const response = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                items,
                deliveryAddress,
                paymentMethod,
                totalAmount,
              }),
            });

            const result = await response.json();

            if (!response.ok) {
              if (result.code === "42P01") {
                console.warn("Orders table missing. Saving to local state only.");
                return saveLocalOrder(newOrderData);
              }

              throw new Error(result.error || "Failed to place guest order.");
            }

            set({
              orders: [result.order, ...get().orders],
              isLoading: false,
            });

            return result.order;
          }

          const { data, error } = await supabase
            .from("orders")
            .insert([newOrderData])
            .select()
            .single();

          if (error) {
            if (error.code === "42P01") {
              console.warn("Orders table missing. Saving to local state only.");
              return saveLocalOrder(newOrderData);
            }
            throw error;
          }

          set({
            orders: [data, ...get().orders],
            isLoading: false,
          });

          return data;
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false });
          throw error; // Re-throw to handle it in the component if necessary
        }
      },

      clearOrders: () => {
        set({ orders: [], error: null });
      },
    }),
    {
      name: "organica-order-storage",
    },
  ),
);
