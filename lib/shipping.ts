const DEFAULT_STANDARD_SHIPPING_RATE = 99;
const DEFAULT_SUB_500_SHIPPING_RATE = 149;

const readRate = (raw: string | undefined, fallback: number) => {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Flat shipping charge for the ₹500–₹999 band. Configurable via
// NEXT_PUBLIC_STANDARD_SHIPPING_RATE so it can change without a deploy.
export const STANDARD_SHIPPING_RATE = readRate(
  process.env.NEXT_PUBLIC_STANDARD_SHIPPING_RATE,
  DEFAULT_STANDARD_SHIPPING_RATE,
);

// Flat shipping charge for orders under ₹500.
export const SUB_500_SHIPPING_RATE = readRate(
  process.env.NEXT_PUBLIC_SUB_500_SHIPPING_RATE,
  DEFAULT_SUB_500_SHIPPING_RATE,
);

// Subtotal (after discounts) at which the ₹149 band gives way to ₹99.
export const REDUCED_SHIPPING_THRESHOLD = 500;

// Subtotal (after discounts) from which standard shipping is waived. Shown in
// the site-wide announcement bar; checkout applies the same rule.
export const FREE_SHIPPING_THRESHOLD = 1000;

/**
 * The shipping charge for a given post-discount subtotal.
 *
 * Deliberately a flat, published tier rather than the live courier quote:
 * the customer sees the same number the shipping policy promises, whatever
 * the courier happens to charge us for that pincode and weight. The real
 * freight is still fetched from Shiprocket, but it is used only for internal
 * cost accounting (`extra_shipping_amount`), never to price the customer.
 *
 *   under ₹500      → ₹149
 *   ₹500 – ₹999     → ₹99
 *   ₹1,000 and up   → free
 *
 * Note the boundaries are inclusive at the lower edge of the cheaper band —
 * exactly ₹500 pays ₹99, exactly ₹1,000 ships free.
 */
export function getShippingCharge(subtotalAfterDiscount: number): number {
  if (!Number.isFinite(subtotalAfterDiscount) || subtotalAfterDiscount <= 0) {
    return 0;
  }
  if (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD) return 0;
  if (subtotalAfterDiscount >= REDUCED_SHIPPING_THRESHOLD) {
    return STANDARD_SHIPPING_RATE;
  }
  return SUB_500_SHIPPING_RATE;
}

const DEFAULT_LOCAL_DELIVERY_PINCODE = "125055";

// Pincode treated as an in-house local delivery: free, and never routed
// through Shiprocket (no live rate lookup, no shipment booking). Configurable
// via NEXT_PUBLIC_LOCAL_DELIVERY_PINCODE.
export const LOCAL_DELIVERY_PINCODE =
  process.env.NEXT_PUBLIC_LOCAL_DELIVERY_PINCODE?.trim() ||
  DEFAULT_LOCAL_DELIVERY_PINCODE;

export function isLocalDeliveryPincode(
  pincode: string | null | undefined,
): boolean {
  if (!pincode) return false;

  return pincode.replace(/\D/g, "") === LOCAL_DELIVERY_PINCODE;
}
