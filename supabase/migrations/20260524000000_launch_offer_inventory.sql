create table if not exists public.product_inventory (
  product_id bigint primary key references public.products(id) on delete cascade,
  available_quantity integer not null default 0 check (available_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.launch_offer_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  normalized_email text generated always as (lower(trim(email))) stored,
  order_id uuid,
  claimed_at timestamptz not null default now(),
  unique (normalized_email)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  delivery_address jsonb not null default '{}'::jsonb,
  payment_method text not null,
  payment_details jsonb,
  subtotal_amount numeric not null default 0,
  discount_code text,
  discount_percent numeric,
  product_discount_amount numeric not null default 0,
  coupon_discount_amount numeric not null default 0,
  discount_amount numeric not null default 0,
  shipping_amount numeric not null default 0,
  convenience_fee_amount numeric not null default 0,
  cod_amount numeric not null default 0,
  total_amount numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table if exists public.orders
  add column if not exists payment_details jsonb,
  add column if not exists subtotal_amount numeric not null default 0,
  add column if not exists discount_code text,
  add column if not exists discount_percent numeric,
  add column if not exists product_discount_amount numeric not null default 0,
  add column if not exists coupon_discount_amount numeric not null default 0,
  add column if not exists discount_amount numeric not null default 0,
  add column if not exists shipping_amount numeric not null default 0,
  add column if not exists convenience_fee_amount numeric not null default 0,
  add column if not exists cod_amount numeric not null default 0;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists product_inventory_available_idx on public.product_inventory(available_quantity);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'stock_quantity'
  ) then
    execute '
      insert into public.product_inventory (product_id, available_quantity)
      select id, greatest(coalesce(stock_quantity, 0), 0)::integer
      from public.products
      on conflict (product_id) do nothing
    ';
  else
    insert into public.product_inventory (product_id, available_quantity)
    select id, 0
    from public.products
    on conflict (product_id) do nothing;
  end if;
end;
$$;

create or replace function public.touch_product_inventory_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_product_inventory_updated_at on public.product_inventory;
create trigger touch_product_inventory_updated_at
before update on public.product_inventory
for each row execute function public.touch_product_inventory_updated_at();

create or replace function public.place_order_with_inventory(
  p_order_data jsonb,
  p_items jsonb,
  p_launch_offer_email text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product_id bigint;
  v_quantity integer;
  v_available integer;
  v_user_id uuid;
  v_normalized_email text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must include at least one item.' using errcode = '22023';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'id')::bigint;
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity for product %.', v_product_id using errcode = '22023';
    end if;

    select available_quantity
      into v_available
      from public.product_inventory
      where product_id = v_product_id
      for update;

    if not found then
      raise exception 'Inventory is not configured for product %.', v_product_id using errcode = 'P0002';
    end if;

    if v_available < v_quantity then
      raise exception 'Insufficient stock for product %. Available: %, requested: %.', v_product_id, v_available, v_quantity using errcode = '23514';
    end if;
  end loop;

  v_user_id := nullif(p_order_data->>'user_id', '')::uuid;

  insert into public.orders (
    user_id,
    items,
    delivery_address,
    payment_method,
    payment_details,
    subtotal_amount,
    discount_code,
    discount_percent,
    product_discount_amount,
    coupon_discount_amount,
    discount_amount,
    shipping_amount,
    convenience_fee_amount,
    cod_amount,
    total_amount,
    status
  )
  values (
    v_user_id,
    coalesce(p_order_data->'items', '[]'::jsonb),
    coalesce(p_order_data->'delivery_address', '{}'::jsonb),
    p_order_data->>'payment_method',
    p_order_data->'payment_details',
    coalesce((p_order_data->>'subtotal_amount')::numeric, 0),
    nullif(p_order_data->>'discount_code', ''),
    nullif(p_order_data->>'discount_percent', '')::numeric,
    coalesce((p_order_data->>'product_discount_amount')::numeric, 0),
    coalesce((p_order_data->>'coupon_discount_amount')::numeric, 0),
    coalesce((p_order_data->>'discount_amount')::numeric, 0),
    coalesce((p_order_data->>'shipping_amount')::numeric, 0),
    coalesce((p_order_data->>'convenience_fee_amount')::numeric, 0),
    coalesce((p_order_data->>'cod_amount')::numeric, 0),
    coalesce((p_order_data->>'total_amount')::numeric, 0),
    coalesce(nullif(p_order_data->>'status', ''), 'pending')
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'id')::bigint;
    v_quantity := (v_item->>'quantity')::integer;

    update public.product_inventory
      set available_quantity = available_quantity - v_quantity
      where product_id = v_product_id;

    insert into public.order_items (order_id, product_id, quantity, unit_price)
    values (
      v_order.id,
      v_product_id,
      v_quantity,
      coalesce((v_item->>'price')::numeric, 0)
    );
  end loop;

  if p_launch_offer_email is not null and length(trim(p_launch_offer_email)) > 0 then
    v_normalized_email := lower(trim(p_launch_offer_email));

    insert into public.launch_offer_claims (user_id, email, order_id)
    values (v_user_id, v_normalized_email, v_order.id);
  end if;

  return v_order;
exception
  when unique_violation then
    raise exception 'This email has already claimed the launch offer.' using errcode = '23505';
end;
$$;

alter table public.product_inventory enable row level security;
alter table public.launch_offer_claims enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Inventory is readable by everyone" on public.product_inventory;
create policy "Inventory is readable by everyone"
on public.product_inventory for select
using (true);

drop policy if exists "Users can read their launch offer claim" on public.launch_offer_claims;
create policy "Users can read their launch offer claim"
on public.launch_offer_claims for select
using (auth.uid() = user_id);

drop policy if exists "Users can read their order items" on public.order_items;
create policy "Users can read their order items"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

grant execute on function public.place_order_with_inventory(jsonb, jsonb, text) to service_role;
