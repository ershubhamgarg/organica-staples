const DEFAULT_STANDARD_SHIPPING_RATE = 49;

const parsedRate = Number(process.env.NEXT_PUBLIC_STANDARD_SHIPPING_RATE);

// The flat/capped shipping charge for orders under the free-shipping
// threshold. Configurable via NEXT_PUBLIC_STANDARD_SHIPPING_RATE so it can
// change without a code deploy; falls back to a sane default if unset.
export const STANDARD_SHIPPING_RATE =
  Number.isFinite(parsedRate) && parsedRate > 0
    ? parsedRate
    : DEFAULT_STANDARD_SHIPPING_RATE;

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
