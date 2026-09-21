import { Truck } from "lucide-react";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

/**
 * Site-wide ticker above the header. Both claims mirror rules the checkout
 * actually applies: local-pincode delivery is free, and standard shipping is
 * waived from FREE_SHIPPING_THRESHOLD.
 *
 * It sticks to the top of the viewport and is exactly `h-8`; the sticky
 * header sits at `top-8` to stay directly beneath it. Change one, change both.
 */
const MESSAGES = [
  "Free Delivery in Sirsa",
  `Free Shipping Above \u20b9${FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")}`,
];

// Enough repeats that one half is wider than any realistic screen, which is
// what keeps the loop gap-free on ultrawide displays.
const REPEATS = 6;

function Half({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {Array.from({ length: REPEATS }).flatMap((_, round) =>
        MESSAGES.map((message) => (
          <span
            key={`${round}-${message}`}
            className="flex shrink-0 items-center gap-8 pl-8 whitespace-nowrap"
          >
            <Truck size={12} strokeWidth={2} className="text-brand-gold" />
            {message}
            <span aria-hidden="true" className="text-brand-gold">
              &#9670;
            </span>
          </span>
        )),
      )}
    </div>
  );
}

export default function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Announcements"
      className="marquee-pause sticky top-0 z-60 h-8 overflow-hidden bg-brand-green text-brand-cream"
    >
      <div className="animate-marquee flex h-full w-max items-center text-[10px] font-black uppercase tracking-[0.2em]">
        <Half />
        <Half hidden />
      </div>
    </div>
  );
}
