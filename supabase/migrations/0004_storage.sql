-- ============================================================================
-- DOMO — Storage buckets + policies
--   avatars : public read, each user writes under  <user_id>/...
--   letters : private,     each couple reads/writes under <couple_id>/...
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('letters', 'letters', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- avatars (public read; owner writes under a folder named after their uid)
-- ---------------------------------------------------------------------------
drop policy if exists "avatars read" on storage.objects;
create policy "avatars read" on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars insert own" on storage.objects;
create policy "avatars insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- letters (only couple members can read/write; folder is the couple_id)
-- ---------------------------------------------------------------------------
drop policy if exists "letters read couple" on storage.objects;
create policy "letters read couple" on storage.objects for select to authenticated
  using (bucket_id = 'letters' and public.is_couple_member(((storage.foldername(name))[1])::uuid));

drop policy if exists "letters insert couple" on storage.objects;
create policy "letters insert couple" on storage.objects for insert to authenticated
  with check (bucket_id = 'letters' and public.is_couple_member(((storage.foldername(name))[1])::uuid));

drop policy if exists "letters delete couple" on storage.objects;
create policy "letters delete couple" on storage.objects for delete to authenticated
  using (bucket_id = 'letters' and public.is_couple_member(((storage.foldername(name))[1])::uuid));
