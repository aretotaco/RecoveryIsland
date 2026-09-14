create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  study_id text not null unique,
  display_name text not null default 'Traveller',
  avatar_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrating an existing database that predates study_id? Run this first:
-- alter table public.profiles add column if not exists study_id text;
-- -- backfill study_id for any existing rows (e.g. from the email prefix)
-- -- before adding the not-null + unique constraints below:
-- update public.profiles set study_id = split_part(email, '@', 1) where study_id is null;
-- alter table public.profiles alter column study_id set not null;
-- alter table public.profiles add constraint profiles_study_id_key unique (study_id);

create table if not exists public.villa_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  source text not null,
  entry_date text not null,
  entry_key text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category, source, entry_key)
);

alter table public.profiles enable row level security;
alter table public.villa_entries enable row level security;

-- Participants can read and write their own profile/entries, but DELETE is
-- intentionally never granted here: with self-registration and self-service
-- data deletion removed from the app, this stops a participant from erasing
-- their own rows even by calling the Supabase REST API directly. Only the
-- service_role key (used server-side for the admin export) bypasses RLS.
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Entries are viewable by owner" on public.villa_entries;
create policy "Entries are viewable by owner"
on public.villa_entries for select
using (auth.uid() = user_id);

drop policy if exists "Entries are editable by owner" on public.villa_entries;
drop policy if exists "Entries are insertable by owner" on public.villa_entries;
create policy "Entries are insertable by owner"
on public.villa_entries for insert
with check (auth.uid() = user_id);

drop policy if exists "Entries are updatable by owner" on public.villa_entries;
create policy "Entries are updatable by owner"
on public.villa_entries for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
