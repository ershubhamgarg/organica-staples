import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Ids of the products marked best selling in the CMS (at most 3 — enforced by
 * a database trigger). Kept separate from /api/products on purpose: if the
 * column doesn't exist yet (migration not run), this returns an empty list and
 * only the best-sellers section stays dormant, rather than every product
 * query failing.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.PREVIEW_IDS) return NextResponse.json({ ids: process.env.PREVIEW_IDS.split(",") }); // TEMP-PREVIEW-REMOVE
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !key) {
    return NextResponse.json({ ids: [] });
  }

  const supabase = createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("is_best_seller", true)
    .neq("isVisible", false)
    .limit(3);

  if (error) {
    return NextResponse.json({ ids: [] });
  }

  return NextResponse.json({ ids: (data ?? []).map((row) => String(row.id)) });
}
