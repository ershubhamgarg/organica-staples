import { getShiprocketHealth } from "@/lib/shiprocket";
import { NextResponse } from "next/server";

export async function GET() {
  const health = await getShiprocketHealth();

  return NextResponse.json({ shiprocket: health });
}
