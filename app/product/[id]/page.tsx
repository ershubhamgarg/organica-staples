import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import {
  getProductThumbnail,
  isProductAvailable,
  type Product,
} from "@/lib/data";
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

async function getProductForMetadata(idOrSlug: string): Promise<Product | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  // Only what the metadata/OG tags need — never `*`, which would pull the
  // internal cost columns (wholesale_price, margin_percentage, packet_cost,
  // sticker_cost) into a page-level fetch.
  // The URL segment is either a slug (canonical) or a legacy numeric id.
  const isNumericId = /^\d+$/.test(idOrSlug);
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name, name2, description, category, price, weight, origin, images, isVisible",
    )
    .eq(isNumericId ? "id" : "slug", idOrSlug)
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

  const title = `Buy ${product.name} Online | Pure & Chemical Free`;
  const socialTitle = `${title} | ANNVRIKSH`;
  const description = toPlainText(
    product.description ||
      `Buy ${product.name} online from ANNVRIKSH — chemical-free, ethically sourced Indian staples delivered fresh to your door.`,
    160,
  );
  const image = getProductThumbnail(product);
  const url = `${BASE_URL}/product/${product.slug ?? product.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      type: "website",
      images: image
        ? [{ url: image, width: 1200, height: 1200, alt: product.name }]
        : undefined,
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

  // Old /product/<id> links (bookmarks, shared links, search results) keep
  // working but consolidate onto the canonical slug URL.
  if (product?.slug && /^\d+$/.test(id)) {
    permanentRedirect(`/product/${product.slug}`);
  }

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: toPlainText(product.description || product.name, 500),
        image: getProductThumbnail(product)
          ? [getProductThumbnail(product)]
          : undefined,
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
          url: `${BASE_URL}/product/${product.slug ?? product.id}`,
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
      <ProductPageClient id={product?.id ?? id} />
    </>
  );
}
