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
