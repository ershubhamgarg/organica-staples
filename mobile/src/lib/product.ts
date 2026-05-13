import { Product } from "@/types/domain";

export function getProductImages(product: Product): string[] {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  if (typeof product.images === "string" && product.images.trim()) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [product.images];
    }
  }

  return [product.image].filter(Boolean);
}

export function getProductThumbnail(product: Product): string {
  return getProductImages(product)[0] || product.image;
}
