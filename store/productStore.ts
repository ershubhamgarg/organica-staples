"use client";

import { create } from "zustand";
import { Product, products as initialProducts } from "@/lib/data";

interface ProductState {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: initialProducts,
  getProduct: (id: string) => get().products.find((p) => p.id === id),
}));
