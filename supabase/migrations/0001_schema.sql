-- ============================================================================
-- DOMO — schema
-- Tables + enums + triggers + RLS helper functions.
-- Apply order: 0001_schema → 0002_policies → 0003_rpc → 0004_storage
-- ============================================================================

create extension if not exists pgcrypto;      -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums (guarded so the file can be re-run safely)
-- ---------------------------------------------------------------------------
do $$ begin create type couple_status as enum ('connected', 'disconnected'); exception when duplicate_object then null; end $$;
do $$ begin create type couple_tone as enum ('bright', 'calm', 'minimal'); exception when duplicate_object then null; end $$;
do $$ begin create type chore_owner_type as enum ('personal', 'together'); exception when duplicate_object then null; end $$;
do $$ begin
  create type notification_type as enum (
    'checkin','reaction','cheer','streak','badge','coupleGoal',
    'reminder','system','chore','comment','complete','letter'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Generic helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text not null default '',
  color_tag  text not null default 'brand',
  avatar_url text,
  interests  text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- couples + membership
-- ---------------------------------------------------------------------------
create table if not exists public.couples (
  id              uuid primary key default gen_random_uuid(),
  name            text not null default '우리 집',
  tagline         text not null default '',
  tone            couple_tone not null default 'bright',
  start_date      date,
  connected_at    timestamptz not null default now(),
  status          couple_status not null default 'connected',
  disconnected_at timestamptz,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table if not exists public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);
create index if not exists idx_couple_members_user on public.couple_members(user_id);

-- a couple has at most two members
create or replace function public.enforce_two_members()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.couple_members where couple_id = new.couple_id) >= 2 then
    raise exception 'A couple can have at most 2 members';
  end if;
  return new;
end $$;

drop trigger if exists trg_two_members on public.couple_members;
create trigger trg_two_members
  before insert on public.couple_members
  for each row execute function public.enforce_two_members();

-- membership check used by every RLS policy.
-- SECURITY DEFINER so it bypasses RLS and cannot recurse into couple_members policies.
create or replace function public.is_couple_member(p_couple_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.couple_members m
    where m.couple_id = p_couple_id and m.user_id = auth.uid()
  );
$$;

-- true when the given user shares a couple with the caller (used for profile visibility)
create or replace function public.shares_couple_with(p_user uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from public.couple_members a
    join public.couple_members b on a.couple_id = b.couple_id
    where a.user_id = auth.uid() and b.user_id = p_user
  );
$$;

-- ---------------------------------------------------------------------------
-- couple invites (code sharing)
-- ---------------------------------------------------------------------------
create table if not exists public.couple_invites (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  couple_id   uuid not null references public.couples(id) on delete cascade,
  inviter_id  uuid not null references public.profiles(id) on delete cascade,
  status      text not null default 'pending',   -- pending | accepted | expired
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz
);
create index if not exists idx_invites_couple on public.couple_invites(couple_id);

-- ---------------------------------------------------------------------------
-- chore categories (couple-scoped, user editable)
-- ---------------------------------------------------------------------------
create table if not exists public.chore_categories (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  label      text not null,
  created_at timestamptz not null default now(),
  unique (couple_id, label)
);

-- ---------------------------------------------------------------------------
-- chores (할 일)
-- ---------------------------------------------------------------------------
create table if not exists public.chores (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.couples(id) on delete cascade,
  owner_type    chore_owner_type not null,
  owner_user_id uuid references public.profiles(id) on delete set null,
  title         text not null,
  description   text,
  category      text not null default '기타',
  chore_date    date not null,
  completed     boolean not null default false,
  completed_at  timestamptz,
  completed_by  uuid references public.profiles(id) on delete set null,
  created_by    uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint chores_owner_chk check (
    (owner_type = 'personal' and owner_user_id is not null) or
    (owner_type = 'together' and owner_user_id is null)
  )
);
create index if not exists idx_chores_couple_date on public.chores(couple_id, chore_date);

drop trigger if exists trg_chores_updated on public.chores;
create trigger trg_chores_updated
  before update on public.chores
  for each row execute function public.set_updated_at();

-- reactions on a chore
create table if not exists public.chore_reactions (
  id         uuid primary key default gen_random_uuid(),
  chore_id   uuid not null references public.chores(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique (chore_id, user_id, emoji)
);
create index if not exists idx_chore_reactions_chore on public.chore_reactions(chore_id);

-- comments on a chore
create table if not exists public.chore_comments (
  id         uuid primary key default gen_random_uuid(),
  chore_id   uuid not null references public.chores(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_chore_comments_chore on public.chore_comments(chore_id);

-- ---------------------------------------------------------------------------
-- house messages (거실 응원 말풍선)
-- ---------------------------------------------------------------------------
create table if not exists public.house_messages (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_house_messages_couple on public.house_messages(couple_id, created_at desc);

-- ---------------------------------------------------------------------------
-- letters (손편지) — image stored in the 'letters' storage bucket
-- ---------------------------------------------------------------------------
create table if not exists public.letters (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,  -- author
  image_path text not null,   -- object path inside the 'letters' bucket
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_letters_couple on public.letters(couple_id, created_at desc);

-- ---------------------------------------------------------------------------
-- notifications (우편함)
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid references public.couples(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,  -- recipient
  type       notification_type not null,
  title      text not null,
  body       text not null,
  ref_id     uuid,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- access log (감사 로그)
-- ---------------------------------------------------------------------------
create table if not exists public.access_log (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid references public.couples(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action        text not null,
  target_type   text not null,
  target_id     text,
  created_at    timestamptz not null default now()
);
