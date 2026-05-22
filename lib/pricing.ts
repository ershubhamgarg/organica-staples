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

export function getUnitPriceInfo(product: Product): string | null {
  const price = getDiscountedPrice(product);
  const weightStr = product.weight.toLowerCase();

  // Extract number and unit
  const match = weightStr.match(/(\d+\.?\d*)\s*([a-z]+)/);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2];

  if (!value) return null;

  // Logic for different units
  if (unit === "kg") {
    const pricePer100g = (price / (value * 1000)) * 100;
    return `₹${pricePer100g.toFixed(1)}/100g`;
  }

  if (unit === "gm" || unit === "g") {
    const pricePer100g = (price / value) * 100;
    return `₹${pricePer100g.toFixed(1)}/100g`;
  }

  if (unit === "l" || unit === "liter" || unit === "litre") {
    const pricePer100ml = (price / (value * 1000)) * 100;
    return `₹${pricePer100ml.toFixed(1)}/100ml`;
  }

  if (unit === "ml") {
    const pricePer100ml = (price / value) * 100;
    return `₹${pricePer100ml.toFixed(1)}/100ml`;
  }

  return null;
}
