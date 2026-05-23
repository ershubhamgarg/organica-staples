import type { Product } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type ProductInventoryRow = {
  available_quantity?: number | null;
  low_stock_threshold?: number | null;
};

type ProductRow = Product & {
  product_inventory?: ProductInventoryRow | ProductInventoryRow[] | null;
};

const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !key) {
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const getInventory = (row: ProductRow) => {
  if (Array.isArray(row.product_inventory)) {
    return row.product_inventory[0] ?? null;
  }

  return row.product_inventory ?? null;
};

const mapProduct = (row: ProductRow): Product => {
  const inventory = getInventory(row);
  const stockQuantity = inventory?.available_quantity;
  const lowStockThreshold = inventory?.low_stock_threshold;
  const product = { ...row };
  delete product.product_inventory;

  return {
    ...product,
    stock_quantity:
      typeof stockQuantity === "number" ? stockQuantity : product.stock_quantity,
    low_stock_threshold:
      typeof lowStockThreshold === "number"
        ? lowStockThreshold
        : product.low_stock_threshold,
    available: typeof stockQuantity === "number" ? stockQuantity > 0 : product.available,
  };
};

export async function GET(request: Request) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase product lookup is not configured." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("id");

  let query = supabase
    .from("products")
    .select("*, product_inventory(available_quantity, low_stock_threshold)");

  if (productId) {
    query = query.eq("id", productId);
  }

  const { data, error } = await query;

  if (error) {
    if (
      error.code === "PGRST200" ||
      error.code === "PGRST204" ||
      error.code === "42P01"
    ) {
      let fallbackQuery = supabase.from("products").select("*");

      if (productId) {
        fallbackQuery = fallbackQuery.eq("id", productId);
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        return NextResponse.json(
          { error: fallbackError.message, code: fallbackError.code },
          { status: 500 },
        );
      }

      const fallbackProducts = (fallbackData ?? []) as Product[];
      return NextResponse.json({
        products: fallbackProducts,
        product: productId ? (fallbackProducts[0] ?? null) : null,
      });
    }

    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 },
    );
  }

  const products = ((data ?? []) as ProductRow[]).map(mapProduct);

  return NextResponse.json({
    products,
    product: productId ? (products[0] ?? null) : null,
  });
}
