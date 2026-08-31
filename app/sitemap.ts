import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

/**
 * Base URL of the website.
 * In production, this should be the actual domain.
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://annvriksh.com";

/**
 * Helper to get Supabase client on the server.
 */
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Define static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/our-story`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/returns-and-refunds`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // 2. Fetch dynamic product routes
  const supabase = getSupabaseServerClient();
  let productRoutes: MetadataRoute.Sitemap = [];

  if (supabase) {
    try {
      const { data: products } = await supabase
        .from("products")
        .select("id, created_at")
        .eq("isVisible", true);

      if (products) {
        productRoutes = products.map((product) => ({
          url: `${BASE_URL}/product/${product.id}`,
          lastModified: product.created_at
            ? new Date(product.created_at)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
      }
    } catch (error) {
      console.error("Error fetching products for sitemap:", error);
    }
  }

  return [...staticRoutes, ...productRoutes];
}
