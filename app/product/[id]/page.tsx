import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

import { getProductThumbnail, isProductAvailable, type Product } from "@/lib/data";
import ProductPageClient from "./ProductPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://annvriksh.com";

const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !key) {
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

async function getProductForMetadata(id: string): Promise<Product | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as Product | null) ?? null;
}

const toPlainText = (value: string, maxLength: number) => {
  const plain = value.replace(/\s+/g, " ").trim();
  return plain.length > maxLength
    ? `${plain.slice(0, maxLength - 1).trimEnd()}…`
    : plain;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductForMetadata(id);

  if (!product) {
    return {
      title: "Product",
      alternates: { canonical: `${BASE_URL}/product/${id}` },
    };
  }

  const title = `Buy ${product.name} Online | 100% Organic`;
  const socialTitle = `${title} | ANNVRIKSH`;
  const description = toPlainText(
    product.description ||
      `Buy ${product.name} online from ANNVRIKSH — 100% organic, ethically sourced Indian staples delivered fresh to your door.`,
    160,
  );
  const image = getProductThumbnail(product);
  const url = `${BASE_URL}/product/${product.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      type: "website",
      images: image ? [{ url: image, width: 1200, height: 1200, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductForMetadata(id);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: toPlainText(product.description || product.name, 500),
        image: getProductThumbnail(product) ? [getProductThumbnail(product)] : undefined,
        sku: product.id,
        category: product.category,
        brand: { "@type": "Brand", name: "ANNVRIKSH" },
        ...(product.rating && product.review_count
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.review_count,
              },
            }
          : {}),
        offers: {
          "@type": "Offer",
          url: `${BASE_URL}/product/${product.id}`,
          priceCurrency: "INR",
          price: product.price,
          availability: isProductAvailable(product)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient id={id} />
    </>
  );
}
