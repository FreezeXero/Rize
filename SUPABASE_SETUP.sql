-- Rize Supabase schema (users, resumes, usage)
-- Run this in Supabase SQL Editor (public schema).

-- 1) USERS
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'max')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  exports_this_month integer not null default 0,
  ai_uses_this_month integer not null default 0,
  created_at timestamptz not null default now()
);

-- Keep email up to date on signup (optional).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- 2) RESUMES
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text,
  template text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Automatically bump updated_at
create or replace function public.set_resumes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_resumes_updated_at_trigger on public.resumes;
create trigger set_resumes_updated_at_trigger
  before update on public.resumes
  for each row
  execute procedure public.set_resumes_updated_at();

-- 3) USAGE (monthly quota accounting)
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  action_type text not null,
  timestamp timestamptz not null default now()
);

-- Helpful indexes
create index if not exists usage_user_action_ts_idx
  on public.usage (user_id, action_type, timestamp desc);

-- 4) RLS (recommended)
alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.usage enable row level security;

-- Users can read their own row
drop policy if exists users_select_own on public.users;
create policy users_select_own
  on public.users
  for select
  using (id = auth.uid());

-- Users can manage their resumes
drop policy if exists resumes_select_own on public.resumes;
create policy resumes_select_own
  on public.resumes
  for select
  using (user_id = auth.uid());

drop policy if exists resumes_insert_own on public.resumes;
create policy resumes_insert_own
  on public.resumes
  for insert
  with check (user_id = auth.uid());

drop policy if exists resumes_update_own on public.resumes;
create policy resumes_update_own
  on public.resumes
  for update
  using (user_id = auth.uid());

drop policy if exists usage_select_own on public.usage;
create policy usage_select_own
  on public.usage
  for select
  using (user_id = auth.uid());

drop policy if exists usage_insert_own on public.usage;
create policy usage_insert_own
  on public.usage
  for insert
  with check (user_id = auth.uid());

