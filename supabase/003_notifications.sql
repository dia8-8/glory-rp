-- Glory RP — on-site notifications (the bell in the navbar).
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to run more than once.

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  discord_id  text not null,
  icon        text not null default '🔔',
  title_en    text not null,
  title_ar    text not null,
  body_en     text not null default '',
  body_ar     text not null default '',
  note        text,                       -- optional staff note
  link        text,                       -- site path to open, e.g. '/status'
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications (discord_id, created_at desc);
create index if not exists notifications_user_unread_idx  on public.notifications (discord_id) where read_at is null;

-- Only the server (service role key) may read/write. No public access.
alter table public.notifications enable row level security;
