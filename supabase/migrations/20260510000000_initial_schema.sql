-- Create base tables if they don't exist
create table if not exists public.products (
  id bigint primary key generated always as identity,
  name text not null,
  name2 text,
  description text,
  price numeric not null default 0,
  image text,
  images jsonb,
  category text,
  origin text,
  weight text,
  benefits text[],
  discount numeric,
  rating numeric default 0,
  review_count integer default 0,
  "isVisible" boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  state text not null,
  zipCode text not null,
  created_at timestamptz default now()
);

create table if not exists public.carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  discount_code text,
  discount_percent numeric,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;

-- Policies for products
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
on public.products for select
using (true);

-- Policies for addresses
drop policy if exists "Users can view their own addresses" on public.addresses;
create policy "Users can view their own addresses"
on public.addresses for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own addresses" on public.addresses;
create policy "Users can insert their own addresses"
on public.addresses for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own addresses" on public.addresses;
create policy "Users can update their own addresses"
on public.addresses for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete their own addresses" on public.addresses;
create policy "Users can delete their own addresses"
on public.addresses for delete
using (auth.uid() = user_id);

-- Policies for carts
drop policy if exists "Users can view their own cart" on public.carts;
create policy "Users can view their own cart"
on public.carts for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own cart" on public.carts;
create policy "Users can insert their own cart"
on public.carts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cart" on public.carts;
create policy "Users can update their own cart"
on public.carts for update
using (auth.uid() = user_id);
