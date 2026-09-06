import { renderToBuffer } from "@react-pdf/renderer";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order } from "@/store/orderStore";
import {
  InvoiceDocument,
  formatInvoiceNumber,
  getFinancialYear,
  type InvoiceItemInput,
} from "@/lib/invoice";

const INVOICE_BUCKET = "invoices";

const isLaunchOfferOrder = (order: Order) =>
  order.payment_method === "instagram_story_verification";

const storagePathFor = (orderId: string) => `${orderId}.pdf`;

/**
 * Renders the invoice PDF, uploads it to the private "invoices" bucket, and
 * records the path + invoice number on the order — all only on first call
 * for a given order. Later calls are a no-op (existing path returned as-is)
 * so the PDF is never regenerated once stored.
 *
 * Returns null for orders that don't get a GST invoice (launch-offer ₹0
 * orders) or when generation fails — callers treat both as "nothing to do
 * right now," since the download route can always retry later.
 */
export async function ensureInvoiceGenerated(
  supabaseAdmin: SupabaseClient,
  order: Order,
): Promise<{ invoiceNumber: string; storagePath: string; pdfBuffer: Buffer } | null> {
  if (isLaunchOfferOrder(order)) {
    return null;
  }

  if (order.invoice_pdf_path && order.invoice_number) {
    const { data, error } = await supabaseAdmin.storage
      .from(INVOICE_BUCKET)
      .download(order.invoice_pdf_path);

    if (!error && data) {
      const pdfBuffer = Buffer.from(await data.arrayBuffer());
      return { invoiceNumber: order.invoice_number, storagePath: order.invoice_pdf_path, pdfBuffer };
    }
    // Fall through and regenerate if the stored object is somehow missing.
  }

  try {
    let invoiceNumber = order.invoice_number ?? null;
    const generatedAt = order.invoice_generated_at ?? new Date().toISOString();

    if (!invoiceNumber) {
      const financialYear = getFinancialYear(new Date(order.created_at));
      const { data: sequence, error: sequenceError } = await supabaseAdmin.rpc(
        "get_next_invoice_number",
        { p_financial_year: financialYear },
      );

      if (sequenceError) {
        throw new Error(`Unable to assign an invoice number: ${sequenceError.message}`);
      }

      invoiceNumber = formatInvoiceNumber(financialYear, sequence as number);
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
      InvoiceDocument({
        order: { ...order, invoice_generated_at: generatedAt },
        invoiceNumber,
        items: invoiceItems,
      }),
    );

    const storagePath = storagePathFor(order.id);
    const { error: uploadError } = await supabaseAdmin.storage
      .from(INVOICE_BUCKET)
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Unable to store the invoice PDF: ${uploadError.message}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        invoice_number: invoiceNumber,
        invoice_generated_at: generatedAt,
        invoice_pdf_path: storagePath,
      })
      .eq("id", order.id);

    if (updateError) {
      throw new Error(`Unable to save invoice metadata: ${updateError.message}`);
    }

    return { invoiceNumber, storagePath, pdfBuffer };
  } catch (error) {
    console.error(`Invoice generation failed for order ${order.id}:`, error);
    return null;
  }
}
