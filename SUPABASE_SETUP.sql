-- Spyne Pricing Calculator — Supabase setup
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.

-- 1) One-row table that holds the shared pricing config as JSON.
create table if not exists public.pricing_config (
  id          int primary key,
  data        jsonb,
  updated_at  timestamptz default now()
);

-- 2) Seed the single row (id = 1). Starts empty; the app falls back to its built-in
--    defaults until someone saves from the admin page.
insert into public.pricing_config (id, data)
values (1, null)
on conflict (id) do nothing;

-- 3) Row Level Security: allow the public anon key to read and write THIS table only.
--    (No passcode, per request. Anyone with the page can edit pricing.)
alter table public.pricing_config enable row level security;

drop policy if exists "anon read pricing"  on public.pricing_config;
drop policy if exists "anon write pricing" on public.pricing_config;

create policy "anon read pricing"
  on public.pricing_config for select
  to anon
  using (true);

create policy "anon write pricing"
  on public.pricing_config for all
  to anon
  using (true)
  with check (true);
