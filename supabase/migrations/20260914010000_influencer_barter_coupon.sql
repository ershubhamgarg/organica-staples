-- Support for a capped-use, zero-payment coupon for social media
-- influencer barter collaborations: they check out through the normal
-- flow (proper order in the CMS, proper inventory decrement, proper GST/
-- invoice data), but the order costs them nothing and the code stops
-- working once it's been used the agreed number of times.

alter table public.discount_coupons
  add column if not exists max_redemptions integer,
  add column if not exists redemption_count integer not null default 0,
  add column if not exists is_free_order boolean not null default false,
  add column if not exists requires_login boolean not null default false;

-- Re-create place_order_with_inventory (copied verbatim from
-- 20260912000000_packaging_cost_in_ctc.sql) with one addition: an atomic
-- lock-check-increment on discount_coupons.redemption_count when the order
-- carries a discount_code whose coupon has a max_redemptions cap. This runs
-- inside the same transaction as the inventory row locks below, so two
-- concurrent checkouts against the last remaining use of a capped coupon
-- can never both succeed.
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
  v_variant_id bigint;
  v_quantity integer;
  v_available integer;
  v_wholesale_price numeric;
  v_wholesale_total numeric := 0;
  v_packet_cost numeric;
  v_sticker_cost numeric;
  v_packaging_total numeric := 0;

  -- Financial variables
  v_shipping_revenue numeric;
  v_extra_shipping_cost numeric;
  v_freight_total_cost numeric;
  v_total_received numeric;
  v_packing_charge numeric := 20;
  v_gateway_charge_percent numeric := 0.02;
  v_gateway_charge numeric;
  v_ctc numeric;
  v_profit_loss numeric;

  v_user_id uuid;

  -- Coupon redemption cap
  v_discount_code text;
  v_coupon_redemption_count integer;
  v_coupon_max_redemptions integer;
  v_coupon_active boolean;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must include at least one item.' using errcode = '22023';
  end if;

  -- 0. Coupon redemption cap (locked + checked + incremented atomically)
  v_discount_code := nullif(p_order_data->>'discount_code', '');

  if v_discount_code is not null then
    select redemption_count, max_redemptions, is_active
      into v_coupon_redemption_count, v_coupon_max_redemptions, v_coupon_active
      from public.discount_coupons
      where code = v_discount_code
      for update;

    if found then
      if not v_coupon_active then
        raise exception 'Coupon % is no longer active.', v_discount_code using errcode = 'P0002';
      end if;

      if v_coupon_max_redemptions is not null and v_coupon_redemption_count >= v_coupon_max_redemptions then
        raise exception 'Coupon % has reached its usage limit.', v_discount_code using errcode = 'P0002';
      end if;

      update public.discount_coupons
        set redemption_count = redemption_count + 1
        where code = v_discount_code;
    end if;
  end if;

  -- 1. Inventory, wholesale, and packaging-cost calculation
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'id')::bigint;
    v_variant_id := nullif(v_item->>'variant_id', '')::bigint;
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity for product %.', v_product_id using errcode = '22023';
    end if;

    if v_variant_id is not null then
      select
        pvi.available_quantity,
        coalesce(pv.wholesale_price, p.wholesale_price, 0),
        coalesce(pv.packet_cost, p.packet_cost, 0),
        coalesce(pv.sticker_cost, p.sticker_cost, 0)
        into v_available, v_wholesale_price, v_packet_cost, v_sticker_cost
        from public.product_variant_inventory pvi
        join public.product_variants pv on pv.id = pvi.variant_id
        join public.products p on p.id = pv.product_id
        where pvi.variant_id = v_variant_id
          and pv.product_id = v_product_id
          and pv.is_active
        for update of pvi;

      if not found then
        raise exception 'Variant % is not configured for product %.', v_variant_id, v_product_id using errcode = 'P0002';
      end if;
    else
      select
        pi.available_quantity,
        coalesce(p.wholesale_price, 0),
        coalesce(p.packet_cost, 0),
        coalesce(p.sticker_cost, 0)
        into v_available, v_wholesale_price, v_packet_cost, v_sticker_cost
        from public.product_inventory pi
        join public.products p on p.id = pi.product_id
        where pi.product_id = v_product_id
        for update of pi;

      if not found then
        raise exception 'Inventory or product is not configured for product %.', v_product_id using errcode = 'P0002';
      end if;
    end if;

    if v_available < v_quantity then
      raise exception 'Insufficient stock for product %. Available: %, requested: %.', v_product_id, v_available, v_quantity using errcode = '23514';
    end if;

    v_wholesale_total := v_wholesale_total + (v_wholesale_price * v_quantity);
    v_packaging_total := v_packaging_total + ((v_packet_cost + v_sticker_cost) * v_quantity);
  end loop;

  -- 2. Extract pricing from payload with robust casting
  v_user_id := nullif(p_order_data->>'user_id', '')::uuid;
  v_shipping_revenue := coalesce((p_order_data->>'shipping_amount')::numeric, 0);
  v_extra_shipping_cost := coalesce((p_order_data->>'extra_shipping_amount')::numeric, 0);
  v_freight_total_cost := coalesce((p_order_data->>'freight_charge')::numeric, 0);
  v_total_received := coalesce((p_order_data->>'total_amount')::numeric, 0);

  -- 3. CORE FINANCIAL LOGIC
  v_gateway_charge := v_total_received * v_gateway_charge_percent;
  v_ctc := v_wholesale_total + v_packaging_total + v_extra_shipping_cost + v_packing_charge + v_gateway_charge;
  v_profit_loss := v_total_received - v_ctc;

  -- 4. Insert order
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
    extra_shipping_amount,
    freight_charge,
    convenience_fee_amount,
    cod_amount,
    total_amount,
    wholesale_total_amount,
    cost_to_company,
    profit_loss,
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
    v_shipping_revenue,
    v_extra_shipping_cost,
    v_freight_total_cost,
    coalesce((p_order_data->>'convenience_fee_amount')::numeric, 0),
    coalesce((p_order_data->>'cod_amount')::numeric, 0),
    v_total_received,
    v_wholesale_total,
    v_ctc,
    v_profit_loss,
    coalesce(nullif(p_order_data->>'status', ''), 'pending')
  )
  returning * into v_order;

  -- 5. Inventory and Order Items pass
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'id')::bigint;
    v_variant_id := nullif(v_item->>'variant_id', '')::bigint;
    v_quantity := (v_item->>'quantity')::integer;

    if v_variant_id is not null then
      update public.product_variant_inventory
        set available_quantity = available_quantity - v_quantity
        where variant_id = v_variant_id;

      insert into public.order_items (order_id, product_id, variant_id, quantity, unit_price, wholesale_price, packet_cost, sticker_cost)
      select
        v_order.id,
        v_product_id,
        v_variant_id,
        v_quantity,
        coalesce((v_item->>'price')::numeric, 0),
        coalesce(pv.wholesale_price, p.wholesale_price, 0),
        coalesce(pv.packet_cost, p.packet_cost, 0),
        coalesce(pv.sticker_cost, p.sticker_cost, 0)
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
      where pv.id = v_variant_id;
    else
      update public.product_inventory
        set available_quantity = available_quantity - v_quantity
        where product_id = v_product_id;

      insert into public.order_items (order_id, product_id, quantity, unit_price, wholesale_price, packet_cost, sticker_cost)
      select
        v_order.id,
        v_product_id,
        v_quantity,
        coalesce((v_item->>'price')::numeric, 0),
        coalesce(wholesale_price, 0),
        coalesce(packet_cost, 0),
        coalesce(sticker_cost, 0)
      from public.products
      where id = v_product_id;
    end if;
  end loop;

  -- 6. Launch offer claim
  if p_launch_offer_email is not null and length(trim(p_launch_offer_email)) > 0 then
    insert into public.launch_offer_claims (user_id, email, order_id)
    values (v_user_id, p_launch_offer_email, v_order.id)
    on conflict (normalized_email) do nothing;
  end if;

  return v_order;
end;
$$;

-- Seed the influencer barter coupon: 100% off, hidden from the public
-- coupon list, requires the influencer to be signed in, and stops working
-- after 20 redemptions. Adjust max_redemptions in the CMS Coupons page (or
-- here) to raise/lower the cap for a given campaign.
insert into discount_coupons (code, percent, label, is_active, is_public, min_order_value, valid_upto, max_redemptions, is_free_order, requires_login)
values (
  'INFLUENCERFREE',
  100,
  'Influencer Barter Collaboration – Free Order',
  true,
  false,
  null,
  null,
  20,
  true,
  true
)
on conflict (code) do update
set
  percent = excluded.percent,
  label = excluded.label,
  is_active = excluded.is_active,
  is_public = excluded.is_public,
  max_redemptions = excluded.max_redemptions,
  is_free_order = excluded.is_free_order,
  requires_login = excluded.requires_login;
