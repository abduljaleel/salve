-- smile-dk: Personal energy and wellness tables
-- Migration: 00002_energy

-- Energy Profiles
create table if not exists public.energy_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baseline_scores jsonb,
  assessment_date timestamptz,
  chronotype text,
  stress_level int,
  sleep_quality int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.energy_profiles enable row level security;

create policy "Users can view their own energy profiles"
  on public.energy_profiles for select
  using (user_id = auth.uid());

create policy "Users can insert their own energy profiles"
  on public.energy_profiles for insert
  with check (user_id = auth.uid());

create policy "Users can update their own energy profiles"
  on public.energy_profiles for update
  using (user_id = auth.uid());

create policy "Users can delete their own energy profiles"
  on public.energy_profiles for delete
  using (user_id = auth.uid());

-- Protocols
create table if not exists public.protocols (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  protocol_type text not null check (protocol_type in ('morning', 'evening', 'recovery', 'focus')),
  habits jsonb,
  duration_weeks int,
  created_from_template_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.protocols enable row level security;

create policy "Users can view their own protocols"
  on public.protocols for select
  using (user_id = auth.uid());

create policy "Users can insert their own protocols"
  on public.protocols for insert
  with check (user_id = auth.uid());

create policy "Users can update their own protocols"
  on public.protocols for update
  using (user_id = auth.uid());

create policy "Users can delete their own protocols"
  on public.protocols for delete
  using (user_id = auth.uid());

-- Daily Logs
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  energy_score int,
  mood text,
  sleep_hours numeric,
  sleep_quality int,
  exercise_minutes int,
  focus_hours numeric,
  stress_level int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_logs enable row level security;

create policy "Users can view their own daily logs"
  on public.daily_logs for select
  using (user_id = auth.uid());

create policy "Users can insert their own daily logs"
  on public.daily_logs for insert
  with check (user_id = auth.uid());

create policy "Users can update their own daily logs"
  on public.daily_logs for update
  using (user_id = auth.uid());

create policy "Users can delete their own daily logs"
  on public.daily_logs for delete
  using (user_id = auth.uid());

-- Habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  protocol_id uuid references public.protocols(id),
  name text not null,
  category text not null check (category in ('sleep', 'nutrition', 'movement', 'mindfulness', 'social')),
  frequency text,
  target_value int,
  current_streak int not null default 0,
  best_streak int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Users can view their own habits"
  on public.habits for select
  using (user_id = auth.uid());

create policy "Users can insert their own habits"
  on public.habits for insert
  with check (user_id = auth.uid());

create policy "Users can update their own habits"
  on public.habits for update
  using (user_id = auth.uid());

create policy "Users can delete their own habits"
  on public.habits for delete
  using (user_id = auth.uid());

-- Programs
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  duration_weeks int,
  protocol_template jsonb,
  participant_count int not null default 0,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.programs enable row level security;

create policy "Users can view programs in their org"
  on public.programs for select
  using (org_id in (select org_id from public.profiles where user_id = auth.uid()));

create policy "Users can insert programs in their org"
  on public.programs for insert
  with check (org_id in (select org_id from public.profiles where user_id = auth.uid()));

create policy "Users can update programs in their org"
  on public.programs for update
  using (org_id in (select org_id from public.profiles where user_id = auth.uid()));

create policy "Users can delete programs in their org"
  on public.programs for delete
  using (org_id in (select org_id from public.profiles where user_id = auth.uid()));
