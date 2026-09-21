import type { Product } from "@/lib/data";

/**
 * Combo membership for cart lines.
 *
 * Nothing is stored on the cart line to mark it as "part of a combo".
 * Combo-only sizes cannot be bought anywhere else — the pantry, the product
 * page and the cart's size switcher all withhold them — so a combo-only line
 * in the cart can only have come from the builder. Membership is therefore
 * *derived* from the catalogue rather than tracked, which means it stays
 * correct for carts persisted before this rule existed, and it follows the
 * admin if they change an item's eligibility later.
 *
 * The rule enforced here: the combo-only lines in a cart must number either
 * zero or at least `minItems`. A part-built combo cannot be checked out.
 */

type CartLine = {
  id: string;
  name?: string;
  variantId?: string;
  variantLabel?: string;
  quantity?: number;
};

export type ComboCartState<T extends CartLine = CartLine> = {
  /** Cart lines that belong to a combo. */
  comboLines: T[];
  /**
   * Distinct SKUs in the combo. Quantity is deliberately ignored: two of the
   * same spice is still one item toward the minimum.
   */
  count: number;
  minItems: number;
  /** True when the cart contains any combo item at all. */
  isActive: boolean;
  /** False only when a combo is started but left incomplete. */
  isValid: boolean;
  /** How many more combo items are needed. 0 when valid. */
  shortfall: number;
  message: string;
};

export function isComboCartLine(
  item: CartLine,
  catalogProducts: Product[],
): boolean {
  // Compared as strings: /api/products copies the raw Postgres row, so a
  // product id is a number at runtime even though the type says string.
  const product = catalogProducts.find((p) => String(p.id) === String(item.id));
  if (!product) return false;

  if (item.variantId) {
    const variant = (product.variants ?? []).find(
      (v) => String(v.id) === String(item.variantId),
    );
    return variant?.isComboEligible === true;
  }

  return product.is_combo_eligible === true;
}

export function getComboCartState<T extends CartLine>(
  items: T[],
  catalogProducts: Product[],
  minItems: number,
  comboLive: boolean,
): ComboCartState<T> {
  const empty: ComboCartState<T> = {
    comboLines: [],
    count: 0,
    minItems,
    isActive: false,
    isValid: true,
    shortfall: 0,
    message: "",
  };

  // With the builder switched off these items are ordinary stock again, so
  // there is no combo to be part-built and nothing to block.
  if (!comboLive) return empty;

  // The catalogue is what membership is derived from; before it loads every
  // line would look non-combo, which would wrongly report a valid cart.
  if (catalogProducts.length === 0) return empty;

  const comboLines = items.filter((item) =>
    isComboCartLine(item, catalogProducts),
  );

  if (comboLines.length === 0) return empty;

  const count = comboLines.length;
  const shortfall = Math.max(minItems - count, 0);

  return {
    comboLines,
    count,
    minItems,
    isActive: true,
    isValid: shortfall === 0,
    shortfall,
    message:
      shortfall === 0
        ? ""
        : `Your combo needs at least ${minItems} different items — add ${shortfall} more to check out.`,
  };
}
