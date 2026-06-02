-- Create the product_launch_interests table
create table if not exists public.product_launch_interests (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references public.products(id) on delete cascade,
  customer_name text not null,
  customer_email text not null check (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]\{2,\}$'),
  created_at timestamptz not null default now(),
  email_sent boolean not null default false,
  unique (product_id, customer_email)
);

-- Add indexes for performance
create index if not exists product_launch_interests_product_id_idx on public.product_launch_interests(product_id);
create index if not exists product_launch_interests_created_at_idx on public.product_launch_interests(created_at);

-- Enable RLS
alter table public.product_launch_interests enable row level security;

-- Policies
-- 1. Allow service role to do everything (backend operations)
create policy "Service role can manage all interests"
on public.product_launch_interests
for all
using (true)
with check (true);

-- 2. Allow users to view only their own entries (if authenticated)
create policy "Users can view their own interests"
on public.product_launch_interests
for select
using (auth.jwt() ->> 'email' = customer_email);

-- 3. Allow public to insert (for lead capture form)
create policy "Public can submit interest"
on public.product_launch_interests
for insert
with check (true);

-- Grant permissions
grant all on public.product_launch_interests to service_role;
grant insert on public.product_launch_interests to anon;
grant insert on public.product_launch_interests to authenticated;
grant select on public.product_launch_interests to authenticated;
