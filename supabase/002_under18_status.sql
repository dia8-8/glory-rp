-- Only needed if you already ran 001_submissions.sql BEFORE the "Under 18" status existed.
-- Safe to run more than once. Supabase: SQL Editor → New query → paste → Run.

alter table public.submissions drop constraint if exists submissions_status_check;
alter table public.submissions
  add constraint submissions_status_check
  check (status in ('pending', 'accepted', 'rejected', 'under18', 'closed'));
