-- Glory RP — submissions table for the staff dashboard.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('interview', 'job', 'cityhall', 'ticket')),
  category      text not null default '',          -- job/ticket/cityhall key, e.g. 'police', 'vip'
  discord_id    text not null,
  discord_name  text not null default '',
  avatar        text,
  answers       jsonb not null default '{}'::jsonb,
  status        text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'under18', 'closed')),
  note          text,                                -- staff note / reason sent to the player
  reviewed_by   text,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists submissions_status_created_idx on public.submissions (status, created_at desc);
create index if not exists submissions_user_kind_idx      on public.submissions (discord_id, kind, created_at desc);

-- Only the server (service role key) may read/write. No public access.
alter table public.submissions enable row level security;
