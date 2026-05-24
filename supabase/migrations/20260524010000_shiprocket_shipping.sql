alter table if exists public.orders
  add column if not exists shiprocket_order_id text,
  add column if not exists shiprocket_shipment_id text,
  add column if not exists shiprocket_awb_code text,
  add column if not exists shiprocket_courier_name text,
  add column if not exists shiprocket_tracking_url text,
  add column if not exists shipping_status text not null default 'pending',
  add column if not exists shipping_error text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists shipping_updated_at timestamptz not null default now();

create index if not exists orders_shiprocket_awb_code_idx
  on public.orders(shiprocket_awb_code)
  where shiprocket_awb_code is not null;

create index if not exists orders_shipping_status_idx
  on public.orders(shipping_status);

create or replace function public.touch_order_shipping_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.shiprocket_order_id is distinct from old.shiprocket_order_id
    or new.shiprocket_shipment_id is distinct from old.shiprocket_shipment_id
    or new.shiprocket_awb_code is distinct from old.shiprocket_awb_code
    or new.shiprocket_courier_name is distinct from old.shiprocket_courier_name
    or new.shiprocket_tracking_url is distinct from old.shiprocket_tracking_url
    or new.shipping_status is distinct from old.shipping_status
    or new.shipping_error is distinct from old.shipping_error
    or new.shipped_at is distinct from old.shipped_at
    or new.delivered_at is distinct from old.delivered_at then
    new.shipping_updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists touch_order_shipping_updated_at on public.orders;
create trigger touch_order_shipping_updated_at
before update on public.orders
for each row execute function public.touch_order_shipping_updated_at();
