export interface Product {
  id: string;
  name: string;
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
  isVisible?: boolean | null;
  preorder_enabled?: boolean | null;
  preorder_price?: number | null;
  preorder_deposit_percent?: number | null;
  preorder_deposit_amount?: number | null;
  preorder_inventory_limit?: number | null;
  preorder_reserved_quantity?: number | null;
  preorder_ship_by?: string | null;
  preorder_deadline?: string | null;
  preorder_full_payment_due?: string | null;
  preorder_cancellation_policy?: string | null;
  preorder_refund_policy?: string | null;
  preorder_terms?: string | null;
}

export function getProductThumbnail(product: Product): string {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return product.image;
}

export function isProductAvailable(product: Pick<Product, "available">): boolean {
  return product.available !== false;
}
