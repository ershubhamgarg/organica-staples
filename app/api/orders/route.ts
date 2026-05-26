import type { CartItem } from "@/store/cartStore";
import type { Address } from "@/store/addressStore";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { OrderPricingDetails, PaymentDetails } from "@/store/orderStore";
import type { Order } from "@/store/orderStore";
import { LAUNCH_OFFER_CODE, getLaunchOfferState } from "@/lib/launchOffer";
import { createShiprocketShipment } from "@/lib/shiprocket";

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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getShippingStatusForOrder = (status: string) => {
  if (status === "awb_assigned") return "processing";
  if (status === "created") return "processing";
  return "pending";
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
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const {
    data: { user },
  } = bearerToken
    ? await supabaseAdmin.auth.getUser(bearerToken)
    : { data: { user: null } };
  const isLaunchOfferOrder =
    pricingDetails?.discountCode === LAUNCH_OFFER_CODE ||
    paymentMethod === "instagram_story_verification";

  if (
    !items?.length ||
    !deliveryAddress ||
    !paymentMethod ||
    typeof totalAmount !== "number" ||
    !Number.isFinite(totalAmount)
  ) {
    return NextResponse.json(
      { error: "Order payload is incomplete." },
      { status: 400 },
    );
  }

  const launchOffer = getLaunchOfferState(items);

  if (isLaunchOfferOrder) {
    if (!user?.email) {
      return NextResponse.json(
        { error: "Please sign in to claim the launch offer." },
        { status: 401 },
      );
    }

    if (!launchOffer.isEligible) {
      return NextResponse.json({ error: launchOffer.message }, { status: 400 });
    }
  }

  if (userId && user?.id !== userId) {
    return NextResponse.json(
      { error: "Authenticated user does not match this order." },
      { status: 403 },
    );
  }

  if (!userId && (!deliveryAddress.email || !deliveryAddress.phone)) {
    return NextResponse.json(
      { error: "Guest orders require email and contact number." },
      { status: 400 },
    );
  }

  const deliveryAddressForOrder = {
    ...deliveryAddress,
    email: deliveryAddress.email ?? user?.email ?? "",
  };
  const orderUserId = user?.id ?? userId ?? null;
  const launchOfferEmail = isLaunchOfferOrder
    ? normalizeEmail(user?.email ?? "")
    : null;

  const orderData = {
    user_id: orderUserId,
    items,
    delivery_address: deliveryAddressForOrder,
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
    extra_shipping_amount: pricingDetails?.extraShippingAmount ?? 0,
    convenience_fee_amount: pricingDetails?.convenienceFeeAmount ?? 0,
    cod_amount: pricingDetails?.codAmount ?? 0,
    freight_charge: pricingDetails?.freightCharge ?? 0,
    total_amount: totalAmount,
    status:
      paymentMethod === "instagram_story_verification"
        ? "verification_pending"
        : "pending",
  };

  const { data, error } = await supabaseAdmin.rpc(
    "place_order_with_inventory",
    {
      p_order_data: orderData,
      p_items: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      p_launch_offer_email: launchOfferEmail,
    },
  );

  if (error) {
    const status =
      error.code === "23505"
        ? 409
        : error.code === "23514" || error.code === "P0002"
          ? 409
          : error.code === "42P01" || error.code === "42883"
            ? 500
            : 500;

    return NextResponse.json(
      { error: error.message, code: error.code },
      { status },
    );
  }

  const order = data as Order;

  // Toggle for Shiprocket Shipment Creation
  // Set NEXT_PUBLIC_ENABLE_SHIPROCKET_SHIPMENT=true in env to enable live shipment creation
  const enableShiprocket =
    process.env.NEXT_PUBLIC_ENABLE_SHIPROCKET_SHIPMENT === "true";

  if (!enableShiprocket) {
    console.log(
      "Shiprocket shipment creation is disabled in development. Order saved to DB only.",
    );
    return NextResponse.json({ order });
  }

  const shipment = await createShiprocketShipment(order);
  const shippingUpdate = {
    shiprocket_order_id: shipment.orderId,
    shiprocket_shipment_id: shipment.shipmentId,
    shiprocket_awb_code: shipment.awbCode,
    shiprocket_courier_name: shipment.courierName,
    shiprocket_tracking_url: shipment.trackingUrl,
    shipping_status:
      shipment.status === "failed" ? "sync_failed" : shipment.status,
    shipping_error: shipment.error,
    status: getShippingStatusForOrder(shipment.status),
  };
  const { data: updatedOrder, error: shippingUpdateError } = await supabaseAdmin
    .from("orders")
    .update(shippingUpdate)
    .eq("id", order.id)
    .select("*")
    .single();

  if (shippingUpdateError) {
    console.error(
      "Shiprocket order metadata update failed:",
      shippingUpdateError,
    );
    return NextResponse.json({
      order: {
        ...order,
        ...shippingUpdate,
      },
    });
  }

  return NextResponse.json({ order: updatedOrder });
}
