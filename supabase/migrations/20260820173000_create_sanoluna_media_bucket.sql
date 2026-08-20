insert into storage.buckets (id, name, public) 
values ('sanoluna-media', 'sanoluna-media', true)
on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'sanoluna-media' );
