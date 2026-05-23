alter table if exists public.products
  add column if not exists preorder_enabled boolean default true,
  add column if not exists preorder_price numeric,
  add column if not exists preorder_deposit_percent numeric default 25,
  add column if not exists preorder_deposit_amount numeric,
  add column if not exists preorder_inventory_limit integer,
  add column if not exists preorder_reserved_quantity integer default 0,
  add column if not exists preorder_ship_by timestamptz,
  add column if not exists preorder_deadline timestamptz,
  add column if not exists preorder_full_payment_due timestamptz,
  add column if not exists preorder_cancellation_policy text,
  add column if not exists preorder_refund_policy text,
  add column if not exists preorder_terms text;

alter table if exists public.orders
  add column if not exists preorder_status text,
  add column if not exists preorder_payment_due_at timestamptz,
  add column if not exists preorder_ship_by timestamptz,
  add column if not exists preorder_deposit_amount numeric,
  add column if not exists preorder_balance_amount numeric,
  add column if not exists preorder_milestones jsonb,
  add column if not exists preorder_notifications jsonb;

create table if not exists public.preorder_inventory_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  order_id uuid,
  quantity integer not null check (quantity > 0),
  inventory_limit integer,
  event_type text not null check (event_type in ('reserved', 'released', 'fulfilled')),
  created_at timestamptz not null default now()
);

create table if not exists public.preorder_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  user_id uuid,
  phase text not null check (phase in ('deposit', 'balance', 'refund')),
  amount numeric not null check (amount >= 0),
  balance_amount numeric not null default 0,
  payment_method text not null,
  payment_details jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.preorder_status_sync (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  source text not null check (source in ('storefront', 'oms')),
  status text not null,
  payload jsonb,
  synced_at timestamptz not null default now()
);

create table if not exists public.preorder_notification_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  days_before_due integer not null,
  channel text not null check (channel in ('email', 'in_app')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.preorder_notification_rules (name, days_before_due, channel)
values
  ('First balance reminder', 7, 'email'),
  ('In-app balance reminder', 3, 'in_app'),
  ('Final balance reminder', 1, 'email')
on conflict do nothing;
