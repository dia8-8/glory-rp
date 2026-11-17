// Spam protection + saving submissions for the staff dashboard.
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { db, TABLE, type SubmissionKind } from './db';

/**
 * One call for API routes: checks limits, then saves the submission.
 * Returns a 429/401 response to send back, or null to continue to the Discord webhook.
 */
export async function protectAndRecord(
  session: Session | null,
  kind: SubmissionKind,
  category: string,
  answers: Record<string, unknown>
): Promise<NextResponse | null> {
  const discordId = session?.user?.id;
  if (!discordId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const guard = await guardSubmission(kind, category, discordId);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  await recordSubmission({
    kind,
    category,
    discordId,
    discordName: session?.user?.name || 'Unknown',
    avatar: typeof session?.user?.image === 'string' ? session.user.image : null,
    answers,
  });
  return null;
}

type Limit = { max: number; windowMs: number; onePending?: boolean };

/** Per-user limits for each form type. */
const LIMITS: Record<SubmissionKind, Limit> = {
  interview: { max: 1, windowMs: 24 * 3600_000, onePending: true }, // 1/day, never while one is pending
  job: { max: 2, windowMs: 24 * 3600_000, onePending: true },       // per job: 2/day, one pending at a time
  cityhall: { max: 3, windowMs: 3600_000 },                         // 3/hour
  ticket: { max: 4, windowMs: 3600_000 },                           // 4/hour per ticket type
};
const BURST_MS = 15_000; // minimum gap between any two submissions by one user

const MSG = {
  burst: 'Please wait a few seconds before sending again. / يرجى الانتظار قليلًا قبل الإرسال مرة أخرى.',
  pending: 'You already have one under review. Please wait for a decision. / لديك طلب قيد المراجعة بالفعل، يرجى انتظار القرار.',
  limit: 'You reached the limit for this form. Try again later. / وصلت للحد المسموح لهذا النموذج، حاول لاحقًا.',
};

// In-memory fallback (per server instance) — used for burst control and when Supabase isn't set up.
const memory = new Map<string, number[]>();
const lastAny = new Map<string, number>();

function memHits(key: string, windowMs: number) {
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  memory.set(key, hits);
  return hits;
}

export type Guard = { ok: true } | { ok: false; error: string; status: 429 };

export async function guardSubmission(kind: SubmissionKind, category: string, discordId: string): Promise<Guard> {
  const now = Date.now();
  const last = lastAny.get(discordId) ?? 0;
  if (now - last < BURST_MS) return { ok: false, error: MSG.burst, status: 429 };

  const limit = LIMITS[kind];
  const client = db();

  if (client) {
    const since = new Date(now - limit.windowMs).toISOString();
    const base = () =>
      client.from(TABLE).select('id', { count: 'exact', head: true }).eq('discord_id', discordId).eq('kind', kind).eq('category', category);

    const [recent, pending] = await Promise.all([
      base().gte('created_at', since),
      limit.onePending ? base().eq('status', 'pending') : Promise.resolve({ count: 0, error: null }),
    ]);

    // If the table isn't created yet, fall through to memory limits instead of blocking everyone.
    if (!recent.error && !pending.error) {
      if (limit.onePending && (pending.count ?? 0) > 0) return { ok: false, error: MSG.pending, status: 429 };
      if ((recent.count ?? 0) >= limit.max) return { ok: false, error: MSG.limit, status: 429 };
      return { ok: true };
    }
  }

  if (memHits(`${discordId}:${kind}:${category}`, limit.windowMs).length >= limit.max) {
    return { ok: false, error: MSG.limit, status: 429 };
  }
  return { ok: true };
}

/** Saves the submission (best effort) and records the hit for rate limiting. Returns the row id or null. */
export async function recordSubmission(input: {
  kind: SubmissionKind;
  category: string;
  discordId: string;
  discordName: string;
  avatar?: string | null;
  answers: Record<string, unknown>;
}): Promise<string | null> {
  const now = Date.now();
  lastAny.set(input.discordId, now);
  const key = `${input.discordId}:${input.kind}:${input.category}`;
  memory.set(key, [...memHits(key, LIMITS[input.kind].windowMs), now]);

  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from(TABLE)
    .insert({
      kind: input.kind,
      category: input.category,
      discord_id: input.discordId,
      discord_name: input.discordName,
      avatar: input.avatar ?? null,
      answers: input.answers,
    })
    .select('id')
    .single();
  if (error) {
    console.error('[submissions] insert failed:', error.message);
    return null;
  }
  return data.id as string;
}
