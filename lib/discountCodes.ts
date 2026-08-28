export type DiscountCode = {
  code: string;
  percent: number;
  label: string;
  isPublic: boolean;
  minOrderValue: number | null;
  validUpto: string | null;
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

export function mapDiscountCoupon(row: {
  code: string;
  percent: number | string;
  label?: string | null;
  is_public?: boolean | null;
  min_order_value?: number | string | null;
  valid_upto?: string | null;
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
