export const GANESH_COUPON_CODE = "GANESHA14";
export const GANESH_OFFER_END = new Date("2026-09-23T23:59:59+05:30");

export function isGaneshChaturthiOfferLive() {
  return Date.now() <= GANESH_OFFER_END.getTime();
}
