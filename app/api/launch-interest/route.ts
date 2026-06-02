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

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Internal server error: Missing credentials." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { productId, name, email } = body;

    if (!productId || !name || !email) {
      return NextResponse.json(
        { error: "Product ID, name, and email are required." },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("product_launch_interests")
      .insert({
        product_id: productId,
        customer_name: name,
        customer_email: email.trim().toLowerCase(),
      });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already registered interest for this product." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Interest registered successfully." });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }
}
