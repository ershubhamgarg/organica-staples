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
  rating?: number | null;
  review_count?: number | null;
  available?: boolean | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  delivery_address: Address;
  payment_method: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string;
}
