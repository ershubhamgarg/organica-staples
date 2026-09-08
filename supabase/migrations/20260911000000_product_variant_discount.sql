-- Per-variant discount percentage, set from the admin CMS. Applied to that
-- variant's own `price` to get what the customer actually pays — never
-- stacked with the base product's own scalar `discount` (see
-- lib/pricing.ts's getVariantDiscountedPrice / the "variant price is
-- final" note in app/api/orders/route.ts's recomputeOrderPricing).
--
-- Idempotent: this column was already added manually against the live
-- database (shared with the admin CMS repo, which surfaced the same SQL to
-- its operator) before this migration file existed here, so `if not
-- exists`/`if not exists` guards make this safe to run regardless.

alter table public.product_variants
  add column if not exists discount_percent numeric not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_variants_discount_percent_check'
  ) then
    alter table public.product_variants
      add constraint product_variants_discount_percent_check
      check (discount_percent >= 0 and discount_percent <= 100);
  end if;
end $$;
