-- Stores the generated invoice PDF once (in Supabase Storage) instead of
-- re-rendering it on every download. invoice_pdf_path points at the object
-- inside the private "invoices" bucket; downloads are only ever served
-- through the authenticated /api/orders/[id]/invoice route (which checks
-- order ownership), never a public Storage URL.
alter table public.orders
  add column if not exists invoice_pdf_path text;

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;
