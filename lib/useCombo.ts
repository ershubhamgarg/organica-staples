"use client";

import { useEffect, useState } from "react";

import type { ComboSettings, ComboUnit } from "@/app/api/combo/route";

export type ComboData = { settings: ComboSettings; items: ComboUnit[] };

/**
 * Shared client-side view of the combo configuration.
 *
 * The listing, the product page and the combo banner all need it, so the
 * request is made once per page load and shared — otherwise simply opening a
 * product would fire the same fetch two or three times.
 */
let cache: ComboData | null = null;
let inFlight: Promise<ComboData | null> | null = null;

function loadCombo(): Promise<ComboData | null> {
  if (cache) return Promise.resolve(cache);
  if (inFlight) return inFlight;

  inFlight = fetch("/api/combo")
    .then((res) => (res.ok ? res.json() : null))
    .then((result: ComboData | null) => {
      cache = result && "items" in result ? result : null;
      return cache;
    })
    .catch(() => null)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function useCombo(): { data: ComboData | null; isLoaded: boolean } {
  const [data, setData] = useState<ComboData | null>(cache);
  const [isLoaded, setIsLoaded] = useState(cache !== null);

  useEffect(() => {
    let active = true;

    void loadCombo().then((result) => {
      if (!active) return;
      setData(result);
      setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return { data, isLoaded };
}

/**
 * Whether the combo builder is live. Everything that *removes* a combo-only
 * item from ordinary sale must check this first: with combos switched off,
 * hiding those items from the pantry would leave them unsellable entirely.
 */
export function isComboLive(data: ComboData | null): boolean {
  if (!data?.settings.isEnabled) return false;
  return data.items.length >= data.settings.minItems;
}
