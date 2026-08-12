-- DevQuest — schema inicial para Supabase Postgres
-- Execute este arquivo no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Dev em evolução',
  avatar text not null default '🧑‍💻',
  daily_goal_minutes integer not null default 120 check (daily_goal_minutes between 15 and 600),
  theme text not null default 'dark' check (theme in ('dark','light')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  task_key text not null check (char_length(task_key) between 1 and 120),
  category text not null check (category in ('english','career','ads')),
  track text not null check (track in ('backend','frontend','cloud','architecture','english','ads')),
  completed boolean not null default false,
  minutes integer not null default 0 check (minutes between 0 and 1440),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date, task_key)
);

create index if not exists progress_entries_user_date_idx on public.progress_entries(user_id, date);
create index if not exists progress_entries_user_track_idx on public.progress_entries(user_id, track);

alter table public.profiles enable row level security;
alter table public.progress_entries enable row level security;

-- Recriar policies com nomes estáveis para permitir reexecução segura do script.
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "progress_select_own" on public.progress_entries;
drop policy if exists "progress_insert_own" on public.progress_entries;
drop policy if exists "progress_update_own" on public.progress_entries;
drop policy if exists "progress_delete_own" on public.progress_entries;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "progress_select_own" on public.progress_entries
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "progress_insert_own" on public.progress_entries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "progress_update_own" on public.progress_entries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "progress_delete_own" on public.progress_entries
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Perfil automático ao criar conta.
create or replace function public.handle_new_devquest_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, 'Dev'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_devquest on auth.users;
create trigger on_auth_user_created_devquest
  after insert on auth.users
  for each row execute procedure public.handle_new_devquest_user();

-- updated_at automático.
create or replace function public.set_devquest_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_devquest_updated_at();

drop trigger if exists progress_set_updated_at on public.progress_entries;
create trigger progress_set_updated_at
  before update on public.progress_entries
  for each row execute procedure public.set_devquest_updated_at();
