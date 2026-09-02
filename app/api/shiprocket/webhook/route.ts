import { normalizeTrackingStatus } from "@/lib/shiprocket";
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

type OrderMatchRow = {
  id: string;
  shiprocket_courier_name: string | null;
  shiprocket_tracking_url: string | null;
  shipping_status: string | null;
  delivered_at: string | null;
};

const ORDER_MATCH_COLUMNS =
  "id, shiprocket_courier_name, shiprocket_tracking_url, shipping_status, delivered_at";

// Shiprocket's webhook payload shape isn't consistently documented across
// their webhook types, so every field below is read defensively under
// several plausible names rather than assuming one fixed schema.
function readString(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Order tracking requires Supabase server configuration." },
      { status: 500 },
    );
  }

  const expectedSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "SHIPROCKET_WEBHOOK_SECRET is not configured on the server." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const providedSecret =
    searchParams.get("secret") ??
    request.headers.get("x-api-key") ??
    request.headers.get("x-webhook-secret");

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Logged so real payload field names can be confirmed against Shiprocket's
  // actual webhook delivery the first time it fires — their schema isn't
  // fully published, so this is the fallback way to verify field names.
  console.log("[shiprocket webhook] payload:", JSON.stringify(payload));

  const awbCode = readString(payload, ["awb", "awb_code"]);
  const shiprocketOrderId = readString(payload, ["order_id", "sr_order_id"]);
  const channelOrderId = readString(payload, ["channel_order_id", "channel_order_no"]);
  const statusText = readString(payload, [
    "current_status",
    "shipment_status",
    "status",
    "order_status",
  ]);

  if (!awbCode && !shiprocketOrderId && !channelOrderId) {
    return NextResponse.json(
      { error: "Payload did not include an AWB, order id, or channel order id to match against." },
      { status: 400 },
    );
  }

  let order: OrderMatchRow | null = null;

  if (awbCode) {
    const { data } = await supabaseAdmin
      .from("orders")
      .select(ORDER_MATCH_COLUMNS)
      .eq("shiprocket_awb_code", awbCode)
      .maybeSingle();
    order = data;
  }
  if (!order && shiprocketOrderId) {
    const { data } = await supabaseAdmin
      .from("orders")
      .select(ORDER_MATCH_COLUMNS)
      .eq("shiprocket_order_id", shiprocketOrderId)
      .maybeSingle();
    order = data;
  }
  if (!order && channelOrderId) {
    const { data } = await supabaseAdmin
      .from("orders")
      .select(ORDER_MATCH_COLUMNS)
      .eq("id", channelOrderId)
      .maybeSingle();
    order = data;
  }

  if (!order) {
    return NextResponse.json({ error: "No matching order found." }, { status: 404 });
  }

  const shippingStatus = normalizeTrackingStatus(statusText);
  const orderStatus =
    shippingStatus === "delivered"
      ? "delivered"
      : shippingStatus === "cancelled"
        ? "cancelled"
        : "shipped";

  await supabaseAdmin
    .from("orders")
    .update({
      shipping_status: shippingStatus,
      shipping_error: null,
      delivered_at:
        shippingStatus === "delivered"
          ? new Date().toISOString()
          : order.delivered_at,
      status: orderStatus,
    })
    .eq("id", order.id);

  return NextResponse.json({ ok: true });
}
