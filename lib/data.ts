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
}
