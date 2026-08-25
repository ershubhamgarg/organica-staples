import type { CartItem } from "@/store/cartStore";

export const LAUNCH_OFFER_CODE = "LAUNCHSTORY";
export const LAUNCH_OFFER_PACK_LIMIT = 20;

// Set NEXT_PUBLIC_ENABLE_LAUNCH_OFFER=true in env to turn the launch story
// offer back on. Defaults to disabled so it can be paused without a code
// change beyond flipping this flag.
export const isLaunchOfferEnabled = () =>
  process.env.NEXT_PUBLIC_ENABLE_LAUNCH_OFFER === "true";

export type LaunchOfferState = {
  isEligible: boolean;
  itemCount: number;
  distinctItemCount: number;
  invalidQuantityItems: CartItem[];
  message: string;
};

export function getLaunchOfferState(items: CartItem[]): LaunchOfferState {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  if (!isLaunchOfferEnabled()) {
    return {
      isEligible: false,
      itemCount,
      distinctItemCount: items.length,
      invalidQuantityItems: [],
      message: "The launch story offer isn't running right now.",
    };
  }

  const invalidQuantityItems = items.filter((item) => item.quantity !== 1);
  const hasExactlyTwoProducts = items.length === 2;
  const hasTwoTotalItems = itemCount === 2;
  const hasValidQuantities = invalidQuantityItems.length === 0;
  const isEligible =
    hasExactlyTwoProducts && hasTwoTotalItems && hasValidQuantities;

  let message =
    "Add exactly 2 different products, 1 quantity each, to unlock the launch story offer.";

  if (items.length === 0) {
    message = "Choose any 2 products to unlock the launch story offer.";
  } else if (isEligible) {
    message =
      "Launch offer unlocked. Product cost is waived after Instagram Story verification.";
  } else if (!hasExactlyTwoProducts) {
    message =
      items.length < 2
        ? "Add one more different product to unlock the launch offer."
        : "Keep exactly 2 different products in your cart for this offer.";
  } else if (!hasValidQuantities) {
    message = "Set each selected product quantity to 1 to use this offer.";
  }

  return {
    isEligible,
    itemCount,
    distinctItemCount: items.length,
    invalidQuantityItems,
    message,
  };
}
