-- Public photos for found-item posts; anonymous visitors can upload only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'found-photos',
  'found-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "Allow found photo uploads"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'found-photos');
