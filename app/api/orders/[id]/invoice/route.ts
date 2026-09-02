import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import type { Order } from "@/store/orderStore";
import {
  InvoiceDocument,
  formatInvoiceNumber,
  getFinancialYear,
  type InvoiceItemInput,
} from "@/lib/invoice";

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

  // Assign a stable, sequential invoice number the first time it's
  // requested — every later download reuses the same number.
  let invoiceNumber = order.invoice_number ?? null;

  if (!invoiceNumber) {
    const financialYear = getFinancialYear(new Date(order.created_at));
    const { data: sequence, error: sequenceError } = await supabaseAdmin.rpc(
      "get_next_invoice_number",
      { p_financial_year: financialYear },
    );

    if (sequenceError) {
      return NextResponse.json(
        { error: `Unable to assign an invoice number: ${sequenceError.message}` },
        { status: 500 },
      );
    }

    invoiceNumber = formatInvoiceNumber(financialYear, sequence as number);
    const generatedAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        invoice_number: invoiceNumber,
        invoice_generated_at: generatedAt,
      })
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Unable to save the invoice number: ${updateError.message}` },
        { status: 500 },
      );
    }

    order.invoice_generated_at = generatedAt;
  }

  const productIds = order.items.map((item) => item.id);
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, hsn_code")
    .in("id", productIds);

  const hsnByProductId = new Map(
    (products ?? []).map((p) => [String(p.id), p.hsn_code as string | null]),
  );

  const invoiceItems: InvoiceItemInput[] = order.items.map((item) => ({
    name: item.name,
    weight: item.weight,
    quantity: item.quantity,
    price: item.price,
    hsnCode: hsnByProductId.get(String(item.id)) ?? null,
  }));

  const pdfBuffer = await renderToBuffer(
    InvoiceDocument({ order, invoiceNumber, items: invoiceItems }),
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceNumber.replace(/\//g, "-")}.pdf"`,
    },
  });
}
