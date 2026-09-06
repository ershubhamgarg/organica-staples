import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Order } from "@/store/orderStore";
import { ensureInvoiceGenerated } from "@/lib/invoiceGeneration";

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Invoice generation is not configured on the server." },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!bearerToken) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(bearerToken);

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data: orderRow, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  if (!orderRow) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const order = orderRow as Order;

  if (order.user_id !== user.id) {
    return NextResponse.json(
      { error: "You do not have access to this order." },
      { status: 403 },
    );
  }

  // Reuses the invoice generated at order-confirmation time (stored in
  // Supabase Storage) when it exists — this only actually renders a PDF for
  // orders placed before that existed, or if that first attempt failed.
  const result = await ensureInvoiceGenerated(supabaseAdmin, order);

  if (!result) {
    return NextResponse.json(
      { error: "Unable to generate the invoice for this order." },
      { status: 500 },
    );
  }

  return new NextResponse(new Uint8Array(result.pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.invoiceNumber.replace(/\//g, "-")}.pdf"`,
    },
  });
}
