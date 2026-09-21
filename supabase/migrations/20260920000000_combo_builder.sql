-- Build-your-own combo (sampler packs).
--
-- Customers assemble a sampler from small 100g items so trying the range is a
-- low-commitment purchase. Price is the plain sum of the chosen items — there
-- is no bundle price — so a combo needs no representation in orders at all:
-- the storefront builder simply emits ordinary cart lines. That is why this
-- migration touches neither place_order_with_inventory nor order_items.
--
-- Eligibility lives on BOTH tables because it is a property of a purchasable
-- unit, not of a product: spices/seeds are sold as 100g *variants*, while
-- Amchur is a single-size 100g *product* with no variants at all.

alter table public.products
  add column if not exists is_combo_eligible boolean not null default false;

alter table public.product_variants
  add column if not exists is_combo_eligible boolean not null default false;

comment on column public.products.is_combo_eligible is
  'Product (with no variants) can be picked in the combo builder.';
comment on column public.product_variants.is_combo_eligible is
  'This specific size can be picked in the combo builder.';

-- Single-row settings table, so the rules are tunable from the CMS without a
-- deploy. The id check keeps it to exactly one row.
create table if not exists public.combo_settings (
  id         smallint primary key default 1 check (id = 1),
  is_enabled boolean not null default false,
  min_items  integer not null default 4 check (min_items >= 2),
  title      text not null default 'Build Your Own Combo',
  subtitle   text,
  updated_at timestamptz not null default now()
);

insert into public.combo_settings (id) values (1) on conflict (id) do nothing;

alter table public.combo_settings enable row level security;

drop policy if exists "Combo settings are readable by everyone" on public.combo_settings;
create policy "Combo settings are readable by everyone"
  on public.combo_settings
  for select
  using (true);

drop policy if exists "Authenticated users can update combo settings" on public.combo_settings;
create policy "Authenticated users can update combo settings"
  on public.combo_settings
  for update
  to authenticated
  using (true)
  with check (true);
