-- Supports the Shiprocket webhook's fallback lookup (app/api/shiprocket/webhook)
-- when a payload doesn't carry an AWB code — it matches by Shiprocket's own
-- order id instead.
create index if not exists orders_shiprocket_order_id_idx
  on public.orders(shiprocket_order_id)
  where shiprocket_order_id is not null;
