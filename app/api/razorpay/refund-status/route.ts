import { getRazorpayRefundStatus } from "@/lib/razorpay";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Refund status requires Supabase server configuration." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!orderId) {
    return NextResponse.json({ error: "Order id is required." }, { status: 400 });
  }

  if (!bearerToken) {
    return NextResponse.json(
      { error: "Please sign in to check refund status." },
      { status: 401 },
    );
  }

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(bearerToken);

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to check refund status." },
      { status: 401 },
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, user_id, status, payment_method, payment_details, refund_status, refund_amount, razorpay_refund_id, refunded_at",
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: error?.message ?? "Order was not found." },
      { status: 404 },
    );
  }

  if (order.user_id !== user.id) {
    return NextResponse.json(
      { error: "You can only check refunds for your own orders." },
      { status: 403 },
    );
  }

  if (order.status !== "cancelled" || order.payment_method !== "razorpay") {
    return NextResponse.json(
      { error: "This order has no refund to check." },
      { status: 400 },
    );
  }

  const paymentId = (order.payment_details as { provider_payment_id?: string } | null)
    ?.provider_payment_id;

  if (!paymentId) {
    return NextResponse.json(
      { error: "No payment record found for this order." },
      { status: 400 },
    );
  }

  try {
    const refund = await getRazorpayRefundStatus(paymentId);

    await supabaseAdmin
      .from("orders")
      .update({
        razorpay_refund_id: refund.refundId,
        refund_status: refund.status,
        refund_amount: refund.amount,
        refunded_at: refund.refundedAt,
        refund_checked_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.json({ refund });
  } catch (refundError) {
    const message =
      refundError instanceof Error
        ? refundError.message
        : "Unable to fetch refund status right now.";

    return NextResponse.json(
      {
        refund: {
          refundId: order.razorpay_refund_id,
          status: order.refund_status ?? "not_initiated",
          amount: order.refund_amount,
          refundedAt: order.refunded_at,
        },
        error: message,
      },
      { status: 200 },
    );
  }
}
