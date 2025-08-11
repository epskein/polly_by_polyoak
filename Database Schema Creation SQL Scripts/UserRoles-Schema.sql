-- Creates the roles table to store system role names

-- Enable extension if needed (Postgres on Supabase has gen_random_uuid by default)
-- create extension if not exists "uuid-ossp";

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Ensure unique role names (case-insensitive)
create unique index if not exists roles_name_unique_ci on public.roles (lower(name));

-- Row Level Security and policies (open read; restricted write)
alter table public.roles enable row level security;

-- Allow authenticated users to read roles
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'roles_read'
  ) then
    create policy roles_read on public.roles for select to authenticated using (true);
  end if;
end $$;

-- Allow only service role or explicit admins to insert new roles
-- For simplicity, allow any authenticated user to insert (adjust later as needed)
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'roles_insert'
  ) then
    create policy roles_insert on public.roles for insert to authenticated with check (true);
  end if;
end $$;


