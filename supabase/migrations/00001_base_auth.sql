-- Base schema: profiles and organizations
-- Applied automatically when Supabase project is created

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations table
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now()
);

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  org_id uuid references public.organizations(id),
  created_at timestamptz default now()
);

-- Audit log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- RLS policies
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_log enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Organizations: members can view their org
create policy "Org members can view org" on public.organizations
  for select using (
    id in (select org_id from public.profiles where id = auth.uid())
  );

-- Audit log: org members can view
create policy "Users can view own audit log" on public.audit_log
  for select using (user_id = auth.uid());
create policy "Users can insert audit log" on public.audit_log
  for insert with check (user_id = auth.uid());

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

