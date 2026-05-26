-- Update the place_order_with_inventory function to handle zero customer shipping payment logic
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
  v_wholesale_price numeric;
  v_wholesale_total numeric := 0;
  v_shipping_paid numeric;
  v_freight_charge numeric;
  v_total_amount numeric;
  v_packing_charge numeric := 20;
  v_gateway_charge_percent numeric := 0.02;
  v_delivery_cost_to_company numeric;
  v_gateway_charge numeric;
  v_actual_order_value numeric;
  v_ctc numeric;
  v_profit_loss numeric;
  v_user_id uuid;
  v_normalized_email text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must include at least one item.' using errcode = '22023';
  end if;

  -- First pass: check inventory and calculate wholesale total
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'id')::bigint;
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity for product %.', v_product_id using errcode = '22023';
    end if;

    -- Fetch available quantity and wholesale price (coalesce to 0 to avoid NULL errors)
    select pi.available_quantity, coalesce(p.wholesale_price, 0)
      into v_available, v_wholesale_price
      from public.product_inventory pi
      join public.products p on p.id = pi.product_id
      where pi.product_id = v_product_id
      for update of pi;

    if not found then
      raise exception 'Inventory or product is not configured for product %.', v_product_id using errcode = 'P0002';
    end if;

    if v_available < v_quantity then
      raise exception 'Insufficient stock for product %. Available: %, requested: %.', v_product_id, v_available, v_quantity using errcode = '23514';
    end if;

    -- Add to wholesale total
    v_wholesale_total := v_wholesale_total + (v_wholesale_price * v_quantity);
  end loop;

  v_user_id := nullif(p_order_data->>'user_id', '')::uuid;
  v_shipping_paid := coalesce((p_order_data->>'shipping_amount')::numeric, 0) + coalesce((p_order_data->>'extra_shipping_amount')::numeric, 0);
  v_freight_charge := coalesce((p_order_data->>'freight_charge')::numeric, 0);
  v_total_amount := coalesce((p_order_data->>'total_amount')::numeric, 0);

  -- Corrected Financial Logic for Shipping Loss:
  -- If shipping paid by customer is 0, delivery_cost_to_company = full freight_charge
  -- If customer paid something, delivery_cost_to_company = freight_charge - shipping_paid
  v_delivery_cost_to_company := v_freight_charge - v_shipping_paid;

  -- Calculate Gateway Charge (2% of the TOTAL payment received)
  v_gateway_charge := v_total_amount * v_gateway_charge_percent;

  -- Calculate Cost to Company (CTC)
  -- CTC = Wholesale Total + Delivery Cost to Company + Packing (20) + Gateway Charge
  v_ctc := v_wholesale_total + v_delivery_cost_to_company + v_packing_charge + v_gateway_charge;

  -- Calculate Actual Order Value (Revenue excluding the shipping portion paid by customer)
  v_actual_order_value := v_total_amount - v_shipping_paid;

  -- Calculate Profit or Loss
  -- Profit/Loss = Actual Order Value - CTC
  v_profit_loss := v_actual_order_value - v_ctc;

  -- Insert the order including financial metrics
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
    coalesce((p_order_data->>'shipping_amount')::numeric, 0),
    coalesce((p_order_data->>'extra_shipping_amount')::numeric, 0),
    coalesce((p_order_data->>'convenience_fee_amount')::numeric, 0),
    coalesce((p_order_data->>'cod_amount')::numeric, 0),
    v_total_amount,
    v_wholesale_total,
    v_ctc,
    v_profit_loss,
    coalesce(nullif(p_order_data->>'status', ''), 'pending')
  )
  returning * into v_order;

  -- Second pass: update inventory and insert order items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'id')::bigint;
    v_quantity := (v_item->>'quantity')::integer;

    -- Get current wholesale price again for the order_items table (coalesce to 0)
    select coalesce(wholesale_price, 0) into v_wholesale_price
    from public.products
    where id = v_product_id;

    update public.product_inventory
      set available_quantity = available_quantity - v_quantity
      where product_id = v_product_id;

    insert into public.order_items (order_id, product_id, quantity, unit_price, wholesale_price)
    values (
      v_order.id,
      v_product_id,
      v_quantity,
      coalesce((v_item->>'price')::numeric, 0),
      v_wholesale_price
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
