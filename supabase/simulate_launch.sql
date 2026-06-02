-- SQL to simulate product launches
-- Run this in your Supabase SQL Editor to see the features on the website

-- 1. Set a product to "Just Launched"
-- This will add a "Just Launched" badge and show it in the Hero Carousel
update public.products 
set launch_status = 'just_launched',
    launch_badge_text = 'NEW ARRIVAL'
where name = 'Cold Pressed Mustard Oil';

-- 2. Set a product to "Launching Soon"
-- This will show "Launching Soon", blur the product, and show it in the Hero Carousel
-- Note: Ensure available_quantity is 0 in product_inventory to prevent purchase
update public.products 
set launch_status = 'launching_soon',
    launch_date = now() + interval '5 days',
    launch_badge_text = 'COMING FRIDAY'
where name = 'Raw Himalayan Honey';

-- Ensure inventory is 0 for the "Launching Soon" product
update public.product_inventory
set available_quantity = 0
where product_id = (select id from public.products where name = 'Raw Himalayan Honey');

-- 3. Reset a product to normal "Available" status
update public.products 
set launch_status = 'available',
    launch_badge_text = null,
    launch_date = null
where name = 'A2 Desi Cow Ghee';
