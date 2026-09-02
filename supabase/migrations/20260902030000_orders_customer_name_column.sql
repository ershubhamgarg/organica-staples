-- Surfaces the customer's name as a real column on `orders`, so it's visible
-- directly in the table editor / any SELECT without expanding the
-- delivery_address JSON. It's a generated column, so it's always kept in
-- sync automatically and never needs writing to separately.
alter table public.orders
  add column if not exists customer_name text
  generated always as (trim(both from delivery_address->>'name')) stored;
