export type DiscountCode = {
  code: string;
  percent: number;
  label: string;
  isPublic: boolean;
  minOrderValue: number | null;
  validUpto: string | null;
  /** Waives shipping/convenience/COD fees too, so the order costs ₹0 — used
   * for barter/collab coupons, not ordinary percent-off promotions. */
  isFreeOrder: boolean;
  requiresLogin: boolean;
  maxRedemptions: number | null;
  redemptionCount: number;
};

export type DiscountResult = {
  code: string | null;
  percent: number;
  amount: number;
  subtotalAfterDiscount: number;
  isEligible: boolean;
  shortfall: number;
};

export function normalizeDiscountCode(code: string) {
  return code.trim().toUpperCase();
}

export type FreeOrderCartState = {
  isEligible: boolean;
  invalidQuantityItems: { name?: string; quantity: number }[];
  message: string;
};

/**
 * Cart rules for a free-order (barter/collab) coupon: any selection of SKUs
 * is fine, but every line must be a single unit — one free sample each, not
 * bulk. Shared by the cart page, checkout, and the order API so all three
 * agree on eligibility.
 */
export function getFreeOrderCartState(
  items: { name?: string; quantity: number }[],
): FreeOrderCartState {
  const invalidQuantityItems = items.filter((item) => item.quantity !== 1);

  if (items.length === 0) {
    return {
      isEligible: false,
      invalidQuantityItems,
      message: "Add at least one product to use this coupon.",
    };
  }

  if (invalidQuantityItems.length > 0) {
    return {
      isEligible: false,
      invalidQuantityItems,
      message:
        "This coupon allows only 1 quantity per product. Reduce every item in your cart to 1 to continue.",
    };
  }

  return {
    isEligible: true,
    invalidQuantityItems: [],
    message: "Collab order unlocked — no payment, no shipping charges.",
  };
}

export function mapDiscountCoupon(row: {
  code: string;
  percent: number | string;
  label?: string | null;
  is_public?: boolean | null;
  min_order_value?: number | string | null;
  valid_upto?: string | null;
  is_free_order?: boolean | null;
  requires_login?: boolean | null;
  max_redemptions?: number | string | null;
  redemption_count?: number | string | null;
}): DiscountCode {
  return {
    code: normalizeDiscountCode(row.code),
    percent: Number(row.percent),
    label: row.label || `${Number(row.percent)}% off`,
    isPublic: Boolean(row.is_public),
    minOrderValue:
      row.min_order_value === null || row.min_order_value === undefined
        ? null
        : Number(row.min_order_value),
    validUpto: row.valid_upto ?? null,
    isFreeOrder: Boolean(row.is_free_order),
    requiresLogin: Boolean(row.requires_login),
    maxRedemptions:
      row.max_redemptions === null || row.max_redemptions === undefined
        ? null
        : Number(row.max_redemptions),
    redemptionCount: Number(row.redemption_count ?? 0),
  };
}

export function calculateDiscount(
  subtotal: number,
  discountCode: DiscountCode | null | undefined,
): DiscountResult {
  const minOrderValue = discountCode?.minOrderValue ?? null;
  const shortfall =
    minOrderValue !== null ? Math.max(minOrderValue - subtotal, 0) : 0;

  if (!discountCode || subtotal <= 0 || shortfall > 0) {
    return {
      code: discountCode?.code ?? null,
      percent: discountCode?.percent ?? 0,
      amount: 0,
      subtotalAfterDiscount: subtotal,
      isEligible: Boolean(discountCode) && shortfall === 0,
      shortfall,
    };
  }

  const amount = Number((subtotal * (discountCode.percent / 100)).toFixed(2));
  const subtotalAfterDiscount = Math.max(
    Number((subtotal - amount).toFixed(2)),
    0,
  );

  return {
    code: discountCode.code,
    percent: discountCode.percent,
    amount,
    subtotalAfterDiscount,
    isEligible: true,
    shortfall: 0,
  };
}
