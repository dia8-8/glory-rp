// Server-only Supabase access (service role). Never import from client components.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type SubmissionKind = 'interview' | 'job' | 'cityhall' | 'ticket';
export type SubmissionStatus = 'pending' | 'accepted' | 'rejected' | 'under18' | 'closed';

export type Submission = {
  id: string;
  kind: SubmissionKind;
  category: string;
  discord_id: string;
  discord_name: string;
  avatar: string | null;
  answers: Record<string, unknown>;
  status: SubmissionStatus;
  note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

let client: SupabaseClient | null | undefined;

/** Returns null when Supabase isn't configured, so callers can degrade gracefully. */
export function db(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export const TABLE = 'submissions';
