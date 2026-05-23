alter table if exists public.orders
  add column if not exists subtotal_amount numeric default 0,
  add column if not exists discount_amount numeric default 0,
  add column if not exists shipping_amount numeric default 0,
  add column if not exists convenience_fee_amount numeric default 0,
  add column if not exists cod_amount numeric default 0,
  add column if not exists product_discount_amount numeric not null default 0,
  add column if not exists coupon_discount_amount numeric not null default 0,
  alter column subtotal_amount set default 0,
  alter column discount_amount set default 0,
  alter column shipping_amount set default 0,
  alter column convenience_fee_amount set default 0,
  alter column cod_amount set default 0;
