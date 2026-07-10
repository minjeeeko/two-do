-- ============================================================================
-- DOMO — RPC helpers
-- Called from the client with supabase.rpc('<name>', {...}).
-- All run as SECURITY DEFINER so they can perform the multi-step, cross-row
-- work that individual RLS policies intentionally can't.
-- ============================================================================

-- default categories seeded for every new couple
create or replace function public._seed_default_categories(p_couple_id uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.chore_categories (couple_id, label)
  select p_couple_id, x
  from unnest(array['청소','요리','빨래','설거지','장보기','운동','공부','기타']) as x
  on conflict (couple_id, label) do nothing;
$$;

-- short, unambiguous invite code (no 0/O/1/I)
create or replace function public._gen_invite_code()
returns text language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out   text := '';
  i     int;
begin
  for i in 1..6 loop
    out := out || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return out;
end $$;

-- ---------------------------------------------------------------------------
-- create_couple: create a couple, add the caller as first member, seed
-- default categories, and return the new couple id.
-- ---------------------------------------------------------------------------
create or replace function public.create_couple(
  p_name    text default '우리 집',
  p_tagline text default '오늘도 같이'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_couple_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.couples (name, tagline, created_by, start_date)
  values (coalesce(nullif(p_name, ''), '우리 집'), coalesce(p_tagline, ''), auth.uid(), current_date)
  returning id into v_couple_id;

  insert into public.couple_members (couple_id, user_id)
  values (v_couple_id, auth.uid());

  perform public._seed_default_categories(v_couple_id);

  insert into public.access_log (couple_id, actor_user_id, action, target_type, target_id)
  values (v_couple_id, auth.uid(), 'couple_create', 'couple', v_couple_id::text);

  return v_couple_id;
end $$;

-- ---------------------------------------------------------------------------
-- generate_invite: create (or refresh) a pending invite code for a couple
-- the caller belongs to.
-- ---------------------------------------------------------------------------
create or replace function public.generate_invite(p_couple_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text;
begin
  if not public.is_couple_member(p_couple_id) then
    raise exception 'not a member of this couple';
  end if;

  loop
    v_code := public._gen_invite_code();
    exit when not exists (select 1 from public.couple_invites where code = v_code);
  end loop;

  insert into public.couple_invites (code, couple_id, inviter_id, expires_at)
  values (v_code, p_couple_id, auth.uid(), now() + interval '7 days');

  return v_code;
end $$;

-- ---------------------------------------------------------------------------
-- accept_invite: join the inviter's couple by code. Returns the couple id.
-- ---------------------------------------------------------------------------
create or replace function public.accept_invite(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_invite public.couple_invites;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_invite
  from public.couple_invites
  where code = upper(p_code) and status = 'pending'
    and (expires_at is null or expires_at > now())
  limit 1;

  if not found then
    raise exception 'invalid or expired invite code';
  end if;

  if v_invite.inviter_id = auth.uid() then
    raise exception 'cannot accept your own invite';
  end if;

  insert into public.couple_members (couple_id, user_id)
  values (v_invite.couple_id, auth.uid())
  on conflict do nothing;

  update public.couple_invites
  set status = 'accepted', accepted_by = auth.uid()
  where id = v_invite.id;

  insert into public.access_log (couple_id, actor_user_id, action, target_type, target_id)
  values (v_invite.couple_id, auth.uid(), 'invite_accept', 'couple', v_invite.couple_id::text);

  return v_invite.couple_id;
end $$;

-- ---------------------------------------------------------------------------
-- disconnect_couple: mark the couple disconnected and log it. Membership rows
-- are kept so history remains; access is blocked at the app layer by status.
-- ---------------------------------------------------------------------------
create or replace function public.disconnect_couple(p_couple_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_couple_member(p_couple_id) then
    raise exception 'not a member of this couple';
  end if;

  update public.couples
  set status = 'disconnected', disconnected_at = now()
  where id = p_couple_id;

  insert into public.access_log (couple_id, actor_user_id, action, target_type, target_id)
  values (p_couple_id, auth.uid(), 'disconnect', 'couple', p_couple_id::text);
end $$;

-- expose to signed-in users
grant execute on function public.create_couple(text, text)   to authenticated;
grant execute on function public.generate_invite(uuid)       to authenticated;
grant execute on function public.accept_invite(text)         to authenticated;
grant execute on function public.disconnect_couple(uuid)     to authenticated;
