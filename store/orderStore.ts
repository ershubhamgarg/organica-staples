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
  payment_details?: PaymentDetails | null;
  subtotal_amount?: number | null;
  discount_code?: string | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  shipping_amount?: number | null;
  convenience_fee_amount?: number | null;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

export type PaymentDetails = {
  provider: "razorpay";
  provider_order_id: string;
  provider_payment_id: string;
  provider_signature: string;
  amount: number;
  currency: string;
  status: "verified";
  verified_at: string;
  method?: string;
};

export type OrderPricingDetails = {
  subtotalAmount: number;
  discountCode: string | null;
  discountPercent: number;
  discountAmount: number;
  shippingAmount: number;
  convenienceFeeAmount: number;
};

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
    paymentDetails?: PaymentDetails,
    pricingDetails?: OrderPricingDetails,
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
        paymentDetails?: PaymentDetails,
        pricingDetails?: OrderPricingDetails,
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
            payment_details: paymentDetails ?? null,
            subtotal_amount: pricingDetails?.subtotalAmount ?? null,
            discount_code: pricingDetails?.discountCode ?? null,
            discount_percent: pricingDetails?.discountPercent ?? null,
            discount_amount: pricingDetails?.discountAmount ?? null,
            shipping_amount: pricingDetails?.shippingAmount ?? null,
            convenience_fee_amount:
              pricingDetails?.convenienceFeeAmount ?? null,
            total_amount: totalAmount,
            status: "pending" as const,
          };
          const legacyOrderData = {
            user_id: userId,
            items,
            delivery_address: deliveryAddress,
            payment_method: paymentMethod,
            payment_details: paymentDetails ?? null,
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
                paymentDetails,
                pricingDetails,
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
            if (error.code === "42703" || error.code === "PGRST204") {
              const { data: legacyData, error: legacyError } = await supabase
                .from("orders")
                .insert([legacyOrderData])
                .select()
                .single();

              if (!legacyError) {
                set({
                  orders: [legacyData, ...get().orders],
                  isLoading: false,
                });
                return legacyData;
              }
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
