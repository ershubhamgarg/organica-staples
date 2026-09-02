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
  product_discount_amount?: number | null;
  coupon_discount_amount?: number | null;
  discount_amount?: number | null;
  shipping_amount?: number | null;
  extra_shipping_amount?: number | null;
  convenience_fee_amount?: number | null;
  cod_amount?: number | null;
  wholesale_total_amount?: number | null;
  cost_to_company?: number | null;
  profit_loss?: number | null;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shiprocket_order_id?: string | null;
  shiprocket_shipment_id?: string | null;
  shiprocket_awb_code?: string | null;
  shiprocket_courier_name?: string | null;
  shiprocket_tracking_url?: string | null;
  shipping_status?:
    | "pending"
    | "not_configured"
    | "sync_failed"
    | "created"
    | "awb_assigned"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | string
    | null;
  shipping_error?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  invoice_number?: string | null;
  invoice_generated_at?: string | null;
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
  payment_phase?: "deposit" | "balance" | "full";
  remaining_balance?: number;
};

export type OrderPricingDetails = {
  subtotalAmount: number;
  productDiscountAmount: number;
  discountCode: string | null;
  discountPercent: number;
  couponDiscountAmount: number;
  shippingAmount: number;
  extraShippingAmount?: number;
  convenienceFeeAmount: number;
  codAmount?: number;
  freightCharge?: number;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const getOrderApiErrorMessage = (error?: string, code?: string) => {
  if (code === "23505") {
    return "This email has already claimed the one-time launch offer. You can still place a regular order from your cart.";
  }

  return error || "Failed to place order.";
};

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

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(session?.access_token
                ? { Authorization: `Bearer ${session.access_token}` }
                : {}),
            },
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

          const result = (await response.json()) as {
            order?: Order;
            error?: string;
            code?: string;
          };

          if (!response.ok || !result.order) {
            throw new Error(getOrderApiErrorMessage(result.error, result.code));
          }

          set({
            orders: [result.order, ...get().orders],
            isLoading: false,
          });

          const { useProductStore } = await import("./productStore");
          await useProductStore.getState().fetchProducts();

          return result.order;
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
