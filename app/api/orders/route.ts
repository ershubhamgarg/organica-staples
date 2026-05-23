import type { CartItem } from "@/store/cartStore";
import type { Address } from "@/store/addressStore";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { OrderPricingDetails, PaymentDetails } from "@/store/orderStore";
import {
  getPreorderInventoryLimit,
  getPreorderRemainingQuantity,
  isPreorderMode,
} from "@/lib/preorder";

type OrderPayload = {
  userId: string | null;
  items: CartItem[];
  deliveryAddress: Address;
  paymentMethod: string;
  totalAmount: number;
  paymentDetails?: PaymentDetails;
  pricingDetails?: OrderPricingDetails;
};

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          "Guest order backend writes require SUPABASE_SERVICE_ROLE_KEY on the server.",
      },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as Partial<OrderPayload>;
  const {
    userId,
    items,
    deliveryAddress,
    paymentMethod,
    totalAmount,
    paymentDetails,
    pricingDetails,
  } = payload;

  if (!items?.length || !deliveryAddress || !paymentMethod || !totalAmount) {
    return NextResponse.json(
      { error: "Order payload is incomplete." },
      { status: 400 },
    );
  }

  if (!userId && (!deliveryAddress.email || !deliveryAddress.phone)) {
    return NextResponse.json(
      { error: "Guest orders require email and contact number." },
      { status: 400 },
    );
  }

  const isPreorder = pricingDetails?.purchaseMode === "preorder";

  if (isPreorder) {
    for (const item of items) {
      if (getPreorderRemainingQuantity(item) < item.quantity) {
        return NextResponse.json(
          {
            error: `${item.name} has only ${getPreorderRemainingQuantity(item)} pre-order units remaining.`,
          },
          { status: 409 },
        );
      }
    }

    if (!/^\d{6}$/.test(deliveryAddress.zipCode ?? "")) {
      return NextResponse.json(
        { error: "Pre-orders require a valid 6-digit delivery PIN code." },
        { status: 400 },
      );
    }
  }

  const orderData = {
    user_id: userId ?? null,
    items,
    delivery_address: deliveryAddress,
    payment_method: paymentMethod,
    payment_details: paymentDetails ?? null,
    subtotal_amount: pricingDetails?.subtotalAmount ?? null,
    discount_code: pricingDetails?.discountCode ?? null,
    discount_percent: pricingDetails?.discountPercent ?? null,
    discount_amount: pricingDetails?.discountAmount ?? null,
    shipping_amount: pricingDetails?.shippingAmount ?? null,
    convenience_fee_amount: pricingDetails?.convenienceFeeAmount ?? null,
    total_amount: totalAmount,
    preorder_status: isPreorder ? "deposit_paid" : null,
    preorder_payment_due_at: pricingDetails?.preorderPaymentDueAt ?? null,
    preorder_ship_by: pricingDetails?.preorderShipBy ?? null,
    preorder_deposit_amount: pricingDetails?.preorderDepositAmount ?? null,
    preorder_balance_amount: pricingDetails?.preorderBalanceAmount ?? null,
    preorder_milestones: isPreorder
      ? [
          {
            key: "reserved",
            label: "Stock reserved",
            date: new Date().toISOString(),
            completed: true,
          },
          {
            key: "deposit_paid",
            label: "Deposit paid",
            date: new Date().toISOString(),
            completed: true,
          },
          {
            key: "balance_due",
            label: "Balance payment due",
            date: pricingDetails?.preorderPaymentDueAt ?? null,
            completed: false,
          },
          {
            key: "packing",
            label: "Packing starts",
            date: null,
            completed: false,
          },
          {
            key: "fulfilled",
            label: "Ships by",
            date: pricingDetails?.preorderShipBy ?? null,
            completed: false,
          },
        ]
      : null,
    preorder_notifications: isPreorder
      ? [
          {
            id: crypto.randomUUID(),
            type: "email",
            title: "Pre-order confirmed",
            message:
              "Your deposit is received. We will remind you before the balance payment is due.",
            scheduled_for: new Date().toISOString(),
            sent_at: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            type: "in_app",
            title: "Balance payment reminder",
            message: "Your remaining pre-order balance is due soon.",
            scheduled_for:
              pricingDetails?.preorderPaymentDueAt ?? new Date().toISOString(),
            sent_at: null,
          },
        ]
      : null,
    status: "pending",
  };

  const legacyOrderData = {
    user_id: userId ?? null,
    items,
    delivery_address: deliveryAddress,
    payment_method: paymentMethod,
    payment_details: paymentDetails ?? null,
    total_amount: totalAmount,
    status: "pending",
  };

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) {
    if (error.code === "42703" || error.code === "PGRST204") {
      const { data: legacyData, error: legacyError } = await supabaseAdmin
        .from("orders")
        .insert([legacyOrderData])
        .select()
        .single();

      if (!legacyError) {
        return NextResponse.json({ order: legacyData });
      }
    }

    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.code === "42P01" ? 404 : 500 },
    );
  }

  if (isPreorderMode() && isPreorder) {
    await Promise.all(
      items.map((item) =>
        supabaseAdmin
          .from("preorder_inventory_events")
          .insert({
            product_id: item.id,
            order_id: data.id,
            quantity: item.quantity,
            inventory_limit: getPreorderInventoryLimit(item),
            event_type: "reserved",
          })
          .then(() => undefined),
      ),
    );

    await supabaseAdmin.from("preorder_transactions").insert({
      order_id: data.id,
      user_id: userId ?? null,
      phase: "deposit",
      amount: pricingDetails?.preorderDepositAmount ?? totalAmount,
      balance_amount: pricingDetails?.preorderBalanceAmount ?? 0,
      payment_method: paymentMethod,
      payment_details: paymentDetails ?? null,
      status: "verified",
    });
  }

  return NextResponse.json({ order: data });
}
