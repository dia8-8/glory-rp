-- Glory RP — VIP store (the storefront layer on top of Tebex).
-- Tebex holds the real products, prices, payments and delivery (in-game items + Discord role).
-- These tables only hold what the website shows: pictures, names, order, bundles and sales.
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to run more than once.

-- A product on the website = one Tebex package
create table if not exists public.store_products (
  id                uuid primary key default gen_random_uuid(),
  tebex_package_id  text not null,                    -- numeric Tebex package id
  name_en           text not null,
  name_ar           text not null,
  desc_en           text not null default '',
  desc_ar           text not null default '',
  image             text,                             -- picture URL (uploaded or a /images/... path)
  image_path        text,                             -- storage path, used to delete the file
  category          text not null default 'business', -- business | vehicle | property | personal
  badge_en          text not null default '',
  badge_ar          text not null default '',
  visible           boolean not null default true,
  position          int not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists store_products_position_idx on public.store_products (position, created_at);

-- A bundle = several products bought in one checkout, optionally discounted with a Tebex coupon
create table if not exists public.store_bundles (
  id                uuid primary key default gen_random_uuid(),
  name_en           text not null,
  name_ar           text not null,
  desc_en           text not null default '',
  desc_ar           text not null default '',
  image             text,
  image_path        text,
  product_ids       uuid[] not null default '{}',
  discount_percent  int not null default 0 check (discount_percent between 0 and 90),
  coupon_id         text,                             -- Tebex coupon created for the discount
  coupon_code       text,
  visible           boolean not null default true,
  position          int not null default 0,
  created_at        timestamptz not null default now()
);

-- A sale = a percentage off selected products for a time window (a Tebex coupon applied at checkout)
create table if not exists public.store_sales (
  id                uuid primary key default gen_random_uuid(),
  name_en           text not null,
  name_ar           text not null,
  discount_percent  int not null check (discount_percent between 1 and 90),
  product_ids       uuid[] not null default '{}',
  starts_at         timestamptz not null default now(),
  ends_at           timestamptz,                      -- null = no end
  show_on_home      boolean not null default true,
  coupon_id         text,
  coupon_code       text,
  created_at        timestamptz not null default now()
);

alter table public.store_products enable row level security;
alter table public.store_bundles  enable row level security;
alter table public.store_sales    enable row level security;

-- Public bucket for product / bundle pictures (anyone can view, only the server can upload/delete)
insert into storage.buckets (id, name, public)
values ('store', 'store', true)
on conflict (id) do update set public = true;
