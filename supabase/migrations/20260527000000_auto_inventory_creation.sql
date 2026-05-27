-- Function to automatically create product_inventory when a new product is added
create or replace function public.handle_new_product_inventory()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.product_inventory (product_id, available_quantity)
  values (new.id, 0)
  on conflict (product_id) do nothing;
  return new;
end;
$$;

-- Trigger to call the function after a product is inserted
drop trigger if exists on_product_created on public.products;
create trigger on_product_created
after insert on public.products
for each row execute function public.handle_new_product_inventory();

-- Backfill any missing inventory records for existing products
insert into public.product_inventory (product_id, available_quantity)
select id, 0
from public.products
on conflict (product_id) do nothing;
