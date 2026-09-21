"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Leaf,
  Minus,
  Plus,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";

import ImageWithFallback from "@/components/ImageWithFallback";
import type { ComboSettings, ComboUnit } from "@/app/api/combo/route";
import { hasVariants, type Product } from "@/lib/data";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { useUserStore } from "@/store/userStore";

type ComboResponse = { settings: ComboSettings; items: ComboUnit[] };

export default function ComboPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const replaceComboItems = useCartStore((state) => state.replaceComboItems);
  const { user } = useUserStore();
  const { products, fetchProducts } = useProductStore();

  const [data, setData] = useState<ComboResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  /**
   * The customer's own edits, keyed by ComboUnit.key → quantity. Null until
   * they touch something, so the page shows the combo already in their cart
   * without copying it into state from an effect.
   */
  const [edits, setEdits] = useState<Record<string, number> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/combo")
      .then((res) => res.json())
      .then((result: ComboResponse | { error?: string }) => {
        if (!active) return;
        if ("items" in result) setData(result);
      })
      .catch(() => {
        /* Falls through to the empty state below. */
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // The catalogue supplies the real Product objects. Building cart lines from
  // those (rather than from the trimmed combo payload) guarantees a combo line
  // is byte-for-byte what the pantry would have produced for the same item.
  useEffect(() => {
    if (products.length === 0) void fetchProducts();
  }, [products.length, fetchProducts]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const settings = data?.settings;
  const minItems = settings?.minItems ?? 4;

  // Cart lines matching one of the eligible units *are* the combo already in
  // the cart — combo sizes aren't sold anywhere else. They're both what the
  // builder opens with and what confirming replaces.
  const existingCombo = useMemo(() => {
    const byKey = new Map(items.map((item) => [item.key, item]));
    return cartItems.flatMap((line) => {
      const key = line.variantId
        ? `${line.id}-${line.variantId}`
        : String(line.id);
      const unit = byKey.get(key);
      return unit ? [{ unit, line }] : [];
    });
  }, [items, cartItems]);

  const existingComboKeys = useMemo(
    () =>
      existingCombo.map(({ line }) => ({
        id: line.id,
        variantId: line.variantId,
      })),
    [existingCombo],
  );

  // Open with the combo they already have, so the page is an editor rather
  // than a second combo that silently stacks on the first.
  const fromCart = useMemo(
    () =>
      Object.fromEntries(
        existingCombo.map(({ unit, line }) => [unit.key, line.quantity]),
      ) as Record<string, number>,
    [existingCombo],
  );
  const picked = edits ?? fromCart;

  const selectedUnits = useMemo(
    () =>
      items
        .filter((item) => (picked[item.key] ?? 0) > 0)
        .map((item) => ({ unit: item, quantity: picked[item.key] })),
    [items, picked],
  );
  const total = useMemo(
    () =>
      selectedUnits.reduce(
        (sum, { unit, quantity }) => sum + unit.price * quantity,
        0,
      ),
    [selectedUnits],
  );
  /**
   * Distinct SKUs chosen — this is what the minimum measures. Quantity only
   * changes the price: two of the same spice is still one item, not two.
   */
  const packCount = selectedUnits.length;

  const remaining = Math.max(minItems - packCount, 0);
  const isComplete = remaining === 0 && packCount > 0;
  // The floating cart shows whenever the cart has something in it. On
  // mobile it is a full-width panel at the bottom, so the bar sits above it;
  // on desktop it lives bottom-right and the bar's content stays left of it.
  const hasFloatingCart = cartItems.length > 0;

  const setQuantity = (key: string, quantity: number) => {
    setAddError(null);
    setEdits((prev) => {
      const next = { ...(prev ?? fromCart) };
      if (quantity <= 0) {
        delete next[key];
      } else {
        next[key] = quantity;
      }
      return next;
    });
  };

  const toggle = (key: string) => {
    setQuantity(key, (picked[key] ?? 0) > 0 ? 0 : 1);
  };

  const handleAddCombo = () => {
    if (!isComplete || isAdding) return;
    setIsAdding(true);

    // Resolve everything up front so a unit that can't be matched fails
    // visibly instead of silently shrinking the combo.
    const lines = selectedUnits.flatMap(({ unit, quantity }) => {
      // Compared as strings on purpose. Product.id is typed `string`, but
      // /api/products copies the raw Postgres row, so at runtime it is the
      // bigint as a *number*; this route stringifies it. A `===` between the
      // two silently matched nothing and produced an empty cart.
      const product = products.find((p) => String(p.id) === unit.productId);
      if (!product) return [];

      const variant =
        unit.variantId && hasVariants(product)
          ? product.variants.find((v) => String(v.id) === unit.variantId)
          : undefined;

      // A unit that names a variant must resolve to that variant — falling
      // back to the base product here would add the wrong size at the wrong
      // price rather than fail visibly.
      if (unit.variantId && !variant) return [];

      // Same substitution QuickAddButton makes, so the line carries the
      // variant's own price/weight/discount rather than the base product's.
      const effective: Product = variant
        ? {
            ...product,
            price: variant.price,
            weight: variant.weight,
            discount: variant.discountPercent ?? null,
            stock_quantity: variant.stockQuantity,
          }
        : product;

      return [
        {
          product: effective,
          quantity,
          variantId: variant?.id,
          variantLabel: variant?.label,
        },
      ];
    });

    // Never navigate to the cart having quietly dropped items — that is
    // indistinguishable from the button doing nothing at all.
    if (lines.length !== selectedUnits.length) {
      setIsAdding(false);
      setAddError(
        "We couldn't add some of these items just now. Please refresh and try again.",
      );
      return;
    }

    // Replace rather than append: the builder is prefilled from whatever
    // combo is already in the cart, so confirming means "this is my combo
    // now". One atomic store update, one Supabase sync.
    replaceComboItems(existingComboKeys, lines, user?.id);

    router.push("/cart");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (!settings?.isEnabled) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-brand-cream px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
          <ShoppingBasket size={22} strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-xl text-brand-brown">
          Combos aren&apos;t available right now
        </h1>
        <p className="mt-2 text-xs font-light text-brand-brown/50">
          Do explore the full pantry in the meantime.
        </p>
        <Link
          href="/#shop"
          className="mt-6 rounded-full bg-brand-green px-7 py-3 text-[10px] font-black uppercase tracking-widest text-brand-cream"
        >
          Explore The Pantry
        </Link>
      </div>
    );
  }

  const notEnoughStock = items.length < minItems;

  return (
    <div
      className={`min-h-screen bg-brand-cream ${
        hasFloatingCart ? "pb-64 lg:pb-40" : "pb-40"
      }`}
    >
      {/* Header */}
      <section className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-mandala opacity-60" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="h-px w-8 bg-brand-gold" />
            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.35em] text-brand-gold">
              <Sparkles size={11} strokeWidth={2} />
              Sampler Pack
            </span>
            <span className="h-px w-8 bg-brand-gold" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight text-brand-brown sm:text-4xl">
            {settings.title}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm font-light leading-relaxed text-brand-brown/60">
            {settings.subtitle ??
              `Try our staples in smaller packs. Pick any ${minItems} or more different items and we'll box them together — same honest prices, a much smaller first step.`}
          </p>
        </div>
      </section>

      {notEnoughStock ? (
        <div className="mx-auto max-w-md px-6 pb-20 text-center">
          <p className="rounded-2xl border border-brand-gold/20 bg-white/70 px-5 py-6 text-xs font-light leading-relaxed text-brand-brown/60">
            We&apos;re restocking the sampler sizes right now — please check
            back shortly.
          </p>
        </div>
      ) : (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {items.map((item) => {
              const quantity = picked[item.key] ?? 0;
              const isSelected = quantity > 0;

              return (
                <div
                  key={item.key}
                  className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition-all duration-300 ${
                    isSelected
                      ? "border-brand-green shadow-xl shadow-brand-green/10 ring-2 ring-brand-green/30"
                      : "border-brand-gold/15 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-lg"
                  }`}
                >
                  {/* The whole tile toggles; the stepper below takes over
                      once something is chosen. */}
                  <button
                    type="button"
                    onClick={() => toggle(item.key)}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Remove" : "Add"} ${item.name} ${item.label}`}
                    className="block w-full text-left"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-brand-sand">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                      />

                      <span
                        className={`absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                          isSelected
                            ? "border-brand-green bg-brand-green text-brand-cream"
                            : "border-white/70 bg-white/80 text-transparent"
                        }`}
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>
                    </div>

                    <div className="px-3 pt-3">
                      <p className="text-[8px] font-black uppercase tracking-[0.22em] text-brand-gold">
                        {item.category}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-serif text-[13px] leading-tight text-brand-brown">
                        {item.name}
                      </h3>
                      <div className="mt-2 flex items-baseline justify-between gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-brown/40">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-brand-brown">
                          ₹{item.price.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="px-3 pb-3 pt-2">
                    {isSelected ? (
                      <div className="flex items-center justify-between rounded-full border border-brand-green/30 bg-brand-green/5 px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, quantity - 1)}
                          aria-label={`Fewer ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-brand-brown transition-colors hover:bg-white"
                        >
                          <Minus size={13} strokeWidth={3} />
                        </button>
                        <span className="text-xs font-black tabular-nums text-brand-brown">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, quantity + 1)}
                          aria-label={`More ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-brand-brown transition-colors hover:bg-white"
                        >
                          <Plus size={13} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggle(item.key)}
                        className="w-full rounded-full border border-brand-gold/25 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand-brown/60 transition-colors hover:border-brand-gold/50 hover:text-brand-brown"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-center text-[10px] font-light text-brand-brown/40">
            <Leaf size={11} className="text-brand-gold" />
            Your combo is added to the cart as one set, and you can edit it
            there before checkout.
          </p>
        </section>
      )}

      {/* Sticky summary */}
      {!notEnoughStock && (
        <div
          className={`fixed left-0 right-0 z-40 border-t border-brand-gold/20 bg-brand-cream/95 px-4 py-4 shadow-[0_-12px_40px_-18px_rgba(60,54,42,0.35)] backdrop-blur-md sm:px-6 ${
            hasFloatingCart ? "bottom-[104px] lg:bottom-0" : "bottom-0"
          }`}
        >
          {addError && (
            <p className="mx-auto mb-3 max-w-5xl text-[11px] font-medium text-red-700">
              {addError}
            </p>
          )}
          <div className="mx-auto flex max-w-5xl items-center gap-5 sm:gap-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-brown/45">
                  {packCount} of {minItems}
                  <span className="hidden sm:inline"> different items</span>
                  <span className="sm:hidden"> chosen</span>
                </span>
                {isComplete && (
                  <span className="rounded-full bg-brand-green-fresh px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                    Ready
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="mt-2 flex items-center gap-1.5">
                {Array.from({ length: minItems }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-7 rounded-full transition-colors duration-300 ${
                      index < packCount
                        ? "bg-brand-green"
                        : "bg-brand-brown/10"
                    }`}
                  />
                ))}
                {packCount > minItems && (
                  <span className="ml-1 text-[9px] font-bold text-brand-green">
                    +{packCount - minItems}
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-lg font-bold leading-none tracking-tight text-brand-brown">
                ₹{total.toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddCombo}
              // The catalogue supplies the Product objects the cart needs, so
              // a click before it lands could not build any lines.
              disabled={!isComplete || isAdding || products.length === 0}
              className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-brand-green px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-cream shadow-lg shadow-brand-green/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 sm:px-8"
            >
              {isComplete
                ? `Add Combo · ₹${total.toFixed(0)}`
                : `Add ${remaining} More`}
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
