-- Tracks Razorpay refund status per order so a cancelled order's refund
-- state (not yet issued / pending / processed / failed) can be shown to the
-- customer without calling Razorpay's API on every page load.
alter table public.orders
  add column if not exists razorpay_refund_id text,
  add column if not exists refund_status text,
  add column if not exists refund_amount numeric,
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_checked_at timestamptz;
