-- The CMS's product image uploader was pointed at a nonexistent "products"
-- bucket (fixed in code separately) — now pointed at the real "images"
-- bucket instead, but that bucket has never had a write policy, only
-- implicit public reads via Supabase Storage's public-bucket URL scheme.
-- Verified live: an authenticated CMS user's upload attempt was rejected
-- with "new row violates row-level security policy" until this ran.
drop policy if exists "Authenticated users can upload to images bucket" on storage.objects;
create policy "Authenticated users can upload to images bucket"
on storage.objects for insert
to authenticated
with check (bucket_id = 'images');

drop policy if exists "Authenticated users can update images bucket" on storage.objects;
create policy "Authenticated users can update images bucket"
on storage.objects for update
to authenticated
using (bucket_id = 'images')
with check (bucket_id = 'images');

drop policy if exists "Authenticated users can delete from images bucket" on storage.objects;
create policy "Authenticated users can delete from images bucket"
on storage.objects for delete
to authenticated
using (bucket_id = 'images');
