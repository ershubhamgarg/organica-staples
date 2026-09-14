-- Seed the Ganesh Chaturthi 2026 coupon — 14% off, live through Ganeshotsav.

insert into discount_coupons (code, percent, label, is_active, is_public, min_order_value, valid_upto)
values (
  'GANESHA14',
  14,
  'Ganesh Chaturthi Special – 14% Off',
  true,
  true,
  null,
  '2026-09-23 23:59:59+05:30'
)
on conflict (code) do update
set
  percent = excluded.percent,
  label = excluded.label,
  is_active = excluded.is_active,
  is_public = excluded.is_public,
  min_order_value = excluded.min_order_value,
  valid_upto = excluded.valid_upto;
