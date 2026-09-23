/**
 * The key format a combo-eligible product/variant is addressed by, shared
 * between everywhere that links into the builder with "add this one for
 * me" (product cards, the product page, anywhere else in future) and the
 * builder itself (app/combo/page.tsx, /api/combo's ComboUnit.key).
 *
 * Must stay byte-for-byte identical to how /api/combo builds a unit's key —
 * a variant is `${productId}-${variantId}`, a plain product is just its id.
 */
export function getComboUnitKey(
  productId: string | number,
  variantId?: string | number,
): string {
  return variantId !== undefined
    ? `${productId}-${variantId}`
    : String(productId);
}

/** The combo builder, pre-loaded with this one item via ?add=. */
export function getComboAddHref(
  productId: string | number,
  variantId?: string | number,
): string {
  return `/combo?add=${encodeURIComponent(getComboUnitKey(productId, variantId))}`;
}
