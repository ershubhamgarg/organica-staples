import { Suspense } from "react";
import ComboContent from "@/components/ComboContent";

export default function ComboPage() {
  // useSearchParams (read inside ComboContent, for the ?add=<unit key> deep
  // link from a product card/page's "Add to Combo" CTA) requires a Suspense
  // boundary.
  return (
    <Suspense fallback={null}>
      <ComboContent />
    </Suspense>
  );
}
