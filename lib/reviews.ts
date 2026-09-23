/**
 * Review tallies read as "1 review" but "0 reviews" / "2 reviews".
 *
 * Kept here rather than inline at each call site so every place that shows a
 * count — product card, shop grid, product page — agrees on the wording.
 * Callers that render in caps do so with CSS (`uppercase`), so this returns
 * lowercase and lets the styling decide.
 */
export function reviewNoun(count: number): string {
  return count === 1 ? "review" : "reviews";
}

/** `3 reviews` / `1 review` — the count and its noun together. */
export function reviewCountLabel(count: number): string {
  return `${count} ${reviewNoun(count)}`;
}
