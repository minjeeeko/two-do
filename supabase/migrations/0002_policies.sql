-- ============================================================================
-- DOMO — Row Level Security
-- Core rule: you may access rows that belong to a couple you are a member of.
-- ============================================================================

alter table public.profiles         enable row level security;
alter table public.couples          enable row level security;
alter table public.couple_members   enable row level security;
alter table public.couple_invites   enable row level security;
alter table public.chore_categories enable row level security;
alter table public.chores           enable row level security;
alter table public.chore_reactions  enable row level security;
alter table public.chore_comments   enable row level security;
alter table public.house_messages   enable row level security;
alter table public.letters          enable row level security;
alter table public.notifications    enable row level security;
alter table public.access_log       enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_couple_with(id));

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- couples
-- ---------------------------------------------------------------------------
drop policy if exists couples_select on public.couples;
create policy couples_select on public.couples for select to authenticated
  using (public.is_couple_member(id));

drop policy if exists couples_insert on public.couples;
create policy couples_insert on public.couples for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists couples_update on public.couples;
create policy couples_update on public.couples for update to authenticated
  using (public.is_couple_member(id)) with check (public.is_couple_member(id));

-- ---------------------------------------------------------------------------
-- couple_members
-- ---------------------------------------------------------------------------
drop policy if exists couple_members_select on public.couple_members;
create policy couple_members_select on public.couple_members for select to authenticated
  using (user_id = auth.uid() or public.is_couple_member(couple_id));

-- you may add yourself to a couple (invite acceptance uses a SECURITY DEFINER rpc)
drop policy if exists couple_members_insert on public.couple_members;
create policy couple_members_insert on public.couple_members for insert to authenticated
  with check (user_id = auth.uid());

-- you may remove yourself; either member may dissolve the pairing
drop policy if exists couple_members_delete on public.couple_members;
create policy couple_members_delete on public.couple_members for delete to authenticated
  using (user_id = auth.uid() or public.is_couple_member(couple_id));

-- ---------------------------------------------------------------------------
-- couple_invites  (creation/reading; acceptance is done via rpc accept_invite)
-- ---------------------------------------------------------------------------
drop policy if exists invites_select on public.couple_invites;
create policy invites_select on public.couple_invites for select to authenticated
  using (inviter_id = auth.uid() or accepted_by = auth.uid() or public.is_couple_member(couple_id));

drop policy if exists invites_insert on public.couple_invites;
create policy invites_insert on public.couple_invites for insert to authenticated
  with check (inviter_id = auth.uid() and public.is_couple_member(couple_id));

drop policy if exists invites_update on public.couple_invites;
create policy invites_update on public.couple_invites for update to authenticated
  using (inviter_id = auth.uid()) with check (inviter_id = auth.uid());

-- ---------------------------------------------------------------------------
-- chore_categories
-- ---------------------------------------------------------------------------
drop policy if exists chore_categories_all on public.chore_categories;
create policy chore_categories_all on public.chore_categories for all to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- ---------------------------------------------------------------------------
-- chores
-- ---------------------------------------------------------------------------
drop policy if exists chores_select on public.chores;
create policy chores_select on public.chores for select to authenticated
  using (public.is_couple_member(couple_id));

drop policy if exists chores_insert on public.chores;
create policy chores_insert on public.chores for insert to authenticated
  with check (public.is_couple_member(couple_id) and created_by = auth.uid());

drop policy if exists chores_update on public.chores;
create policy chores_update on public.chores for update to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

drop policy if exists chores_delete on public.chores;
create policy chores_delete on public.chores for delete to authenticated
  using (public.is_couple_member(couple_id));

-- ---------------------------------------------------------------------------
-- chore_reactions
-- ---------------------------------------------------------------------------
drop policy if exists chore_reactions_select on public.chore_reactions;
create policy chore_reactions_select on public.chore_reactions for select to authenticated
  using (exists (select 1 from public.chores c where c.id = chore_id and public.is_couple_member(c.couple_id)));

drop policy if exists chore_reactions_insert on public.chore_reactions;
create policy chore_reactions_insert on public.chore_reactions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.chores c where c.id = chore_id and public.is_couple_member(c.couple_id))
  );

drop policy if exists chore_reactions_delete on public.chore_reactions;
create policy chore_reactions_delete on public.chore_reactions for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- chore_comments
-- ---------------------------------------------------------------------------
drop policy if exists chore_comments_select on public.chore_comments;
create policy chore_comments_select on public.chore_comments for select to authenticated
  using (exists (select 1 from public.chores c where c.id = chore_id and public.is_couple_member(c.couple_id)));

drop policy if exists chore_comments_insert on public.chore_comments;
create policy chore_comments_insert on public.chore_comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.chores c where c.id = chore_id and public.is_couple_member(c.couple_id))
  );

drop policy if exists chore_comments_delete on public.chore_comments;
create policy chore_comments_delete on public.chore_comments for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- house_messages
-- ---------------------------------------------------------------------------
drop policy if exists house_messages_select on public.house_messages;
create policy house_messages_select on public.house_messages for select to authenticated
  using (public.is_couple_member(couple_id));

drop policy if exists house_messages_insert on public.house_messages;
create policy house_messages_insert on public.house_messages for insert to authenticated
  with check (public.is_couple_member(couple_id) and user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- letters
-- ---------------------------------------------------------------------------
drop policy if exists letters_select on public.letters;
create policy letters_select on public.letters for select to authenticated
  using (public.is_couple_member(couple_id));

drop policy if exists letters_insert on public.letters;
create policy letters_insert on public.letters for insert to authenticated
  with check (public.is_couple_member(couple_id) and user_id = auth.uid());

-- recipient (or either member) can mark it read
drop policy if exists letters_update on public.letters;
create policy letters_update on public.letters for update to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- ---------------------------------------------------------------------------
-- notifications  (recipient reads / updates own; either member may create)
-- ---------------------------------------------------------------------------
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert to authenticated
  with check (couple_id is null or public.is_couple_member(couple_id));

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- access_log  (members read; inserts happen via SECURITY DEFINER rpc or here)
-- ---------------------------------------------------------------------------
drop policy if exists access_log_select on public.access_log;
create policy access_log_select on public.access_log for select to authenticated
  using (public.is_couple_member(couple_id));

drop policy if exists access_log_insert on public.access_log;
create policy access_log_insert on public.access_log for insert to authenticated
  with check (actor_user_id = auth.uid() and (couple_id is null or public.is_couple_member(couple_id)));
