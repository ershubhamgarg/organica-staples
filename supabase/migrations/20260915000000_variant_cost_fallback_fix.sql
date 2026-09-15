-- Fixes a real cost-accounting bug in place_order_with_inventory: a
-- variant's wholesale_price/packet_cost/sticker_cost are meant to fall back
-- to the base product's own value when the variant hasn't set its own (the
-- `coalesce(pv.X, p.X, 0)` pattern from 20260910010000/20260912000000). But
-- the CMS's variant form always writes a literal `0` for these fields by
-- default (never a real NULL) until an admin explicitly fills them in — see
-- organica-staples-cms's `blankVariantRow`. `coalesce` only skips a true
-- NULL, not 0, so that fallback never actually fires: every variant whose
-- costs haven't been manually set contributes ZERO wholesale/packaging cost
-- to an order, regardless of the base product's real cost. Confirmed live
-- on a real order (a Cumin Seeds "200 gms" variant with wholesale_price=0,
-- packet_cost=0, sticker_cost=0 on the variant row, vs wholesale_price=120
-- on the product) — that line contributed nothing to cost_to_company.
--
-- Fixed by wrapping the variant's own value in `nullif(pv.X, 0)` before the
-- coalesce, so a literal 0 is treated the same as an unset NULL and falls
-- through to the product's value — a variant can no longer express "this
-- costs genuinely nothing" as distinct from "not yet filled in", but given
-- every variant starts at 0 by default with no way to leave it blank, that
-- distinction was never actually usable anyway, and silently under-costing
-- (and over-stating profit on) every un-configured variant is far worse.
--
-- Also stores v_packaging_total (already computed since 20260912000000, but
-- previously only ever folded into cost_to_company) as its own column, so
-- the CMS's order detail page can show a real "Packaging Cost" line next to
-- "Wholesale Total" instead of either hiding that cost inside a single
-- opaque total or trying to re-derive it client-side from item snapshots
-- (which would just re-expose the same variant-fallback risk fixed above).

alter table public.orders
  add column if not exists packaging_total_amount numeric default 0;

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
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must include at least one item.' using errcode = '22023';
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
        coalesce(nullif(pv.wholesale_price, 0), p.wholesale_price, 0),
        coalesce(nullif(pv.packet_cost, 0), p.packet_cost, 0),
        coalesce(nullif(pv.sticker_cost, 0), p.sticker_cost, 0)
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
    packaging_total_amount,
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
    v_packaging_total,
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
        coalesce(nullif(pv.wholesale_price, 0), p.wholesale_price, 0),
        coalesce(nullif(pv.packet_cost, 0), p.packet_cost, 0),
        coalesce(nullif(pv.sticker_cost, 0), p.sticker_cost, 0)
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
