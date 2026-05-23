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

- **Product Data**: Fetched from Supabase `products` table. Types in `lib/data.ts`.
- **Pricing**: Helpers in `lib/pricing.ts` handle discounts and unit price calculations (e.g., `getUnitPriceInfo` for ₹/100g or ₹/100ml display).
- **Cart Sync**: `store/cartStore.ts` syncs to Supabase `carts` for logged-in users; otherwise persists to localStorage.
- **Availability**: Out-of-stock products (`is_available: false`) use `blur-[2px]`, "Available Soon" badge, and hidden prices.
- **Reviews**: Only render review text if it contains non-whitespace content.

## Design System: "Desi Premium"

- **Palette**: `brand-cream` (BG), `brand-brown` (text/primary), `brand-green` (accents), `brand-gold` (luxury highlights), `brand-terracotta` (earthy accents).
- **Typography**: Inter (sans) for body, Playfair Display (serif) for headings.
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
