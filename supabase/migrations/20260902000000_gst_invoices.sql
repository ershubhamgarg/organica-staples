-- GST invoice support: sequential invoice numbers per financial year, and
-- HSN codes per product (required on every line item of a GST invoice).

alter table orders
  add column if not exists invoice_number text unique,
  add column if not exists invoice_generated_at timestamptz;

alter table products
  add column if not exists hsn_code text;

-- Sensible starting defaults by category — verify these against your CA's
-- classification before relying on them; HSN chapter matters for GST filing,
-- not just the rate.
update products set hsn_code = '0910' where category = 'Spices' and hsn_code is null;
update products set hsn_code = '0713' where category = 'Pulses & Dals' and hsn_code is null;
update products set hsn_code = '1106' where category = 'Flour & Grains' and hsn_code is null;

create table if not exists invoice_sequences (
  financial_year text primary key,
  last_number integer not null default 0
);

-- Atomically returns the next invoice number for a financial year (e.g.
-- "2026-27"), creating the counter row on first use. Safe under concurrent
-- order confirmations — the UPSERT is a single atomic row operation.
create or replace function get_next_invoice_number(p_financial_year text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  insert into invoice_sequences (financial_year, last_number)
  values (p_financial_year, 1)
  on conflict (financial_year)
  do update set last_number = invoice_sequences.last_number + 1
  returning last_number into v_next;

  return v_next;
end;
$$;
