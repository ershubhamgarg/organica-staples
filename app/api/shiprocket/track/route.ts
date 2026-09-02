import { getShiprocketTracking, normalizeTrackingStatus } from "@/lib/shiprocket";
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
      { error: "Order tracking requires Supabase server configuration." },
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
      { error: "Please sign in to track this order." },
      { status: 401 },
    );
  }

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(bearerToken);

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to track this order." },
      { status: 401 },
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, user_id, shiprocket_awb_code, shiprocket_courier_name, shiprocket_tracking_url, shipping_status, shipping_error, delivered_at",
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
      { error: "You can only track your own orders." },
      { status: 403 },
    );
  }

  if (!order.shiprocket_awb_code) {
    return NextResponse.json({
      tracking: {
        awbCode: null,
        courierName: order.shiprocket_courier_name,
        currentStatus: order.shipping_status ?? "pending",
        deliveredAt: order.delivered_at,
        expectedDeliveryDate: null,
        trackingUrl: order.shiprocket_tracking_url,
        activities: [],
      },
    });
  }

  try {
    const tracking = await getShiprocketTracking(order.shiprocket_awb_code);
    const shippingStatus = normalizeTrackingStatus(tracking.currentStatus);
    const orderStatus =
      shippingStatus === "delivered"
        ? "delivered"
        : shippingStatus === "cancelled"
          ? "cancelled"
          : "shipped";

    await supabaseAdmin
      .from("orders")
      .update({
        shiprocket_courier_name:
          tracking.courierName ?? order.shiprocket_courier_name,
        shiprocket_tracking_url:
          tracking.trackingUrl ?? order.shiprocket_tracking_url,
        shipping_status: shippingStatus,
        shipping_error: null,
        delivered_at:
          shippingStatus === "delivered"
            ? (tracking.deliveredAt ?? new Date().toISOString())
            : order.delivered_at,
        status: orderStatus,
      })
      .eq("id", orderId);

    return NextResponse.json({ tracking: { ...tracking, shippingStatus } });
  } catch (trackingError) {
    const message =
      trackingError instanceof Error
        ? trackingError.message
        : "Unable to fetch Shiprocket tracking right now.";

    return NextResponse.json(
      {
        tracking: {
          awbCode: order.shiprocket_awb_code,
          courierName: order.shiprocket_courier_name,
          currentStatus: order.shipping_status ?? "awb_assigned",
          deliveredAt: order.delivered_at,
          expectedDeliveryDate: null,
          trackingUrl: order.shiprocket_tracking_url,
          activities: [],
        },
        error: message,
      },
      { status: 200 },
    );
  }
}
