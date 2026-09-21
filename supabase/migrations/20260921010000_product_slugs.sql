-- Human-readable, stable URL identifiers for products (/product/turmeric-powder
-- instead of /product/4). `id` remains the primary key used by carts, orders,
-- inventory and variants — slug only affects URLs/SEO. The storefront accepts
-- either form and 301-redirects numeric ids to the canonical slug URL.
--
-- RUN THIS BEFORE deploying the storefront/CMS code that selects `slug`.

alter table public.products add column if not exists slug text;

with base as (
  select
    id,
    trim(both '-' from left(regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'), 70)) as s
  from public.products
  where slug is null
),
ranked as (
  select id, s, count(*) over (partition by s) as dupes from base
)
update public.products p
set slug = case
  when r.s = '' then 'product-' || p.id
  when r.dupes > 1 then r.s || '-' || p.id
  else r.s
end
from ranked r
where p.id = r.id;

create unique index if not exists products_slug_key on public.products (slug);
