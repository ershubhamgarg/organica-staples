-- Verified live: `products`/`product_inventory` allow any authenticated
-- user to write (the CMS's access model is "logged in to the admin panel",
-- not per-row ownership) — but product_variants/product_variant_inventory
-- only got a SELECT policy in the previous migration, so the CMS's
-- replaceVariants() was silently blocked by RLS. Matching the same model
-- here so the CMS can actually manage variants.
drop policy if exists "Authenticated users can write variants" on public.product_variants;
create policy "Authenticated users can write variants"
on public.product_variants for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can write variant inventory" on public.product_variant_inventory;
create policy "Authenticated users can write variant inventory"
on public.product_variant_inventory for all
to authenticated
using (true)
with check (true);
