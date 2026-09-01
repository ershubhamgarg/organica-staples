-- Prevent the same Razorpay payment from ever backing two separate orders
-- (replay protection for the /api/orders payment-verification flow).
create unique index if not exists orders_razorpay_payment_id_unique
  on public.orders ((payment_details->>'provider_payment_id'))
  where payment_details->>'provider_payment_id' is not null;
