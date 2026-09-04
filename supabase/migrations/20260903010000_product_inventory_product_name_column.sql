-- Adds product_name directly onto product_inventory, backfilled from
-- products.name. It's a plain column, not auto-synced — if a product is
-- renamed later, re-run the update below to refresh it.
alter table public.product_inventory
  add column if not exists product_name text;

update public.product_inventory pi
set product_name = p.name
from public.products p
where p.id = pi.product_id
  and pi.product_name is distinct from p.name;
