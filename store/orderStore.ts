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
  cod_amount?: number | null;
  total_amount: number;
  preorder_status?:
    | "reserved"
    | "deposit_paid"
    | "balance_due"
    | "paid"
    | "packing"
    | "fulfilled"
    | "cancelled"
    | null;
  preorder_payment_due_at?: string | null;
  preorder_ship_by?: string | null;
  preorder_deposit_amount?: number | null;
  preorder_balance_amount?: number | null;
  preorder_milestones?: PreorderMilestone[] | null;
  preorder_notifications?: PreorderNotification[] | null;
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
  payment_phase?: "deposit" | "balance" | "full";
  remaining_balance?: number;
};

export type OrderPricingDetails = {
  subtotalAmount: number;
  discountCode: string | null;
  discountPercent: number;
  discountAmount: number;
  shippingAmount: number;
  convenienceFeeAmount: number;
  codAmount?: number;
  purchaseMode?: "standard" | "preorder";
  preorderSubtotal?: number;
  preorderDepositAmount?: number;
  preorderBalanceAmount?: number;
  preorderPaymentDueAt?: string | null;
  preorderShipBy?: string | null;
};

export type PreorderMilestone = {
  key: "reserved" | "deposit_paid" | "balance_due" | "packing" | "fulfilled";
  label: string;
  date: string | null;
  completed: boolean;
};

export type PreorderNotification = {
  id: string;
  type: "email" | "in_app";
  title: string;
  message: string;
  scheduled_for: string;
  sent_at: string | null;
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
            cod_amount: pricingDetails?.codAmount ?? null,
            total_amount: totalAmount,
            preorder_status:
              pricingDetails?.purchaseMode === "preorder"
                ? ("deposit_paid" as const)
                : null,
            preorder_payment_due_at:
              pricingDetails?.preorderPaymentDueAt ?? null,
            preorder_ship_by: pricingDetails?.preorderShipBy ?? null,
            preorder_deposit_amount:
              pricingDetails?.preorderDepositAmount ?? null,
            preorder_balance_amount:
              pricingDetails?.preorderBalanceAmount ?? null,
            preorder_milestones:
              pricingDetails?.purchaseMode === "preorder"
                ? [
                    {
                      key: "reserved" as const,
                      label: "Stock reserved",
                      date: new Date().toISOString(),
                      completed: true,
                    },
                    {
                      key: "deposit_paid" as const,
                      label: "Deposit paid",
                      date: new Date().toISOString(),
                      completed: true,
                    },
                    {
                      key: "balance_due" as const,
                      label: "Balance payment due",
                      date: pricingDetails?.preorderPaymentDueAt ?? null,
                      completed: false,
                    },
                    {
                      key: "packing" as const,
                      label: "Packing starts",
                      date: null,
                      completed: false,
                    },
                    {
                      key: "fulfilled" as const,
                      label: "Ships by",
                      date: pricingDetails?.preorderShipBy ?? null,
                      completed: false,
                    },
                  ]
                : null,
            preorder_notifications:
              pricingDetails?.purchaseMode === "preorder"
                ? [
                    {
                      id: crypto.randomUUID(),
                      type: "email" as const,
                      title: "Pre-order confirmed",
                      message:
                        "Your deposit is received. We will remind you before the balance payment is due.",
                      scheduled_for: new Date().toISOString(),
                      sent_at: new Date().toISOString(),
                    },
                    {
                      id: crypto.randomUUID(),
                      type: "in_app" as const,
                      title: "Balance payment reminder",
                      message:
                        "Your remaining pre-order balance is due soon.",
                      scheduled_for:
                        pricingDetails?.preorderPaymentDueAt ??
                        new Date().toISOString(),
                      sent_at: null,
                    },
                  ]
                : null,
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
                console.warn(
                  "Orders table missing. Saving to local state only.",
                );
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

          if (pricingDetails?.purchaseMode === "preorder") {
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

            if (response.ok) {
              set({
                orders: [result.order, ...get().orders],
                isLoading: false,
              });

              return result.order;
            }

            if (
              result.code !== "42P01" &&
              !String(result.error ?? "").includes("SUPABASE_SERVICE_ROLE_KEY")
            ) {
              throw new Error(result.error || "Failed to place pre-order.");
            }
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
