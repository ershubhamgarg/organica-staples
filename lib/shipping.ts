const DEFAULT_STANDARD_SHIPPING_RATE = 49;

const parsedRate = Number(process.env.NEXT_PUBLIC_STANDARD_SHIPPING_RATE);

// The flat/capped shipping charge for orders under the free-shipping
// threshold. Configurable via NEXT_PUBLIC_STANDARD_SHIPPING_RATE so it can
// change without a code deploy; falls back to a sane default if unset.
export const STANDARD_SHIPPING_RATE =
  Number.isFinite(parsedRate) && parsedRate > 0
    ? parsedRate
    : DEFAULT_STANDARD_SHIPPING_RATE;
