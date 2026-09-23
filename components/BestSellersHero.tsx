"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { ArrowRight, Leaf, ShieldCheck, Star } from "lucide-react";

import DesiHero from "@/components/DesiHero";
import ImageWithFallback from "@/components/ImageWithFallback";
import QuickAddButton from "@/components/QuickAddButton";
import { getProductThumbnail } from "@/lib/data";
import {
  buildBestSellerEntries,
  type BestSellerEntry,
} from "@/lib/bestSellers";
import { useBestSellerIds } from "@/lib/useBestSellers";
import { isComboLive, useCombo } from "@/lib/useCombo";
import { useProductStore } from "@/store/productStore";

function FourPointStar({
  className,
  delay = 0,
}: {
  className?: string;
  /** Seconds — staggers the twinkle so the sparkles don't blink in unison. */
  delay?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <path
        d="M12 0C12.8 7.4 16.6 11.2 24 12C16.6 12.8 12.8 16.6 12 24C11.2 16.6 7.4 12.8 0 12C7.4 11.2 11.2 7.4 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Alternating tilt per chip — reads as loosely scattered rather than a
// rigid row, without any of them overlapping the photo above.
const CHIP_ICONS = [Leaf, ShieldCheck];
const CHIP_TILT = ["-rotate-2", "rotate-2"];

/** Whole rupees stay whole — "₹65", not "₹65.00", which is dead weight on a
 *  card this narrow. Paise are shown only when a price actually has them. */
function formatRupees(value: number) {
  return Number.isInteger(value) ? `₹${value}` : `₹${value.toFixed(2)}`;
}

function BestSellerCard({
  entry,
  featured,
}: {
  entry: BestSellerEntry;
  featured: boolean;
}) {
  const { product, variant, display, price, mrp, discountPercent } = entry;
  // Capped to 4 words at a word boundary, not mid-word — a raw line-clamp on
  // a full benefit sentence ("Good source of plant-based protein") was
  // truncating mid-word into an ugly artifact.
  const benefits = (product.benefits ?? []).slice(0, 2).map((text) => {
    const words = text.split(" ");
    return words.length > 4 ? `${words.slice(0, 4).join(" ")}…` : text;
  });
  const href = `/product/${product.slug ?? product.id}`;

  return (
    <article
      className={`group relative flex min-w-0 shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-12px_rgba(17,44,36,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-16px_rgba(17,44,36,0.28)] sm:rounded-[1.75rem] ${
        featured
          ? "w-full ring-1 ring-brand-gold/40 xl:w-[17rem] 2xl:w-[19rem]"
          : "w-full xl:w-[15.5rem] 2xl:w-[17rem]"
      }`}
    >
      {/* Photo takes the full width of the card — the product is the point. */}
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden bg-brand-sand"
      >
        <ImageWithFallback
          src={getProductThumbnail(product)}
          alt={product.name}
          fill
          sizes="(max-width: 639px) 40vw, (max-width: 1279px) 25vw, 336px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          priority={featured}
        />

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-brand-brown shadow-sm backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[9px]">
          <Star size={9} className="text-brand-gold" fill="currentColor" strokeWidth={0} />
          Best Seller
        </span>

        {/* A diagonal ribbon rather than a quiet pill — the discount is the
            commercial hook of this section (there's no price to compare
            it against), so it needs to read at a glance, not on a second
            look. Clipped to a clean corner by the photo's own overflow. */}
        {discountPercent > 0 && (
          <div className="absolute -right-9 top-3.5 w-32 rotate-45 bg-gradient-to-b from-brand-terracotta to-[#8a4a37] py-1 text-center shadow-[0_4px_12px_rgba(0,0,0,0.35)] sm:-right-11 sm:top-5 sm:w-40 sm:py-1.5">
            <span className="text-[11px] font-extrabold uppercase leading-none tracking-wide text-white drop-shadow-sm sm:text-[13px]">
              {discountPercent}% Off
            </span>
          </div>
        )}
      </Link>

      {/* Qualities: a loosely scattered pair beneath the photo, never over it. */}
      {benefits.length > 0 && (
        <div className="-mt-3 flex flex-wrap justify-center gap-1.5 px-2 sm:gap-2 sm:px-4">
          {benefits.map((benefit, i) => {
            const Icon = CHIP_ICONS[i % CHIP_ICONS.length];
            return (
              <span
                key={benefit}
                // Only the first chip on mobile — two of them wrap onto a
                // second row on a card this narrow, for no added meaning.
                className={`items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-brand-brown shadow-md ring-1 ring-brand-brown/5 sm:px-2.5 sm:py-1.5 sm:text-[10px] ${
                  i === 0 ? "inline-flex" : "hidden sm:inline-flex"
                } ${CHIP_TILT[i % CHIP_TILT.length]}`}
              >
                <Icon size={11} className="shrink-0 text-brand-green-fresh" />
                <span className="max-w-[4.75rem] break-words leading-tight sm:max-w-[6.5rem]">
                  {benefit}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Name + CTA */}
      <div className="flex flex-1 flex-col px-2 pb-3 pt-2 text-center sm:px-4 sm:pb-4 sm:pt-3">
        <Link href={href}>
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-brand-brown transition-colors group-hover:text-brand-terracotta sm:text-[15px] xl:text-base">
            {product.name}
          </h3>
        </Link>
        {/* Size, then its price — the price belongs to this specific pack,
            so the two read as one unit ("100g · ₹65") rather than a number
            floating free of the size it applies to. */}
        <span className="mt-1 flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-brown/40">
          {variant?.label ?? display.weight}
          <span aria-hidden="true">·</span>
          <span className="text-[12px] tracking-tight text-brand-brown sm:text-[13px]">
            {formatRupees(price)}
          </span>
          {discountPercent > 0 && (
            <span className="text-[10px] font-light text-brand-brown/35 line-through">
              {formatRupees(mrp)}
            </span>
          )}
        </span>

        <div className="mt-2.5 sm:mt-3">
          <QuickAddButton
            product={product}
            selectedVariant={variant}
            className="!w-full !rounded-xl !px-2 !py-2.5"
          />
        </div>
      </div>
    </article>
  );
}

function HeroSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="relative min-h-[640px] overflow-hidden bg-brand-cream lg:min-h-[720px]"
    >
      <div className="toran opacity-70" />
      <div className="mx-auto mt-16 h-10 w-64 animate-pulse rounded-full bg-brand-brown/5" />
    </section>
  );
}

/**
 * The home page's opening section: the products marked "best selling" in the
 * CMS (at most 3), staged over a warm cream backdrop as a centred product
 * photo with its discount as a medallion and its top qualities as floating
 * tags scattered around it — no prices, since the pitch here is "loved and
 * discounted," not a price comparison (that lives on the product page).
 *
 * Cream rather than the brand's dark green on purpose — the "Spices" section
 * directly beneath is already dark (bg-brand-brown), so this stays light and
 * hands off into it via the closing curve.
 *
 * Falls back to the regular hero whenever there is nothing to show — none
 * flagged, none buyable, or the best-sellers migration not yet applied — so
 * the top of the home page is never empty.
 */
export default function BestSellersHero() {
  const { ids, isLoaded } = useBestSellerIds();
  const products = useProductStore((state) => state.products);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const { data: comboData } = useCombo();
  const comboLive = isComboLive(comboData);

  // Only worth loading the catalogue for once we know something is flagged.
  const hasFlagged = ids.length > 0;
  useEffect(() => {
    if (hasFlagged && products.length === 0) {
      void fetchProducts();
    }
  }, [hasFlagged, products.length, fetchProducts]);

  const entries = useMemo(
    () => buildBestSellerEntries(products, ids, comboLive),
    [products, ids, comboLive],
  );

  if (!isLoaded) return <HeroSkeleton />;
  if (ids.length === 0) return <DesiHero />;
  if (products.length === 0) return <HeroSkeleton />;
  if (entries.length === 0) return <DesiHero />;

  // entries[0] is already the strongest performer (buildBestSellerEntries
  // ranks by review count, then rating), so it doubles as "the featured
  // card" with no reordering needed for the mobile grid, where it simply
  // renders first. Centring it in the desktop row is done with `xl:order-*`
  // below instead of reordering the array, since the array order is also
  // what drives the mobile grid.
  const featuredKey = entries[0].product.id;
  // Only meaningful with all 3 slots filled — centring one of two, or the
  // only one, isn't a real "centre" position.
  const centreOnDesktop = entries.length === 3;
  const XL_ORDER = ["xl:order-2", "xl:order-1", "xl:order-3"];

  return (
    <section
      aria-labelledby="best-sellers-heading"
      className="relative overflow-hidden bg-brand-cream text-brand-brown"
    >
      {/* Backdrop: warm cream, a faint gold sunburst, soft glow, marigold garland */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-sand/25 via-brand-cream to-brand-cream" />
      <div className="pointer-events-none absolute -right-[10%] top-1/2 aspect-square w-[130%] -translate-y-1/2 lg:right-[-8%] lg:w-[78%]">
        <div className="sunburst animate-rays h-full w-full" />
      </div>
      <div className="pointer-events-none absolute right-[12%] top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-brand-gold/15 blur-[110px]" />
      <div className="bg-mandala pointer-events-none absolute inset-0 opacity-[0.035]" />
      <div className="toran pointer-events-none absolute inset-x-0 top-0 z-10" />

      <FourPointStar className="animate-twinkle absolute right-[7%] top-24 hidden h-6 w-6 text-brand-gold lg:block" />
      <FourPointStar
        delay={1.1}
        className="animate-twinkle absolute right-[43%] top-40 hidden h-4 w-4 text-brand-terracotta/70 lg:block"
      />
      <FourPointStar
        delay={2.2}
        className="animate-twinkle absolute bottom-32 right-[3%] hidden h-5 w-5 text-brand-gold lg:block"
      />

      <div className="relative z-10 mx-auto grid max-w-[95rem] items-center gap-5 px-5 pb-16 pt-7 sm:gap-8 sm:px-10 sm:pb-20 sm:pt-12 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.6fr)] xl:gap-6 xl:pb-20 xl:pt-14">
        {/* Copy */}
        <div className="text-left">
          <span className="inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-brand-terracotta">
            <span className="h-px w-8 bg-brand-gold" />
            Most Loved
          </span>

          <h1
            id="best-sellers-heading"
            className="mt-2 font-serif text-[1.7rem] leading-[1.05] tracking-tight sm:mt-5 sm:text-4xl xl:text-6xl"
          >
            <span className="block text-brand-brown">Meet our</span>
            <span className="relative mt-1 inline-block italic text-brand-terracotta">
              Best Sellers
              {/* Hand-drawn underline swash */}
              <svg
                viewBox="0 0 300 18"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-2.5 w-full text-brand-gold sm:-bottom-3 sm:h-3.5"
                aria-hidden="true"
              >
                <path
                  d="M3 12C60 3 130 2 190 8C230 12 265 10 297 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-2.5 max-w-md text-[11px] font-light leading-relaxed text-brand-brown/65 sm:mt-5 sm:text-sm md:text-base">
            The staples our customers order most — pure, chemical-free and
            priced honestly, straight from the farm to your kitchen.
          </p>

          {/* The CTA comes right after the intro, ahead of the credential
              row below — it's the thing on this page most worth reaching
              without scrolling, so nothing decorative sits in front of it. */}
          <Link
            href="/shop"
            className="group mt-4 inline-flex items-center gap-2.5 rounded-full bg-brand-green px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-brand-cream shadow-xl shadow-brand-brown/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-green-light sm:mt-6 sm:gap-3 sm:px-8 sm:py-4 sm:text-[10px]"
          >
            Shop the full pantry
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          {/* Nice-to-have, not essential — hidden below sm so a mobile
              visitor isn't scrolling past it to reach the CTA above. */}
          <ul className="mt-6 hidden flex-wrap items-center gap-y-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-brown/70 sm:flex sm:text-[11px]">
            {["Chemical-Free", "Ethically Sourced"].map((label, i) => (
              <li
                key={label}
                className={`flex items-center ${
                  i > 0 ? "border-l border-brand-brown/15 pl-4 ml-4" : ""
                }`}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Stage: a swipeable, edge-to-edge row on mobile — every card is the
            same compact size so all three are reachable within a thumb's
            reach instead of one full-width card eating the whole screen.
            Becomes the centred desktop row at xl. */}
        <div className="-mx-5 flex snap-x snap-mandatory items-end gap-3 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-10 sm:gap-4 sm:px-10 xl:mx-0 xl:justify-center xl:gap-6 xl:overflow-visible xl:px-0 xl:pb-0 2xl:gap-10 [&::-webkit-scrollbar]:hidden">
          {entries.map((entry, index) => {
            const isFeatured = entry.product.id === featuredKey;
            return (
              <div
                key={`${entry.product.id}-${entry.variant?.id ?? "base"}`}
                className={`w-[9.25rem] shrink-0 snap-start sm:w-[11.5rem] xl:w-auto ${
                  centreOnDesktop ? XL_ORDER[index] : ""
                } ${
                  // Lift the featured card above its neighbours once it's
                  // actually centred among them.
                  isFeatured && centreOnDesktop ? "xl:-translate-y-6" : ""
                }`}
              >
                <BestSellerCard entry={entry} featured={isFeatured} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Curved hand-off into the dark "Spices" section right beneath this one. */}
      <div className="absolute bottom-0 left-0 z-10 w-full overflow-hidden leading-none">
        <svg
          className="relative block h-[34px] w-full sm:h-[60px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.83C51.17,110,123.64,103.49,185.34,92.83,243.33,82.8,285,63.15,321.39,56.44Z"
            fill="#112C24"
          />
        </svg>
      </div>
    </section>
  );
}
