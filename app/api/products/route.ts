import type { Product } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type ProductInventoryRow = {
  available_quantity?: number | null;
  low_stock_threshold?: number | null;
};

type ProductRow = Product & {
  product_inventory?: ProductInventoryRow | ProductInventoryRow[] | null;
  launch_status?: string | null;
  launch_date?: string | null;
  launch_badge_text?: string | null;
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
  const product = Object.fromEntries(
    Object.entries(row).filter(([key]) => key !== "product_inventory"),
  ) as Product;

  if (product.name === "Cold Pressed Mustard Oil") {
    product.name2 = "सरसों का तेल (Sarson ka Tel)";
    product.benefits = [
      "Rich in monounsaturated fatty acids",
      "Traditional cold-press extraction",
      "High smoke point for healthy cooking",
      "Natural source of Vitamin E",
      "Promotes heart health and digestion",
      "Chemical-free and unrefined",
    ];
  } else if (product.name === "Raw Himalayan Honey") {
    product.name2 = "हिमालयन शहद (Himalayan Shahad)";
    product.benefits = [
      "Ethically sourced from Himalayan hives",
      "Natural immunity booster",
      "Rich in antioxidants and minerals",
      "Anti-bacterial and anti-inflammatory",
      "Unfiltered and unprocessed purity",
      "Perfect natural sweetener",
    ];
  } else if (product.name === "A2 Desi Cow Ghee") {
    product.name2 = "शुद्ध देसी घी (Shuddh Desi Ghee)";
    product.benefits = [
      "Made from A2 milk of Desi cows",
      "Hand-churned Bilona method",
      "Improves digestion and metabolism",
      "Rich in fat-soluble vitamins",
      "Promotes healthy skin and hair",
      "Lactose-free and highly nutritious",
    ];
  }

  return {
    ...product,
    stock_quantity:
      typeof stockQuantity === "number"
        ? stockQuantity
        : product.stock_quantity,
    low_stock_threshold:
      typeof lowStockThreshold === "number"
        ? lowStockThreshold
        : product.low_stock_threshold,
    available:
      typeof stockQuantity === "number" ? stockQuantity > 0 : product.available,
    // Map new launch status columns to frontend properties
    justLaunched: row.launch_status === "just_launched",
    isLaunchingSoon: row.launch_status === "launching_soon",
    launchDate: row.launch_date,
    launch_badge_text: row.launch_badge_text,
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
