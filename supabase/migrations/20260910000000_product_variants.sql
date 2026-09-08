-- Product weight/quantity variants (e.g. wheat flour in 5 Kg or 10 Kg, each
-- its own price and stock). Strictly additive and opt-in per product:
-- product_inventory (PK = product_id alone, one stock counter per product)
-- is never restructured, so every existing product with zero variants keeps
-- working through the exact same code path with zero migration.

create table if not exists public.product_variants (
  id bigint primary key generated always as identity,
  product_id bigint not null references public.products(id) on delete cascade,
  label text not null,
  weight text not null,
  price numeric not null default 0,
  wholesale_price numeric,
  sku text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx
  on public.product_variants(product_id);

alter table public.product_variants enable row level security;

drop policy if exists "Variants are readable by everyone" on public.product_variants;
create policy "Variants are readable by everyone"
on public.product_variants for select
using (true);

-- Variant-level stock lives in its own table, keyed by variant_id, rather
-- than repurposing product_inventory (whose product_id primary key
-- structurally allows only one stock counter per product).
create table if not exists public.product_variant_inventory (
  variant_id bigint primary key references public.product_variants(id) on delete cascade,
  available_quantity integer not null default 0 check (available_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists product_variant_inventory_available_idx
  on public.product_variant_inventory(available_quantity);

alter table public.product_variant_inventory enable row level security;

drop policy if exists "Variant inventory is readable by everyone" on public.product_variant_inventory;
create policy "Variant inventory is readable by everyone"
on public.product_variant_inventory for select
using (true);

create or replace function public.touch_product_variant_inventory_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_product_variant_inventory_updated_at on public.product_variant_inventory;
create trigger touch_product_variant_inventory_updated_at
before update on public.product_variant_inventory
for each row execute function public.touch_product_variant_inventory_updated_at();

-- Mirrors the existing on_product_created trigger (see
-- 20260527000000_auto_inventory_creation.sql) — every new variant
-- automatically gets a zero-stock row, so the CMS never has to remember to
-- insert one itself.
create or replace function public.on_variant_created()
returns trigger
language plpgsql
as $$
begin
  insert into public.product_variant_inventory (variant_id, available_quantity)
  values (new.id, 0)
  on conflict (variant_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_variant_created on public.product_variants;
create trigger on_variant_created
after insert on public.product_variants
for each row execute function public.on_variant_created();

-- Nullable and default-null: every existing order_items row, and every
-- future non-variant order item, is completely unaffected.
alter table public.order_items
  add column if not exists variant_id bigint references public.product_variants(id) on delete restrict;

create index if not exists order_items_variant_id_idx
  on public.order_items(variant_id)
  where variant_id is not null;
