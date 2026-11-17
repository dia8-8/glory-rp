// Checkout flow: website → Tebex basket → Tebex payment page. Server only.
// Tebex takes the payment and delivers (in-game items + Discord role). We only build the basket.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from './db';
import { SITE } from '@/lib/site';
import { saleByProduct, type BundleRow, type ProductRow, type SaleRow } from './store';
import { addPackageToBasket, applyCoupon, createBasket, getBasket, getBasketAuthLinks, getWebstore, TebexError } from './tebex';

export type CheckoutItems = { basket: string; packages: string[]; coupons: string[]; exp: number };

const secret = () => process.env.NEXTAUTH_SECRET || 'dev-secret';
const b64 = (s: string) => Buffer.from(s).toString('base64url');

/** Signed so the continue step can't be tampered with (e.g. swapping packages or coupons). */
export function signItems(items: CheckoutItems) {
  const body = b64(JSON.stringify(items));
  return `${body}.${createHmac('sha256', secret()).update(body).digest('base64url')}`;
}

export function readItems(token: string | null): CheckoutItems | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const good = createHmac('sha256', secret()).update(body).digest('base64url');
  if (sig.length !== good.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  try {
    const items = JSON.parse(Buffer.from(body, 'base64url').toString()) as CheckoutItems;
    return items.exp > Date.now() ? items : null;
  } catch {
    return null;
  }
}

/** Works out the Tebex packages + coupon for a product or bundle. */
export async function resolvePurchase(kind: 'product' | 'bundle', id: string) {
  const client = db();
  if (!client) throw new TebexError('The store is not set up yet.', 503);

  if (kind === 'product') {
    const { data: p } = await client.from('store_products').select('*').eq('id', id).eq('visible', true).maybeSingle();
    if (!p) throw new TebexError('This product is not available.', 404);
    const { data: sales } = await client.from('store_sales').select('*').contains('product_ids', [id]);
    const sale = saleByProduct((sales ?? []) as SaleRow[]).get(id);
    return {
      packages: [String((p as ProductRow).tebex_package_id)],
      coupons: sale?.coupon_code ? [sale.coupon_code] : [],
      label: (p as ProductRow).name_en,
    };
  }

  const { data: b } = await client.from('store_bundles').select('*').eq('id', id).eq('visible', true).maybeSingle();
  if (!b) throw new TebexError('This bundle is not available.', 404);
  const bundle = b as BundleRow;
  const { data: prods } = await client.from('store_products').select('id, tebex_package_id, visible').in('id', bundle.product_ids);
  if (!prods || prods.length !== bundle.product_ids.length || prods.some((x: any) => !x.visible))
    throw new TebexError('Part of this bundle is not available right now.', 409);
  return {
    packages: prods.map((x: any) => String(x.tebex_package_id)),
    // bundles use their own discount; sales don't stack on top
    coupons: bundle.coupon_code ? [bundle.coupon_code] : [],
    label: bundle.name_en,
  };
}

/** Adds the items to the basket and returns the Tebex payment URL. */
export async function fillAndGetCheckoutUrl(basket: string, packages: string[], coupons: string[]) {
  // Safe to call twice (e.g. the player reloads the page): only fill an empty basket
  const current = await getBasket(basket);
  if (current.packages?.length) {
    if (!current.links?.checkout) throw new TebexError('This checkout was already completed.', 409);
    return current.links.checkout;
  }
  for (const p of packages) await addPackageToBasket(basket, p, 1);
  for (const code of coupons) {
    // A failed coupon shouldn't block the purchase — the customer sees the real price on Tebex before paying
    await applyCoupon(basket, code).catch((e) => console.error('[checkout] coupon failed:', code, (e as Error).message));
  }
  const b = await getBasket(basket);
  if (!b.links?.checkout) throw new TebexError('Tebex did not return a checkout link.');
  return b.links.checkout;
}

/**
 * Starts a checkout. Returns the URL to send the player to:
 *  • stores that need the player's game account (FiveM → cfx.re login) → the Tebex sign-in page first
 *  • otherwise → straight to the Tebex payment page
 */
export async function startCheckout(opts: { kind: 'product' | 'bundle'; id: string; ip?: string; discordId?: string | null }) {
  const purchase = await resolvePurchase(opts.kind, opts.id);
  const basket = await createBasket({
    completeUrl: `${SITE.url}/vipshop?paid=1`,
    cancelUrl: `${SITE.url}/vipshop?cancelled=1`,
    ipAddress: opts.ip,
    custom: { source: 'website', item: `${opts.kind}:${opts.id}`, ...(opts.discordId ? { discord_id: opts.discordId } : {}) },
  });

  const store = await getWebstore();
  if (store.supports_usernames) {
    const token = signItems({ basket: basket.ident, packages: purchase.packages, coupons: purchase.coupons, exp: Date.now() + 30 * 60_000 });
    const links = await getBasketAuthLinks(basket.ident, `${SITE.url}/api/store/continue?t=${encodeURIComponent(token)}`);
    if (!links.length) throw new TebexError('Tebex did not return a sign-in link for this store.');
    return links[0].url;
  }
  return fillAndGetCheckoutUrl(basket.ident, purchase.packages, purchase.coupons);
}
