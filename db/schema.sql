-- FitTrack cloud sync setup
-- Run this in the Supabase dashboard: SQL Editor > New query > Run
-- Safe to re-run: everything uses IF NOT EXISTS / drop-then-create policies.

create table if not exists public.workouts (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workouts enable row level security;

-- upsert(..., { onConflict: 'user_id' }) needs a unique index on user_id.
-- The PK above provides one, but keep this in case the table already exists
-- with a different layout.
create unique index if not exists workouts_user_id_key on public.workouts (user_id);

drop policy if exists "workouts_select_own" on public.workouts;
create policy "workouts_select_own" on public.workouts
  for select using (
    (select auth.uid()) = user_id
  );

drop policy if exists "workouts_insert_own" on public.workouts;
create policy "workouts_insert_own" on public.workouts
  for insert with check (
    (select auth.uid()) = user_id
  );

drop policy if exists "workouts_update_own" on public.workouts;
create policy "workouts_update_own" on public.workouts
  for update using (
    (select auth.uid()) = user_id
  ) with check (
    (select auth.uid()) = user_id
  );

-- Not used by the app, but handy if you ever add delete.
drop policy if exists "workouts_delete_own" on public.workouts;
create policy "workouts_delete_own" on public.workouts
  for delete using (
    (select auth.uid()) = user_id
  );