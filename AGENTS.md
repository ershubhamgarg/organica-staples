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
- `/cart`: cart quantity/remove + free shipping over ₹500
- `/checkout`: address, mocked UPI verify, order placement
- `/login`: Supabase email/password auth
- `/profile`: user profile/orders/addresses
- `/our-story`: brand content
- `/api/verify-vpa`: mocked VPA/UPI validation endpoint

## Data Flow

- Product type only: `lib/data.ts` (no static product array)
- Listing fetches live products from Supabase table `products`: `components/ProductListing.tsx`
- Product detail fetches by id from Supabase via `store/productStore.ts`.
- Discounted pricing helpers live in `lib/pricing.ts`; cart stores discounted item prices.
- Cart: `store/cartStore.ts`; syncs to Supabase `carts` by `user_id`, fallback is persisted local cart.
- Auth: `store/userStore.ts`; on sign-in/fetch syncs cart, addresses, orders.
- Addresses/orders: `store/addressStore.ts`, `store/orderStore.ts`; tolerate missing Supabase tables (`42P01`) with local fallback.

## UI Conventions

- Brand colors/fonts live in `app/globals.css`; `layout.tsx` loads Inter + Playfair and wraps all pages with `Header` + footer.
- Prefer existing components: `Header`, `ProductListing`, `QuickAddButton`, `ImageWithFallback`.
- Many page components are client components because Zustand/localStorage/Supabase browser auth are used.
- Currency is INR (`₹`); brand tone is premium organic pantry, restrained olive/gold/cream.

## Gotchas

- Do not assume Supabase tables exist locally; code already has fallbacks for addresses/orders only.
- `utils/supabase.ts` logs on import and uses non-null env assertions.
- Remote image host additions require `next.config.ts`.
- `next.config.ts` currently ends with `//test`; leave unrelated edits alone unless asked.
