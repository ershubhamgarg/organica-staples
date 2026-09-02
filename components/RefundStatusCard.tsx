"use client";

import type { Order } from "@/store/orderStore";
import { supabase } from "@/utils/supabase";
import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type RefundDetails = {
  refundId: string | null;
  status: "not_initiated" | "pending" | "processed" | "failed" | string;
  amount: number | null;
  refundedAt: string | null;
};

type RefundResponse = {
  refund?: RefundDetails;
  error?: string;
};

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitialRefund = (order: Order): RefundDetails => ({
  refundId: order.razorpay_refund_id ?? null,
  status: order.refund_status ?? "not_initiated",
  amount: order.refund_amount ?? null,
  refundedAt: order.refunded_at ?? null,
});

export default function RefundStatusCard({ order }: { order: Order }) {
  const [refund, setRefund] = useState<RefundDetails>(() => getInitialRefund(order));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const refreshRefund = async () => {
    setIsRefreshing(true);
    setRefundError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `/api/razorpay/refund-status?orderId=${encodeURIComponent(order.id)}`,
        {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        },
      );
      const result = (await response.json()) as RefundResponse;

      if (result.refund) {
        setRefund(result.refund);
      }

      if (result.error && !result.refund) {
        setRefundError(result.error);
      }
    } catch {
      setRefundError("Couldn't check the latest refund status.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void refreshRefund();
    // The first load should happen once for this order card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const statusCopy: Record<string, string> = {
    not_initiated: "Your refund hasn't been issued yet — our team will process it shortly.",
    pending: "Refund initiated. It's usually credited within 5–7 business days.",
    processed: "Refunded successfully.",
    failed: "The refund attempt failed — our team has been notified and will retry.",
  };

  return (
    <div className="bg-white/50 border border-brand-gold/15 rounded-3xl p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              refund.status === "processed"
                ? "bg-brand-green/10 text-brand-green"
                : refund.status === "failed"
                  ? "bg-brand-terracotta/10 text-brand-terracotta"
                  : "bg-brand-gold/10 text-brand-gold"
            }`}
          >
            {refund.status === "processed" ? (
              <CheckCircle2 size={16} />
            ) : refund.status === "failed" ? (
              <XCircle size={16} />
            ) : (
              <Clock3 size={16} />
            )}
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-brown/60">
            Refund Status
          </p>
        </div>
        <button
          type="button"
          onClick={refreshRefund}
          disabled={isRefreshing}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-gold/15 text-brand-brown/50 transition-colors hover:border-brand-gold/40 hover:text-brand-brown disabled:opacity-40"
          aria-label="Refresh refund status"
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : undefined} />
        </button>
      </div>

      <p className="text-xs font-semibold leading-relaxed text-brand-brown/70">
        {statusCopy[refund.status] ?? statusCopy.not_initiated}
      </p>

      {refund.status === "processed" && (
        <div className="mt-4 space-y-3 border-t border-brand-gold/10 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-[9px] uppercase tracking-widest text-brand-brown/40 font-bold">
              Amount Refunded
            </span>
            <span className="text-[10px] uppercase tracking-widest text-brand-green font-black">
              ₹{refund.amount?.toFixed(2)}
            </span>
          </div>
          {refund.refundedAt && (
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-widest text-brand-brown/40 font-bold">
                Refunded On
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-brown font-black">
                {formatDate(refund.refundedAt)}
              </span>
            </div>
          )}
        </div>
      )}

      {refundError && (
        <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-brand-terracotta">
          {refundError}
        </p>
      )}
    </div>
  );
}
