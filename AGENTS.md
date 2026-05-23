# Agent Brief

Next 16 + React 19 ecommerce app for Amritya Organics, an organic pantry store. App Router only; `pages/` is empty.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Stack

- TypeScript strict, path alias `@/*`
- Tailwind CSS v4 tokens in `app/globals.css`
- Zustand stores in `store/`, persisted to localStorage
- Supabase client in `utils/supabase.ts`; env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Icons: `lucide-react`; images: `next/image` with allowed hosts in `next.config.ts`

## Main Routes

- `/`: hero + product listing
- `/product/[id]`: product detail from `useProductStore`
- `/cart`: cart quantity/remove + tiered shipping (₹149 < ₹500, ₹99 < ₹1000, ₹49 < ₹1500, Free >= ₹1500)
- `/checkout`: address, mocked UPI verify, order placement
- `/login`: Supabase email/password auth
- `/profile`: user profile/orders/addresses
- `/our-story`: brand content
- `/api/verify-vpa`: mocked VPA/UPI validation endpoint

## Data Flow & Logic

- **Product Data**: Fetched through `/api/products`, which joins Supabase `products` with `product_inventory`. Types in `lib/data.ts`.
- **Pricing**: Helpers in `lib/pricing.ts` handle discounts and unit price calculations (e.g., `getUnitPriceInfo` for ₹/100g or ₹/100ml display).
- **Cart Sync**: `store/cartStore.ts` syncs to Supabase `carts` for logged-in users; otherwise persists to localStorage.
- **Availability**: Product availability is backend-driven from `product_inventory.available_quantity`. `isProductAvailable` treats stock `<= 0` as unavailable, which uses `blur-[2px]`, "Available Soon" badge, and hidden prices. Low stock uses `product_inventory.low_stock_threshold` and should show "Few Left" / "Only X left" style cues.
- **Reviews**: Only render review text if it contains non-whitespace content.

## Launch Offer

- **Offer Code**: `LAUNCHSTORY` in `lib/launchOffer.ts`.
- **Customer Rule**: Signed-in customers can claim the offer once per email address.
- **Cart Rule**: Exactly 2 different products, quantity 1 each. Product cost is waived, final total becomes ₹0, and the order uses `instagram_story_verification` as the payment method.
- **Claim Enforcement**: `/api/orders` validates the authenticated Supabase bearer token for launch-offer orders and passes the normalized user email to the `place_order_with_inventory` RPC. The database table `launch_offer_claims` has a unique constraint on normalized email to prevent duplicate claims.
- **Inventory Enforcement**: Orders go through `/api/orders` and the `place_order_with_inventory` RPC, which checks `product_inventory.available_quantity`, inserts the order, creates `order_items`, decrements stock, and creates the launch-offer claim atomically.
- **Promotion UI**: `components/LaunchOfferBanner.tsx` renders directly below `Header`. Cart and checkout also have launch-offer-specific messaging. The order confirmation has a photo-friendly receipt and a closable Instagram instruction banner.
- **Instagram Verification**: Launch-offer confirmation asks the customer to photograph the receipt, upload it to Instagram Story, and tag `@amritya_organics`. Keep these instructions outside the receipt or closable so the customer can hide them before taking the photo.

### To Stop Or Remove The Launch Offer

When the promotion ends, remove or disable all of these paths together so the UI, cart totals, and backend cannot disagree:

- Hide/remove `LaunchOfferBanner` from `components/Header.tsx`.
- Disable launch-offer eligibility in `lib/launchOffer.ts` (for example make `getLaunchOfferState` always return `isEligible: false`) or remove the helper after updating all callers.
- Remove launch-offer discount handling from `/cart` and `/checkout`, especially uses of `LAUNCH_OFFER_CODE`, `launchOffer.isEligible`, `launchOfferDiscount`, zero-product-cost totals, and `instagram_story_verification`.
- Remove or block the launch-offer branch in `/api/orders`; backend must no longer accept `paymentMethod === "instagram_story_verification"` or `discountCode === LAUNCH_OFFER_CODE` unless the offer is intentionally still active.
- Keep inventory validation/decrement logic. It is not launch-offer-specific and must remain for normal paid orders.
- Keep existing `launch_offer_claims` records for audit/history unless the business explicitly asks to delete promotional data. Do not drop the table casually because old launch-offer orders may reference those claims.
- Update the order confirmation copy if `instagram_story_verification` is removed, so normal paid orders do not mention Instagram Story verification.

## Design System: "Desi Premium"

- **Palette**: `brand-cream` (BG), `brand-brown` (text/primary), `brand-green` (accents), `brand-gold` (luxury highlights), `brand-terracotta` (earthy accents).
- **Typography**: Plus Jakarta Sans (sans) for body, Fraunces (soft-serif) for headings.
- **Textures**: `bg-jute`, `bg-organic-texture` (natural paper feel).
- **Borders**: Layered, irregular organic borders for images (`organic-border`, `organic-border-alt`). Standard UI elements (cards/buttons) use `rounded-3xl` or `rounded-full`.
- **Visuals**: Organic SVG illustrations (wheat stalks, matka, mortar & pestle, tulsi leaf).
- **UX Details**:
  - Cart count badge: scales and changes color on update.
  - Sound: Soft, bass-heavy click (~10% volume) for cart actions.
  - Discounts: All discount amounts and savings text MUST be displayed in `brand-green`.
  - Order Summary: Hide any summary item (shipping, convenience fee, discount) if its value is zero.
  - Navigation: Use Next.js `<Link>` for all internal routing, including hash IDs (e.g., `#shop`).

## Gotchas & Constraints

- **Mobile Sticky**: Product detail images MUST use `lg:sticky` (not `sticky`) to prevent broken scrolling on mobile browsers.
- **Supabase**: Do not assume tables exist; use fallbacks for addresses/orders.
- **Linter**: Ensure all component props are typed; avoid `any`.
- **Images**: Use `ImageWithFallback` for product images to handle remote loading errors gracefully.
- **Unit Prices**: Always display unit price info (from `getUnitPriceInfo`) next to the main price in listing and detail pages.
