import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

type VerifyRazorpayPaymentPayload = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

const signaturesMatch = (expected: string, received: string) => {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay key secret is not configured." },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as Partial<VerifyRazorpayPaymentPayload>;
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json(
      { error: "Payment verification payload is incomplete." },
      { status: 400 },
    );
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (!signaturesMatch(expectedSignature, razorpaySignature)) {
    return NextResponse.json(
      { error: "Payment signature verification failed." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
