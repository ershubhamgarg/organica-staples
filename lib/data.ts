export interface ProductVariant {
  id: string;
  productId: string;
  label: string;
  weight: string;
  price: number;
  /** 0-100. Final for this variant — not stacked with the base product's own `discount`. */
  discountPercent?: number | null;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  isActive?: boolean;
  /** Sold only inside a build-your-own combo, never as a standalone pack. */
  isComboEligible?: boolean;
}

export interface Product {
  id: string;
  name: string;
  name2?: string;
  description: string;
  price: number;
  image: string;
  images?: string[] | string | null;
  category: string;
  origin: string;
  weight: string;
  benefits: string[];
  discount?: number | null;
  rating?: number;
  review_count?: number;
  available?: boolean | null;
  stock_quantity?: number | null;
  low_stock_threshold?: number | null;
  isVisible?: boolean | null;
  /**
   * Sold only inside a build-your-own combo. Only meaningful for a product
   * with no variants — when a product has variants, this is decided per
   * variant via `ProductVariant.isComboEligible`.
   */
  is_combo_eligible?: boolean | null;
  justLaunched?: boolean | null;
  isLaunchingSoon?: boolean | null;
  launchDate?: string | null;
  launch_status?: "available" | "just_launched" | "launching_soon" | null;
  launch_badge_text?: string | null;
  /** GST tariff classification — same across all of a product's variants. */
  hsn_code?: string | null;
  /** Absent/empty = a plain single-price product (today's behavior, unchanged). */
  variants?: ProductVariant[];
}

export function hasVariants(
  product: Pick<Product, "variants">,
): product is Pick<Product, "variants"> & { variants: ProductVariant[] } {
  return Array.isArray(product.variants) && product.variants.length > 0;
}

/**
 * Combo-only sizes are merchandised as sampler sizes: they exist so someone
 * can try the range cheaply via /combo, not so they can be bought one at a
 * time. The three helpers below are the single definition of that rule —
 * the listing, the product page and the cart all defer to them.
 *
 * This is a merchandising rule, not a security boundary: the combo builder
 * deliberately emits ordinary cart lines, so a combo-only size in the cart is
 * indistinguishable from any other line by the time it reaches the server.
 */
export function getComboOnlyVariants(
  product: Pick<Product, "variants">,
): ProductVariant[] {
  return (product.variants ?? []).filter((v) => v.isComboEligible === true);
}

/** The sizes a customer can buy on their own, combo-only ones removed. */
export function getPurchasableVariants(
  product: Pick<Product, "variants">,
): ProductVariant[] {
  return (product.variants ?? []).filter((v) => v.isComboEligible !== true);
}

/**
 * True when there is nothing left to buy outside a combo — either a
 * single-size product flagged combo-only, or one whose every variant is.
 */
export function isComboOnlyProduct(
  product: Pick<Product, "variants" | "is_combo_eligible">,
): boolean {
  if (hasVariants(product)) {
    return getPurchasableVariants(product).length === 0;
  }
  return product.is_combo_eligible === true;
}

export function getProductThumbnail(product: Product): string {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return product.image;
}

export function isProductAvailable(
  product: Pick<Product, "available" | "stock_quantity">,
): boolean {
  if (typeof product.stock_quantity === "number") {
    return product.stock_quantity > 0;
  }

  return product.available !== false;
}

export function isProductLowStock(
  product: Pick<Product, "stock_quantity" | "low_stock_threshold">,
): boolean {
  if (
    typeof product.stock_quantity !== "number" ||
    typeof product.low_stock_threshold !== "number"
  ) {
    return false;
  }

  return (
    product.stock_quantity > 0 &&
    product.stock_quantity <= product.low_stock_threshold
  );
}
