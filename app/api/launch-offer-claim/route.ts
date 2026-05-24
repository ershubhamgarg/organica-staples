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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function GET(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json({ hasClaimed: false }, { status: 200 });
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!bearerToken) {
    return NextResponse.json({ hasClaimed: false }, { status: 200 });
  }

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(bearerToken);

  if (!user?.email) {
    return NextResponse.json({ hasClaimed: false }, { status: 200 });
  }

  const { data, error } = await supabaseAdmin
    .from("launch_offer_claims")
    .select("id")
    .eq("normalized_email", normalizeEmail(user.email))
    .maybeSingle();

  if (error?.code === "42703") {
    const { data: userClaim, error: userClaimError } = await supabaseAdmin
      .from("launch_offer_claims")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!userClaimError) {
      return NextResponse.json({ hasClaimed: Boolean(userClaim?.id) });
    }
  }

  if (error) {
    return NextResponse.json(
      { hasClaimed: false, error: error.message },
      { status: error.code === "42P01" || error.code === "42703" ? 200 : 500 },
    );
  }

  return NextResponse.json({ hasClaimed: Boolean(data?.id) });
}
