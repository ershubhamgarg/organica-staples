import { NextResponse } from "next/server";

type CreateRazorpayOrderPayload = {
  amount: number;
  receipt?: string;
  notes?: Record<string, string>;
};

const getRazorpayCredentials = () => {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
};

export async function POST(request: Request) {
  const credentials = getRazorpayCredentials();

  if (!credentials) {
    return NextResponse.json(
      {
        error:
          "Razorpay test keys are not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
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
        payload.receipt?.slice(0, 40) ?? `amritya_${Date.now().toString(36)}`,
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
