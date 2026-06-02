-- Migration to support product launch features
-- Adds columns to track launch status and dates for "Just Launched" and "Launching Soon" simulation

-- 1. Add launch_status with a check constraint to ensure valid states
alter table public.products 
add column if not exists launch_status text not null default 'available'
check (launch_status in ('available', 'just_launched', 'launching_soon'));

-- 2. Add launch_date to track when the product goes live or when it went live
alter table public.products 
add column if not exists launch_date timestamptz;

-- 3. Add launch_badge_text for custom marketing labels (e.g., "LIMITED DROP", "COMING FRIDAY")
alter table public.products 
add column if not exists launch_badge_text text;

-- 4. Add index for performance when filtering by launch status
create index if not exists products_launch_status_idx on public.products(launch_status);

-- 5. Add comments for clarity
comment on column public.products.launch_status is 'Status of the product launch: available (normal), just_launched (newly added), or launching_soon (pre-launch/interest capture).';
comment on column public.products.launch_date is 'Scheduled or actual launch timestamp.';

-- 6. Update existing products to ensure they are marked as 'available'
update public.products set launch_status = 'available' where launch_status is null;
