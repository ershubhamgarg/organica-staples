import { mapDiscountCoupon, normalizeDiscountCode } from "@/lib/discountCodes";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !key) {
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const couponColumns = "code, percent, label, is_public, min_order_value";

export async function GET() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase coupon lookup is not configured." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("discount_coupons")
    .select(couponColumns)
    .eq("is_active", true)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.code === "42P01" ? 404 : 500 },
    );
  }

  return NextResponse.json({
    coupons: (data ?? []).map(mapDiscountCoupon),
  });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase coupon lookup is not configured." },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as Partial<{
    code: string;
    subtotal: number;
  }>;
  const code = normalizeDiscountCode(payload.code ?? "");
  const subtotal = Number(payload.subtotal ?? 0);

  if (!code) {
    return NextResponse.json(
      { error: "Coupon code is required." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("discount_coupons")
    .select(couponColumns)
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.code === "42P01" ? 404 : 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "This coupon code is not valid." },
      { status: 404 },
    );
  }

  const coupon = mapDiscountCoupon(data);
  const minOrderValue = coupon.minOrderValue;
  const shortfall =
    minOrderValue !== null ? Math.max(minOrderValue - subtotal, 0) : 0;

  return NextResponse.json({
    coupon,
    isEligible: shortfall === 0,
    shortfall,
  });
}
