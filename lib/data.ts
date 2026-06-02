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
  justLaunched?: boolean | null;
  isLaunchingSoon?: boolean | null;
  launchDate?: string | null;
  launch_status?: "available" | "just_launched" | "launching_soon" | null;
  launch_badge_text?: string | null;
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
