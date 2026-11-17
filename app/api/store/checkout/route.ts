import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startCheckout, MAX_CART_ITEMS, type CartItem } from '@/lib/server/checkout';
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

/** POST { items: [{ kind: 'product' | 'bundle', id }] } → { url } to send the player to.
 *  (A single { kind, id } is still accepted.) */
export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  if (limited(ip || 'unknown')) return NextResponse.json({ error: 'Too many attempts, wait a minute.' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const raw: unknown[] = Array.isArray(body.items) ? body.items : body.kind ? [body] : [];
  const items: CartItem[] = [];
  for (const x of raw.slice(0, MAX_CART_ITEMS + 1) as any[]) {
    const kind = x?.kind === 'bundle' ? 'bundle' : x?.kind === 'product' ? 'product' : null;
    const id = typeof x?.id === 'string' ? x.id : '';
    if (!kind || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    if (!items.some((i) => i.kind === kind && i.id === id)) items.push({ kind, id });
  }
  if (!items.length) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });

  const session = await getServerSession(authOptions);
  try {
    const url = await startCheckout({ items, ip: ip || undefined, discordId: session?.user?.id ?? null });
    return NextResponse.json({ url });
  } catch (e) {
    const err = e instanceof TebexError ? e : new TebexError(String((e as Error)?.message ?? e), 500);
    console.error('[checkout]', err.message);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
