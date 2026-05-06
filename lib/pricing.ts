import { Product } from "@/lib/data";

export function getDiscountPercent(product: Product): number {
  const discount = Number(product.discount || 0);

  if (!Number.isFinite(discount) || discount <= 0) {
    return 0;
  }

  return Math.min(discount, 100);
}

export function getDiscountedPrice(product: Product): number {
  const discount = getDiscountPercent(product);

  if (!discount) {
    return product.price;
  }

  return Number((product.price * (1 - discount / 100)).toFixed(2));
}

export function hasProductDiscount(product: Product): boolean {
  return getDiscountPercent(product) > 0;
}

export function hasHighProductDiscount(product: Product): boolean {
  return getDiscountPercent(product) >= 50;
}
