import { NextResponse } from 'next/server';
import { fillAndGetCheckoutUrl, readItems } from '@/lib/server/checkout';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * Tebex sends the player back here after they sign in with their game account (cfx.re for FiveM).
 * We add the items + discount to the now-authorized basket and forward them to the Tebex payment page.
 */
export async function GET(req: Request) {
  const items = readItems(new URL(req.url).searchParams.get('t'));
  if (!items) return NextResponse.redirect(`${SITE.url}/vipshop?error=expired`);
  try {
    const url = await fillAndGetCheckoutUrl(items.basket, items.packages, items.coupons);
    return NextResponse.redirect(url);
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    console.error('[checkout/continue]', msg);
    // Pass the reason to the store page so the player (and staff) can see what went wrong
    return NextResponse.redirect(`${SITE.url}/vipshop?error=checkout&reason=${encodeURIComponent(msg.slice(0, 200))}`);
  }
}
