import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { CartItem } from "@/store/cartStore";

type OrderItemForValidation = Pick<CartItem, "id" | "quantity"> & {
  variant_id?: string | null;
};

type CreateRazorpayOrderPayload = {
  amount: number;
  receipt?: string;
  notes?: Record<string, string>;
  items?: OrderItemForValidation[];
};

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
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

const validateInventory = async (
  items: OrderItemForValidation[] | undefined,
) => {
  if (!items?.length) {
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return "Inventory validation requires SUPABASE_SERVICE_ROLE_KEY on the server.";
  }

  // Advisory only — the real, atomic guard is place_order_with_inventory's
  // row lock. This just fails fast with a friendlier message beforehand.
  const plainItems = items.filter((item) => !item.variant_id);
  const variantItems = items.filter((item) => item.variant_id);

  const productIds = plainItems.map((item) => item.id);
  const { data: productInventory, error: productError } = productIds.length
    ? await supabaseAdmin
        .from("product_inventory")
        .select("product_id, available_quantity")
        .in("product_id", productIds)
    : { data: [], error: null };

  if (productError) {
    return productError.message;
  }

  const variantIds = variantItems.map((item) => String(item.variant_id));
  const { data: variantInventory, error: variantError } = variantIds.length
    ? await supabaseAdmin
        .from("product_variant_inventory")
        .select("variant_id, available_quantity")
        .in("variant_id", variantIds)
    : { data: [], error: null };

  if (variantError) {
    return variantError.message;
  }

  const inventoryByProduct = new Map(
    (productInventory ?? []).map((row) => [
      String(row.product_id),
      Number(row.available_quantity),
    ]),
  );
  const inventoryByVariant = new Map(
    (variantInventory ?? []).map((row) => [
      String(row.variant_id),
      Number(row.available_quantity),
    ]),
  );

  for (const item of items) {
    const availableQuantity = item.variant_id
      ? inventoryByVariant.get(String(item.variant_id))
      : inventoryByProduct.get(String(item.id));

    if (availableQuantity === undefined) {
      return "Inventory is not configured for one or more products in your cart.";
    }

    if (availableQuantity < item.quantity) {
      return "One or more products no longer has enough stock. Please refresh your cart.";
    }
  }

  return null;
};

export async function POST(request: Request) {
  const credentials = getRazorpayCredentials();

  if (!credentials) {
    return NextResponse.json(
      {
        error:
          "Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as Partial<CreateRazorpayOrderPayload>;
  const amount = Number(payload.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "A valid payment amount is required." },
      { status: 400 },
    );
  }

  const inventoryError = await validateInventory(payload.items);

  if (inventoryError) {
    return NextResponse.json({ error: inventoryError }, { status: 409 });
  }

  const amountInPaise = Math.round(amount * 100);
  const auth = Buffer.from(
    `${credentials.keyId}:${credentials.keySecret}`,
  ).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt:
        payload.receipt?.slice(0, 40) ?? `annvriksh_${Date.now().toString(36)}`,
      notes: payload.notes,
      ...(process.env.RAZORPAY_CHECKOUT_CONFIG_ID
        ? { checkout_config_id: process.env.RAZORPAY_CHECKOUT_CONFIG_ID }
        : {}),
    }),
  });

  const order = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          order.error?.description ||
          order.error?.reason ||
          "Unable to create Razorpay order.",
      },
      { status: response.status },
    );
  }

  return NextResponse.json({
    keyId: credentials.keyId,
    order,
  });
}
