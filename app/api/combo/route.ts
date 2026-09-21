import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getDiscountedPrice, getVariantDiscountedPrice } from "@/lib/pricing";
import type { Product } from "@/lib/data";

/**
 * Feeds the build-your-own combo builder at /combo.
 *
 * Returns a flat list of *purchasable units* rather than products, because a
 * unit is either a whole product (single-size items like Amchur 100g) or one
 * specific variant (Turmeric 100g). The builder never has to reason about
 * that distinction — it just renders units.
 *
 * Column allowlist is deliberate and mirrors app/api/products/route.ts: the
 * products table also holds wholesale_price / margin_percentage /
 * packet_cost / sticker_cost, which must never reach the browser.
 */

const COMBO_SELECT =
  "id, name, name2, category, price, discount, weight, images, isVisible, is_combo_eligible, product_inventory(available_quantity), product_variants(id, label, weight, price, discount_percent, is_active, sort_order, is_combo_eligible, product_variant_inventory(available_quantity))";

type InventoryRow = { available_quantity?: number | null };

type VariantRow = {
  id: number | string;
  label: string;
  weight: string;
  price: number;
  discount_percent?: number | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  is_combo_eligible?: boolean | null;
  product_variant_inventory?: InventoryRow | InventoryRow[] | null;
};

type ProductRow = {
  id: number | string;
  name: string;
  name2?: string | null;
  category?: string | null;
  price: number;
  discount?: number | null;
  weight?: string | null;
  images?: string[] | string | null;
  isVisible?: boolean | null;
  is_combo_eligible?: boolean | null;
  product_inventory?: InventoryRow | InventoryRow[] | null;
  product_variants?: VariantRow[] | null;
};

export type ComboUnit = {
  /** Stable key for selection state — also disambiguates variants. */
  key: string;
  productId: string;
  variantId?: string;
  name: string;
  name2?: string | null;
  /** The size shown to the customer, e.g. "100 gms". */
  label: string;
  category: string;
  price: number;
  image: string;
};

export type ComboSettings = {
  isEnabled: boolean;
  minItems: number;
  title: string;
  subtitle: string | null;
};

const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !key) return null;

  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const stockOf = (inventory: InventoryRow | InventoryRow[] | null | undefined) =>
  (Array.isArray(inventory) ? inventory[0] : inventory)?.available_quantity ?? 0;

/** `images` may be a real array, a JSON string, or comma-separated. */
const firstImage = (images: string[] | string | null | undefined): string => {
  if (Array.isArray(images)) return images.find(Boolean) ?? "";
  if (typeof images !== "string" || !images.trim()) return "";

  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) return parsed.find(Boolean) ?? "";
  } catch {
    return images.split(",")[0]?.trim() ?? "";
  }

  return "";
};

const DEFAULT_SETTINGS: ComboSettings = {
  isEnabled: false,
  minItems: 4,
  title: "Build Your Own Combo",
  subtitle: null,
};

export async function GET() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase combo lookup is not configured." },
      { status: 500 },
    );
  }

  const [settingsResult, productsResult] = await Promise.all([
    supabase
      .from("combo_settings")
      .select("is_enabled, min_items, title, subtitle")
      .eq("id", 1)
      .maybeSingle(),
    // Matches the pantry's `isVisible !== false` (ProductListing.tsx:50):
    // a NULL here means "never set", which the storefront treats as visible.
    // `.neq("isVisible", false)` would have dropped those rows.
    supabase
      .from("products")
      .select(COMBO_SELECT)
      .or("isVisible.is.null,isVisible.eq.true"),
  ]);

  if (productsResult.error) {
    return NextResponse.json(
      { error: productsResult.error.message, code: productsResult.error.code },
      { status: 500 },
    );
  }

  const settingsRow = settingsResult.data;
  const settings: ComboSettings = settingsRow
    ? {
        isEnabled: Boolean(settingsRow.is_enabled),
        minItems: Number(settingsRow.min_items) || DEFAULT_SETTINGS.minItems,
        title: settingsRow.title || DEFAULT_SETTINGS.title,
        subtitle: settingsRow.subtitle ?? null,
      }
    : DEFAULT_SETTINGS;

  const items: ComboUnit[] = [];

  for (const row of (productsResult.data ?? []) as unknown as ProductRow[]) {
    const productId = String(row.id);
    const image = firstImage(row.images);
    const category = row.category ?? "";
    const variants = (row.product_variants ?? [])
      .filter((v) => v.is_active !== false && v.is_combo_eligible)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    // A product's eligible variants and its own flag are independent: a
    // product with variants is bought as a variant, so only those count.
    if (variants.length > 0) {
      for (const variant of variants) {
        if (stockOf(variant.product_variant_inventory) <= 0) continue;

        items.push({
          key: `${productId}-${variant.id}`,
          productId,
          variantId: String(variant.id),
          name: row.name,
          name2: row.name2 ?? null,
          label: variant.label || variant.weight,
          category,
          price: getVariantDiscountedPrice({
            price: Number(variant.price),
            discountPercent: variant.discount_percent,
          }),
          image,
        });
      }
      continue;
    }

    if (!row.is_combo_eligible) continue;
    if (stockOf(row.product_inventory) <= 0) continue;

    items.push({
      key: productId,
      productId,
      name: row.name,
      name2: row.name2 ?? null,
      label: row.weight ?? "",
      category,
      price: getDiscountedPrice({
        price: Number(row.price),
        discount: row.discount ?? null,
      } as Product),
      image,
    });
  }

  items.sort((a, b) => a.price - b.price);

  return NextResponse.json({ settings, items });
}
