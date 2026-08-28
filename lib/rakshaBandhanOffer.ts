export const RAKHI_COUPON_CODE = "RAKSHA10";
export const RAKHI_OFFER_END = new Date("2026-08-31T23:59:59+05:30");

export function isRakshaBandhanOfferLive() {
  return Date.now() <= RAKHI_OFFER_END.getTime();
}
