/**
 * Shared loading placeholders.
 *
 * The rule these exist to enforce: a screen waiting on data should show the
 * *shape* of what's coming, never an empty state. "No products match your
 * filters" flashing before the catalogue arrives reads as a dead end — the
 * customer has no way to tell it apart from a genuinely empty result.
 *
 * All of these are presentational and inert: `aria-hidden` with a polite
 * status wrapper where a screen reader needs to know something is loading.
 */

/** A single shimmering block. Compose these into a screen's own layout. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-brand-brown/[0.07] ${className}`}
    >
      <div className="animate-skeleton absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent" />
    </div>
  );
}

/**
 * Mirrors the shop/product grid card: square image, then the name, size,
 * price and button block beneath it — so the grid doesn't reflow when the
 * real cards replace these.
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-gold/10 bg-white shadow-lg shadow-brand-brown/5 sm:rounded-3xl">
      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="flex flex-col items-center gap-2 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3.5">
        <Skeleton className="h-2 w-12 rounded-full" />
        <Skeleton className="h-3.5 w-3/4 rounded-full" />
        <Skeleton className="h-2.5 w-10 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="mt-1 h-9 w-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * A full grid of card skeletons. `count` should roughly match what a first
 * screenful shows, so the page doesn't visibly grow as real data lands.
 */
export function ProductGridSkeleton({
  count = 8,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className={
        className ||
        "grid min-h-[60vh] grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-4"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading products…</span>
    </div>
  );
}
