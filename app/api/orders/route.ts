import type { CartItem } from "@/store/cartStore";
import type { Address } from "@/store/addressStore";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { OrderPricingDetails, PaymentDetails } from "@/store/orderStore";

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

  const orderData = {
    user_id: userId ?? null,
    items,
    delivery_address: deliveryAddress,
    payment_method: paymentMethod,
    payment_details: paymentDetails ?? null,
    subtotal_amount: pricingDetails?.subtotalAmount ?? 0,
    discount_code: pricingDetails?.discountCode ?? null,
    discount_percent: pricingDetails?.discountPercent ?? null,
    product_discount_amount: pricingDetails?.productDiscountAmount ?? 0,
    coupon_discount_amount: pricingDetails?.couponDiscountAmount ?? 0,
    discount_amount:
      (pricingDetails?.productDiscountAmount ?? 0) +
      (pricingDetails?.couponDiscountAmount ?? 0),
    shipping_amount: pricingDetails?.shippingAmount ?? 0,
    convenience_fee_amount: pricingDetails?.convenienceFeeAmount ?? 0,
    cod_amount: pricingDetails?.codAmount ?? 0,
    total_amount: totalAmount,
    status: "pending",
  };

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.code === "42P01" ? 404 : 500 },
    );
  }

  return NextResponse.json({ order: data });
}
