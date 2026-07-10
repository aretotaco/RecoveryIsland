create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null default 'Traveller',
  avatar_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Entries are viewable by owner" on public.villa_entries;
create policy "Entries are viewable by owner"
on public.villa_entries for select
using (auth.uid() = user_id);

drop policy if exists "Entries are editable by owner" on public.villa_entries;
create policy "Entries are editable by owner"
on public.villa_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
