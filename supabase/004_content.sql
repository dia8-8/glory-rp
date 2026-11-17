-- Glory RP — content managed by admins: gallery, news/updates, rules quiz questions.
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to run more than once.

-- Gallery images (files live in the public "gallery" storage bucket)
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  src         text not null,                 -- public image URL
  path        text,                          -- storage path, used to delete the file
  caption_en  text not null default '',
  caption_ar  text not null default '',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists gallery_position_idx on public.gallery (position, created_at);

-- News / updates
create table if not exists public.news (
  id          uuid primary key default gen_random_uuid(),
  date        date not null default current_date,
  tag_en      text not null default '',
  tag_ar      text not null default '',
  title_en    text not null,
  title_ar    text not null,
  body_en     text not null default '',
  body_ar     text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists news_date_idx on public.news (date desc, created_at desc);

-- Key/value settings (e.g. key 'quiz' holds the rules quiz questions and pass mark)
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  text,
  updated_at  timestamptz not null default now()
);

-- Only the server (service role key) may read/write these tables.
alter table public.gallery       enable row level security;
alter table public.news          enable row level security;
alter table public.site_settings enable row level security;

-- Public storage bucket for gallery images (anyone can view, only the server can upload/delete)
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;
