-- ============================================================
-- Brighton — Welltower Partnership Tool
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- Extends Supabase auth.users with app-specific fields.
-- A row is created here when a user is invited/created in auth.
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  role        text not null default 'member' check (role in ('admin', 'member', 'partner')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- DEALS
-- ============================================================
create table if not exists public.deals (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  partner                 text not null default 'Welltower',
  location                text not null,
  unit_count              integer not null,
  stage                   text not null default 'Due Diligence'
                            check (stage in ('Due Diligence', 'Entitlements', 'Construction', 'Closeout')),
  start_date              date not null,
  target_completion_date  date not null,
  created_at              timestamptz not null default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  title         text not null,
  description   text,
  deal_stage    text not null
                  check (deal_stage in ('Due Diligence', 'Entitlements', 'Construction', 'Closeout')),
  priority      text not null default 'medium'
                  check (priority in ('low', 'medium', 'high')),
  due_date      date,
  is_complete   boolean not null default false,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- TASK ASSIGNMENTS
-- ============================================================
create table if not exists public.task_assignments (
  task_id   uuid not null references public.tasks(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  primary key (task_id, user_id)
);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
create table if not exists public.activity_logs (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  action     text not null check (action in ('completed', 'reassigned', 'created', 'updated')),
  timestamp  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- All authenticated users can read everything.
-- Only admins can insert/update/delete deals.
-- Any authenticated user can manage tasks.
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.deals          enable row level security;
alter table public.tasks          enable row level security;
alter table public.task_assignments enable row level security;
alter table public.activity_logs  enable row level security;

-- Profiles: users can read all, update only their own
create policy "profiles_read_all"   on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Deals: all authenticated users can read; only admins can write
create policy "deals_read_all"    on public.deals for select using (auth.role() = 'authenticated');
create policy "deals_insert_admin" on public.deals for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "deals_update_admin" on public.deals for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "deals_delete_admin" on public.deals for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Tasks: all authenticated users can read and write
create policy "tasks_read_all"   on public.tasks for select using (auth.role() = 'authenticated');
create policy "tasks_insert_all" on public.tasks for insert with check (auth.role() = 'authenticated');
create policy "tasks_update_all" on public.tasks for update using (auth.role() = 'authenticated');
create policy "tasks_delete_all" on public.tasks for delete using (auth.role() = 'authenticated');

-- Task assignments: all authenticated users can read and write
create policy "ta_read_all"   on public.task_assignments for select using (auth.role() = 'authenticated');
create policy "ta_insert_all" on public.task_assignments for insert with check (auth.role() = 'authenticated');
create policy "ta_delete_all" on public.task_assignments for delete using (auth.role() = 'authenticated');

-- Activity logs: all authenticated users can read; insert on action
create policy "al_read_all"   on public.activity_logs for select using (auth.role() = 'authenticated');
create policy "al_insert_all" on public.activity_logs for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA (optional — matches mock-data.ts)
-- Remove this section if you want to start with a clean DB
-- ============================================================
insert into public.deals (id, name, partner, location, unit_count, stage, start_date, target_completion_date) values
  ('d1000000-0000-0000-0000-000000000001', 'Harvest Ridge', 'Welltower', 'Meridian, ID', 210, 'Construction',      '2023-06-01', '2025-03-31'),
  ('d1000000-0000-0000-0000-000000000002', 'Pinecrest Commons', 'Welltower', 'Nampa, ID',   185, 'Entitlements',     '2024-01-15', '2026-01-15'),
  ('d1000000-0000-0000-0000-000000000003', 'Sagebrook Village', 'Welltower', 'Boise, ID',   240, 'Due Diligence',    '2024-09-01', '2026-12-31')
on conflict (id) do nothing;

-- ============================================================
-- RLS FIX — run after auth is working
-- Replaces the temporary open-read policies set during dev
-- ============================================================
-- drop policy if exists "deals_read_all" on public.deals;
-- drop policy if exists "tasks_read_all" on public.tasks;
-- create policy "deals_read_all" on public.deals for select using (auth.role() = 'authenticated');
-- create policy "tasks_read_all" on public.tasks for select using (auth.role() = 'authenticated');
