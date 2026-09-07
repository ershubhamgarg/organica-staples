import { timingSafeEqual } from "node:crypto";
import { getShiprocketHealth } from "@/lib/shiprocket";
import { NextResponse } from "next/server";

const isSecretValid = (provided: string | null, expected: string) => {
  const providedBuffer = Buffer.from(provided ?? "");
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
};

export async function GET(request: Request) {
  const expectedSecret = process.env.DIAGNOSTICS_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Diagnostics are not configured on the server." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const providedSecret =
    searchParams.get("secret") ?? request.headers.get("x-api-key");

  if (!isSecretValid(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const health = await getShiprocketHealth();

  return NextResponse.json({ shiprocket: health });
}
