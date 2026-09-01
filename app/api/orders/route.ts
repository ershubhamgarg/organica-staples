import { createHmac, timingSafeEqual } from "node:crypto";
import type { CartItem } from "@/store/cartStore";
import type { Address } from "@/store/addressStore";
import type { Product } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { OrderPricingDetails, PaymentDetails } from "@/store/orderStore";
import type { Order } from "@/store/orderStore";
import { LAUNCH_OFFER_CODE, getLaunchOfferState } from "@/lib/launchOffer";
import { getDiscountedPrice } from "@/lib/pricing";
import {
  calculateDiscount,
  mapDiscountCoupon,
  normalizeDiscountCode,
} from "@/lib/discountCodes";
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

// Bounded, sanity-checked (rather than exactly recomputed) fee ceiling. Real
// shipping/COD/convenience amounts depend on live courier rates fetched
// during checkout; the actual paid amount is still independently confirmed
// against Razorpay below, so this just blocks obviously fabricated values.
const MAX_TRUSTED_FEES_TOTAL = 400;

const signaturesMatch = (expected: string, received: string) => {
  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(received, "hex");

    return (
      expectedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(expectedBuffer, receivedBuffer)
    );
  } catch {
    return false;
  }
};

/**
 * Recompute the order's authoritative product pricing server-side from the
 * live `products` table, ignoring the client-submitted item prices/discount
 * fields entirely. This is the fix for client-side price tampering: the
 * client can request any items/quantities, but what they cost is decided
 * here, not by whatever `price`/`pricingDetails` the request body claims.
 */
const recomputeOrderPricing = async (
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  items: CartItem[],
  requestedDiscountCode: string | null,
) => {
  const productIds = items.map((item) => item.id);
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .in("id", productIds);

  if (error) {
    throw new Error(`Unable to verify product pricing: ${error.message}`);
  }

  const productById = new Map(
    (products ?? []).map((p) => [String((p as Product).id), p as Product]),
  );

  let actualSubtotal = 0;
  let discountedSubtotal = 0;
  const storedItems: CartItem[] = items.map((item) => {
    const product = productById.get(String(item.id));

    if (!product) {
      throw new Error(
        `Product ${item.id} in your cart is no longer available.`,
      );
    }

    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for product ${item.id}.`);
    }

    const unitPrice = getDiscountedPrice(product);
    actualSubtotal += product.price * quantity;
    discountedSubtotal += unitPrice * quantity;

    // Keep the full item (name/weight/image/etc.) — only price and quantity
    // are corrected. The stored order snapshot and Shiprocket's weight
    // calculation both depend on the other fields being intact.
    return { ...item, quantity, price: unitPrice };
  });

  actualSubtotal = Number(actualSubtotal.toFixed(2));
  discountedSubtotal = Number(discountedSubtotal.toFixed(2));
  const productDiscountAmount = Number(
    (actualSubtotal - discountedSubtotal).toFixed(2),
  );

  let couponDiscountAmount = 0;
  let discountPercent = 0;
  let discountCode: string | null = null;

  if (requestedDiscountCode) {
    const normalizedCode = normalizeDiscountCode(requestedDiscountCode);
    const { data: couponRow } = await supabaseAdmin
      .from("discount_coupons")
      .select("code, percent, label, is_public, min_order_value, valid_upto")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .maybeSingle();

    if (couponRow) {
      const coupon = mapDiscountCoupon(couponRow);
      const isExpired =
        coupon.validUpto !== null &&
        new Date(coupon.validUpto).getTime() < Date.now();

      if (!isExpired) {
        const result = calculateDiscount(discountedSubtotal, coupon);
        if (result.isEligible) {
          couponDiscountAmount = result.amount;
          discountPercent = result.percent;
          discountCode = coupon.code;
        }
      }
    }
  }

  const subtotalAmount = Number(
    (discountedSubtotal - couponDiscountAmount).toFixed(2),
  );

  return {
    storedItems,
    actualSubtotal,
    subtotalAmount,
    productDiscountAmount,
    couponDiscountAmount,
    discountPercent,
    discountCode,
  };
};

const verifyRazorpayPayment = async ({
  paymentDetails,
  expectedAmount,
}: {
  paymentDetails: PaymentDetails;
  expectedAmount: number;
}) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured on the server.");
  }

  const { provider_order_id, provider_payment_id, provider_signature } =
    paymentDetails;

  if (!provider_order_id || !provider_payment_id || !provider_signature) {
    throw new Error("Payment verification details are incomplete.");
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${provider_order_id}|${provider_payment_id}`)
    .digest("hex");

  if (!signaturesMatch(expectedSignature, provider_signature)) {
    throw new Error("Payment signature verification failed.");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${provider_payment_id}`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  if (!response.ok) {
    throw new Error("Unable to confirm payment with Razorpay.");
  }

  const payment = (await response.json()) as {
    status?: string;
    order_id?: string;
    amount?: number;
  };

  if (payment.status !== "captured") {
    throw new Error("This payment has not been captured by Razorpay.");
  }

  if (payment.order_id !== provider_order_id) {
    throw new Error("Payment does not match the expected order.");
  }

  const expectedAmountInPaise = Math.round(expectedAmount * 100);
  const amountTolerancePaise = 100; // 1 rupee, to absorb rounding only.

  if (
    typeof payment.amount !== "number" ||
    Math.abs(payment.amount - expectedAmountInPaise) > amountTolerancePaise
  ) {
    throw new Error("Paid amount does not match the order total.");
  }
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

  // Defaults for the launch-offer path, which keeps its existing (already
  // gated behind sign-in + eligibility + manual verification) behaviour.
  // `storedItems` keeps every field (name/weight/image/etc.) for the stored
  // order snapshot and Shiprocket; `rpcItems` is the minimal id/quantity/price
  // shape place_order_with_inventory actually reads.
  let storedItems: CartItem[] = items;
  let subtotalAmount = pricingDetails?.subtotalAmount ?? 0;
  let discountCode = pricingDetails?.discountCode ?? null;
  let discountPercent = pricingDetails?.discountPercent ?? 0;
  let productDiscountAmount = pricingDetails?.productDiscountAmount ?? 0;
  let couponDiscountAmount = pricingDetails?.couponDiscountAmount ?? 0;
  let computedTotal = totalAmount;

  if (!isLaunchOfferOrder) {
    try {
      const recomputed = await recomputeOrderPricing(
        supabaseAdmin,
        items,
        pricingDetails?.discountCode ?? null,
      );
      storedItems = recomputed.storedItems;
      subtotalAmount = recomputed.subtotalAmount;
      discountCode = recomputed.discountCode;
      discountPercent = recomputed.discountPercent;
      productDiscountAmount = recomputed.productDiscountAmount;
      couponDiscountAmount = recomputed.couponDiscountAmount;
    } catch (pricingError) {
      return NextResponse.json(
        {
          error:
            pricingError instanceof Error
              ? pricingError.message
              : "Unable to verify order pricing.",
        },
        { status: 400 },
      );
    }

    const shippingAmount = Number(pricingDetails?.shippingAmount ?? 0);
    const convenienceFeeAmount = Number(
      pricingDetails?.convenienceFeeAmount ?? 0,
    );
    const codAmount = Number(pricingDetails?.codAmount ?? 0);
    const feesTotal = shippingAmount + convenienceFeeAmount + codAmount;
    const feesAreValid =
      Number.isFinite(shippingAmount) &&
      shippingAmount >= 0 &&
      Number.isFinite(convenienceFeeAmount) &&
      convenienceFeeAmount >= 0 &&
      Number.isFinite(codAmount) &&
      codAmount >= 0 &&
      feesTotal <= MAX_TRUSTED_FEES_TOTAL;

    if (!feesAreValid) {
      return NextResponse.json(
        { error: "Order totals could not be verified." },
        { status: 400 },
      );
    }

    computedTotal = Number(
      (subtotalAmount + shippingAmount + convenienceFeeAmount + codAmount).toFixed(
        2,
      ),
    );

    if (paymentMethod === "razorpay") {
      if (!paymentDetails) {
        return NextResponse.json(
          { error: "Payment verification details are required." },
          { status: 400 },
        );
      }

      try {
        await verifyRazorpayPayment({
          paymentDetails,
          expectedAmount: computedTotal,
        });
      } catch (verifyError) {
        return NextResponse.json(
          {
            error:
              verifyError instanceof Error
                ? verifyError.message
                : "Payment verification failed.",
          },
          { status: 402 },
        );
      }
    }
  }

  const orderData = {
    user_id: orderUserId,
    items: storedItems,
    delivery_address: deliveryAddressForOrder,
    payment_method: paymentMethod,
    payment_details: paymentDetails ?? null,
    subtotal_amount: subtotalAmount,
    discount_code: discountCode,
    discount_percent: discountPercent,
    product_discount_amount: productDiscountAmount,
    coupon_discount_amount: couponDiscountAmount,
    discount_amount: productDiscountAmount + couponDiscountAmount,
    shipping_amount: pricingDetails?.shippingAmount ?? 0,
    extra_shipping_amount: pricingDetails?.extraShippingAmount ?? 0,
    convenience_fee_amount: pricingDetails?.convenienceFeeAmount ?? 0,
    cod_amount: pricingDetails?.codAmount ?? 0,
    freight_charge: pricingDetails?.freightCharge ?? 0,
    total_amount: isLaunchOfferOrder ? totalAmount : computedTotal,
    status:
      paymentMethod === "instagram_story_verification"
        ? "verification_pending"
        : "pending",
  };

  const { data, error } = await supabaseAdmin.rpc(
    "place_order_with_inventory",
    {
      p_order_data: orderData,
      p_items: storedItems.map((item) => ({
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
