import {
  getPurchasableVariants,
  hasVariants,
  isComboOnlyProduct,
  isProductAvailable,
  type Product,
  type ProductVariant,
} from "@/lib/data";
import {
  getDiscountedPrice,
  getDiscountPercent,
  getVariantDiscountedPrice,
  getVariantDiscountPercent,
} from "@/lib/pricing";

/**
 * A best-selling product as the home section shows it: one concrete, buyable
 * size with its final price. A product sold in several sizes is shown as its
 * cheapest in-stock size; the product page carries the rest.
 */
export type BestSellerEntry = {
  product: Product;
  variant: ProductVariant | null;
  /** The product with the chosen size's price/weight/discount applied. */
  display: Product;
  price: number;
  mrp: number;
  discountPercent: number;
};

function entryFor(
  product: Product,
  variant: ProductVariant | null,
): BestSellerEntry {
  const display: Product = variant
    ? {
        ...product,
        price: variant.price,
        weight: variant.weight,
        // A variant's own discount is final — never stacked on the base's.
        discount: variant.discountPercent ?? null,
        stock_quantity: variant.stockQuantity,
      }
    : product;

  return {
    product,
    variant,
    display,
    price: variant
      ? getVariantDiscountedPrice(variant)
      : getDiscountedPrice(product),
    mrp: display.price,
    discountPercent: variant
      ? getVariantDiscountPercent(variant)
      : getDiscountPercent(product),
  };
}

function cheapestBuyable(product: Product): BestSellerEntry | null {
  if (hasVariants(product)) {
    const buyable = product.variants
      .filter(
        (v) =>
          v.isActive !== false &&
          v.price > 0 &&
          isProductAvailable({
            available: product.available,
            stock_quantity: v.stockQuantity,
          }),
      )
      .map((v) => entryFor(product, v))
      .sort((a, b) => a.price - b.price);

    return buyable[0] ?? null;
  }

  if (!(product.price > 0) || !isProductAvailable(product)) return null;
  return entryFor(product, null);
}

/**
 * The flagged products that can actually be bought right now, strongest first
 * (most reviews, then best rating) so the top seller can take centre stage.
 *
 * Once the combo builder is live, combo-only sizes are excluded exactly as in
 * the pantry: a best seller must never advertise a pack that can't be bought
 * on its own. With combos off nothing is withheld.
 */
export function buildBestSellerEntries(
  products: Product[],
  flaggedIds: string[],
  comboLive: boolean,
): BestSellerEntry[] {
  const flagged = new Set(flaggedIds);

  return products
    .filter((p) => flagged.has(String(p.id)) && p.isVisible !== false)
    .filter((p) => !(comboLive && isComboOnlyProduct(p)))
    .map((p) =>
      comboLive && hasVariants(p)
        ? { ...p, variants: getPurchasableVariants(p) }
        : p,
    )
    .sort(
      (a, b) =>
        (b.review_count ?? 0) - (a.review_count ?? 0) ||
        (b.rating ?? 0) - (a.rating ?? 0),
    )
    .map(cheapestBuyable)
    .filter((e): e is BestSellerEntry => e !== null)
    .slice(0, 3);
}
