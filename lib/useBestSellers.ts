"use client";

import { useEffect, useState } from "react";

/**
 * Ids flagged as best selling in the CMS. Fetched once per page load and
 * shared, since the home page and any future consumer would otherwise each
 * make the same request. `isLoaded` distinguishes "still asking" from "asked,
 * and there are none" — the home page needs that to avoid flashing the wrong
 * section while it waits.
 */
let cache: string[] | null = null;
let inFlight: Promise<string[]> | null = null;

function load(): Promise<string[]> {
  if (cache) return Promise.resolve(cache);
  if (inFlight) return inFlight;

  inFlight = fetch("/api/best-sellers")
    .then((res) => (res.ok ? res.json() : { ids: [] }))
    .then((result: { ids?: string[] }) => {
      cache = Array.isArray(result.ids) ? result.ids : [];
      return cache;
    })
    .catch(() => [] as string[])
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function useBestSellerIds(): { ids: string[]; isLoaded: boolean } {
  const [ids, setIds] = useState<string[]>(cache ?? []);
  const [isLoaded, setIsLoaded] = useState(cache !== null);

  useEffect(() => {
    let active = true;

    void load().then((result) => {
      if (!active) return;
      setIds(result);
      setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return { ids, isLoaded };
}
