import { Product } from "@/types/domain";
import { BRAND } from "@/constants/brand";

export function getDiscountPercent(product: Product): number {
  const discount = Number(product.discount || 0);
  if (!Number.isFinite(discount) || discount <= 0) return 0;
  return Math.min(discount, 100);
}

export function getDiscountedPrice(product: Product): number {
  const discount = getDiscountPercent(product);
  if (!discount) return product.price;
  return Number((product.price * (1 - discount / 100)).toFixed(2));
}

export function hasProductDiscount(product: Product): boolean {
  return getDiscountPercent(product) > 0;
}

export function hasHighProductDiscount(product: Product): boolean {
  return getDiscountPercent(product) >= 50;
}

export function getCartTotals(items: Array<Product & { quantity: number }>) {
  const actualSubtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const subtotal = items.reduce(
    (total, item) => total + getDiscountedPrice(item) * item.quantity,
    0,
  );
  const discount = Math.max(actualSubtotal - subtotal, 0);
  const shipping =
    subtotal > 0 && subtotal <= BRAND.freeShippingThreshold
      ? BRAND.shippingFee
      : 0;

  return {
    actualSubtotal,
    subtotal,
    discount,
    shipping,
    total: subtotal + shipping,
  };
}
