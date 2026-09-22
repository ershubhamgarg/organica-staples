-- Best-selling products, shown as the home page's opening section.
--
-- The CMS marks products; the storefront reads the flag. At most 3 products
-- can carry it at once, and that limit is enforced HERE, in the database,
-- not just in the CMS form: a form check can be bypassed by a stale tab, a
-- second admin, or a direct API call, and a 4th best seller would break the
-- section's layout.
--
-- Safe to run before deploying: the storefront reads this column through its
-- own route and simply shows the regular hero until any product is flagged.

alter table public.products
  add column if not exists is_best_seller boolean not null default false;

comment on column public.products.is_best_seller is
  'Featured in the home page best sellers section. At most 3 products at a time (enforced by trigger).';

create or replace function public.enforce_best_seller_limit()
returns trigger
language plpgsql
as $$
begin
  if new.is_best_seller is true then
    -- Serialise concurrent flaggers so two admins each adding "the third"
    -- at the same moment cannot both pass the count and end up with four.
    perform pg_advisory_xact_lock(hashtext('products_best_seller_limit'));

    if (
      select count(*)
      from public.products
      where is_best_seller is true
        and id is distinct from new.id
    ) >= 3 then
      raise exception
        'Only 3 products can be marked as best selling. Unmark another product first.'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists products_best_seller_limit on public.products;
create trigger products_best_seller_limit
  before insert or update of is_best_seller on public.products
  for each row
  execute function public.enforce_best_seller_limit();
