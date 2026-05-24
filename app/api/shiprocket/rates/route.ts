import type { CartItem } from "@/store/cartStore";
import { estimateShiprocketRate } from "@/lib/shiprocket";
import { NextResponse } from "next/server";

type RatePayload = {
  deliveryPostcode?: string;
  items?: CartItem[];
  paymentMethod?: string;
  declaredValue?: number;
};

const normalizePincode = (value: string | undefined) =>
  value?.replace(/\D/g, "").slice(0, 6) ?? "";

export async function POST(request: Request) {
  const payload = (await request.json()) as RatePayload;
  const deliveryPostcode = normalizePincode(payload.deliveryPostcode);

  if (deliveryPostcode.length !== 6) {
    return NextResponse.json(
      { error: "Please select a valid 6-digit delivery pincode." },
      { status: 400 },
    );
  }

  if (!payload.items?.length) {
    return NextResponse.json(
      { error: "Cart items are required for shipping calculation." },
      { status: 400 },
    );
  }

  try {
    const estimate = await estimateShiprocketRate({
      deliveryPostcode,
      items: payload.items,
      isCod: payload.paymentMethod === "cod",
      declaredValue:
        typeof payload.declaredValue === "number" &&
          Number.isFinite(payload.declaredValue)
          ? payload.declaredValue
          : 1,
    });

    return NextResponse.json({ estimate });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate Shiprocket shipping.",
      },
      { status: 502 },
    );
  }
}
