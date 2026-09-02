const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

type RazorpayRefundEntity = {
  id: string;
  entity: "refund";
  amount: number; // paise
  currency: string;
  payment_id: string;
  status?: "pending" | "processed" | "failed" | string;
  created_at: number; // unix seconds
};

type RazorpayRefundListResponse = {
  count?: number;
  items?: RazorpayRefundEntity[];
};

export type RefundStatus = "not_initiated" | "pending" | "processed" | "failed";

export type RefundDetails = {
  refundId: string | null;
  status: RefundStatus;
  amount: number | null; // rupees
  refundedAt: string | null; // ISO
};

const getAuthHeader = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return null;

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
};

/**
 * Refunds are initiated manually from the Razorpay dashboard when an order
 * is cancelled — there's no refund-trigger flow on the site. This just
 * reads back whatever Razorpay currently knows for that payment.
 */
export async function getRazorpayRefundStatus(
  paymentId: string,
): Promise<RefundDetails> {
  const authHeader = getAuthHeader();

  if (!authHeader) {
    throw new Error("Razorpay API credentials are not configured on the server.");
  }

  const response = await fetch(
    `${RAZORPAY_API_BASE}/payments/${encodeURIComponent(paymentId)}/refunds`,
    { headers: { Authorization: authHeader } },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error?.description ?? `Razorpay refund lookup failed (${response.status}).`,
    );
  }

  const data = (await response.json()) as RazorpayRefundListResponse;
  const latest = data.items?.[0] ?? null;

  if (!latest) {
    return { refundId: null, status: "not_initiated", amount: null, refundedAt: null };
  }

  const status: RefundStatus =
    latest.status === "processed" ? "processed" : latest.status === "failed" ? "failed" : "pending";

  return {
    refundId: latest.id,
    status,
    amount: latest.amount / 100,
    refundedAt:
      status === "processed" ? new Date(latest.created_at * 1000).toISOString() : null,
  };
}
