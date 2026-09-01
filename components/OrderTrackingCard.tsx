"use client";

import type { Order } from "@/store/orderStore";
import { supabase } from "@/utils/supabase";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TrackingActivity = {
  date: string | null;
  status: string;
  location: string | null;
};

type TrackingDetails = {
  awbCode: string | null;
  courierName: string | null;
  currentStatus: string | null;
  deliveredAt: string | null;
  expectedDeliveryDate: string | null;
  trackingUrl: string | null;
  shippingStatus?: string;
  activities: TrackingActivity[];
};

type TrackingResponse = {
  tracking?: TrackingDetails;
  error?: string;
};

type Step = {
  key: string;
  label: string;
  helper: string;
};

const steps: Step[] = [
  {
    key: "pending",
    label: "Packed",
    helper: "Order received",
  },
  {
    key: "awb_assigned",
    label: "Booked",
    helper: "Courier assigned",
  },
  {
    key: "in_transit",
    label: "On The Way",
    helper: "In transit",
  },
  {
    key: "delivered",
    label: "Delivered",
    helper: "Reached you",
  },
];

const getStepIndex = (status: string | null | undefined) => {
  if (!status) return 0;

  if (status === "delivered") return 3;
  if (status === "out_for_delivery" || status === "in_transit") return 2;
  if (status === "awb_assigned" || status === "created") return 1;
  return 0;
};

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitialTracking = (order: Order): TrackingDetails => ({
  awbCode: order.shiprocket_awb_code ?? null,
  courierName: order.shiprocket_courier_name ?? null,
  currentStatus: order.shipping_status ?? "pending",
  deliveredAt: order.delivered_at ?? null,
  expectedDeliveryDate: null,
  trackingUrl: order.shiprocket_tracking_url ?? null,
  shippingStatus: order.shipping_status ?? "pending",
  activities: [],
});

const getStatusCopy = (
  tracking: TrackingDetails,
  order: Order,
  enableShiprocket: boolean,
) => {
  if (!enableShiprocket) {
    return "Shipping services are currently disabled in development mode.";
  }

  if (tracking.shippingStatus === "not_configured") {
    return "Tracking will appear after the team books this parcel.";
  }

  if (tracking.shippingStatus === "local_delivery") {
    return "Local delivery — no courier needed, we'll hand it to you directly.";
  }

  if (tracking.shippingStatus === "sync_failed" || order.shipping_error) {
    return "Shipment booking needs a team check. Your order is safely placed.";
  }

  if (!tracking.awbCode) {
    return "Your pantry parcel is being packed with care.";
  }

  if (tracking.shippingStatus === "delivered") {
    return "Delivered. We hope it reached fresh and fragrant.";
  }

  return tracking.currentStatus ?? "Courier updates will refresh here.";
};

export default function OrderTrackingCard({ order }: { order: Order }) {
  const [tracking, setTracking] = useState<TrackingDetails>(() =>
    getInitialTracking(order),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const enableShiprocket =
    process.env.NEXT_PUBLIC_ENABLE_SHIPROCKET_SHIPMENT === "true";

  const activeStep = useMemo(
    () => getStepIndex(tracking.shippingStatus ?? tracking.currentStatus),
    [tracking.currentStatus, tracking.shippingStatus],
  );
  const latestActivities = tracking.activities.slice(0, 3);
  // Only allow refresh in production mode, and only when there's actually a
  // Shiprocket-tracked shipment — local-delivery orders never get one.
  const canRefresh =
    enableShiprocket && tracking.shippingStatus !== "local_delivery";

  const refreshTracking = async () => {
    if (!canRefresh) return;

    setIsRefreshing(true);
    setTrackingError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `/api/shiprocket/track?orderId=${encodeURIComponent(order.id)}`,
        {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        },
      );
      const result = (await response.json()) as TrackingResponse;

      if (result.tracking) {
        setTracking(result.tracking);
      }

      if (result.error && !result.tracking) {
        setTrackingError(result.error);
      }
    } catch {
      setTrackingError("Tracking is taking longer than usual to refresh.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void refreshTracking();
    // The first load should happen once for this order card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  return (
    <div className="md:w-80 shrink-0 rounded-3xl border border-brand-gold/15 bg-white/60 p-6 shadow-sm">
      {!enableShiprocket && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-gold/10 px-3 py-2 text-brand-gold">
          <AlertCircle size={14} />
          <p className="text-[9px] font-black uppercase tracking-widest">
            Shipping Disabled (Dev Mode)
          </p>
        </div>
      )}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            {tracking.shippingStatus === "delivered" ? (
              <PackageCheck size={17} strokeWidth={1.8} />
            ) : (
              <Truck size={17} strokeWidth={1.8} />
            )}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-brown/45">
              Shipping
            </p>
            <h4 className="mt-1 font-serif text-lg leading-none tracking-tight text-brand-brown">
              Order Tracking
            </h4>
          </div>
        </div>
        {canRefresh && (
          <button
            type="button"
            onClick={refreshTracking}
            disabled={isRefreshing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/15 text-brand-brown/50 transition-colors hover:border-brand-gold/40 hover:text-brand-brown disabled:opacity-40"
            aria-label="Refresh tracking"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : undefined}
            />
          </button>
        )}
      </div>

      <div className="mb-6 rounded-2xl border border-brand-gold/10 bg-brand-cream/45 p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="mt-1">
            {tracking.shippingStatus === "sync_failed" ? (
              <AlertCircle size={15} className="text-brand-terracotta" />
            ) : tracking.shippingStatus === "delivered" ? (
              <CheckCircle2 size={15} className="text-brand-green-fresh" />
            ) : (
              <Clock3 size={15} className="text-brand-gold" />
            )}
          </div>
          <p className="text-xs font-semibold leading-relaxed text-brand-brown/70">
            {getStatusCopy(tracking, order, enableShiprocket)}
          </p>
        </div>
        {trackingError && (
          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-terracotta">
            {trackingError}
          </p>
        )}
      </div>

      {enableShiprocket && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-brown/35">
              AWB
            </p>
            <p className="mt-1 break-all text-[10px] font-black uppercase tracking-wide text-brand-brown">
              {tracking.awbCode ?? "Pending"}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-brown/35">
              Courier
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-brand-brown">
              {tracking.courierName ?? "Assigning"}
            </p>
          </div>
          {tracking.expectedDeliveryDate && (
            <div className="col-span-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-brand-brown/35">
                Expected Delivery
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-brand-green-fresh">
                {formatDate(tracking.expectedDeliveryDate)}
              </p>
            </div>
          )}
        </div>
      )}

      {enableShiprocket && (
        <div className="mb-6 grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const isDone = index <= activeStep;

            return (
              <div key={step.key} className="min-w-0">
                <div
                  className={`mb-2 h-1.5 rounded-full ${isDone ? "bg-brand-green-fresh" : "bg-brand-gold/15"}`}
                />
                <p
                  className={`truncate text-[7px] font-black uppercase tracking-wide ${isDone ? "text-brand-brown" : "text-brand-brown/30"}`}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 truncate text-[7px] font-bold uppercase tracking-wide text-brand-brown/30">
                  {step.helper}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {enableShiprocket && latestActivities.length > 0 && (
        <div className="mb-6 space-y-3 border-t border-brand-gold/10 pt-5">
          {latestActivities.map((activity, index) => (
            <div key={`${activity.status}-${index}`} className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-brand-brown">
                  {activity.status}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-brand-brown/35">
                  {[activity.location, formatDate(activity.date)]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tracking.trackingUrl && (
        <a
          href={tracking.trackingUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-4 text-[8px] font-black uppercase tracking-[0.18em] text-brand-cream transition-all hover:translate-y-[-1px] hover:bg-brand-brown-light"
        >
          Track On Shiprocket <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}
