-- CRITICAL: orders has never had Row Level Security enabled. Verified live
-- that any authenticated user (including a freshly signed-up throwaway
-- account) can read every other customer's full order row via the anon-key
-- client — full name, address, phone, Razorpay payment_details, and
-- internal wholesale_total_amount/cost_to_company/profit_loss. Run this
-- immediately; it only restricts access, it cannot break anything, since
-- every legitimate write already goes through service-role API routes
-- (which bypass RLS entirely) and the only direct client-side read
-- (store/orderStore.ts fetchOrders) already filters to auth.uid() = user_id.
alter table public.orders enable row level security;

-- Idempotent: a prior partial run left a policy of this name in place
-- (without RLS actually enabled, so it had no effect) — drop and recreate
-- rather than assume its definition matches what we want.
drop policy if exists "Users can view their own orders" on public.orders;

create policy "Users can view their own orders"
  on public.orders
  for select
  using (auth.uid() = user_id);

-- invoice_sequences holds only a per-financial-year counter (no PII) and is
-- only ever touched via the security-definer get_next_invoice_number
-- function called from service-role routes — enabling RLS with no policies
-- makes that explicit (deny-all to anon/authenticated) rather than relying
-- on it happening to have no grants.
alter table public.invoice_sequences enable row level security;
