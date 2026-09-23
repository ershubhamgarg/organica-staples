import type { Metadata } from "next";
import { Suspense } from "react";
import ShopContent from "@/components/ShopContent";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full ANNVRIKSH pantry — organic, chemical-free Indian staples, spices, dals and seeds. Filter by category and price, sorted your way.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    // useSearchParams (read inside ShopContent, to prefill from the header
    // search) requires a Suspense boundary.
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}
