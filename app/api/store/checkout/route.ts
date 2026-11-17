import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startCheckout } from '@/lib/server/checkout';
import { TebexError } from '@/lib/server/tebex';

export const dynamic = 'force-dynamic';

// Simple per-IP limit so nobody can spam Tebex with baskets
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

/** POST { kind: 'product' | 'bundle', id } → { url } to send the player to */
export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  if (limited(ip || 'unknown')) return NextResponse.json({ error: 'Too many attempts, wait a minute.' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const kind = body.kind === 'bundle' ? 'bundle' : body.kind === 'product' ? 'product' : null;
  const id = typeof body.id === 'string' ? body.id : '';
  if (!kind || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const session = await getServerSession(authOptions);
  try {
    const url = await startCheckout({ kind, id, ip: ip || undefined, discordId: session?.user?.id ?? null });
    return NextResponse.json({ url });
  } catch (e) {
    const err = e instanceof TebexError ? e : new TebexError(String((e as Error)?.message ?? e), 500);
    console.error('[checkout]', err.message);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
