-- Add an expiry window to discount_coupons and seed the Raksha Bandhan 2026 coupon.

alter table discount_coupons
  add column if not exists valid_upto timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'discount_coupons_code_key'
  ) then
    alter table discount_coupons
      add constraint discount_coupons_code_key unique (code);
  end if;
end $$;

insert into discount_coupons (code, percent, label, is_active, is_public, min_order_value, valid_upto)
values (
  'RAKSHA10',
  10,
  'Raksha Bandhan Special – 10% Off',
  true,
  true,
  null,
  '2026-08-31 23:59:59+05:30'
)
on conflict (code) do update
set
  percent = excluded.percent,
  label = excluded.label,
  is_active = excluded.is_active,
  is_public = excluded.is_public,
  min_order_value = excluded.min_order_value,
  valid_upto = excluded.valid_upto;
