// Checkout flow: website → Tebex basket → Tebex payment page. Server only.
// Tebex takes the payment and delivers (in-game items + Discord role). We only build the basket.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from './db';
import { SITE } from '@/lib/site';
import { saleByProduct, type BundleRow, type ProductRow, type SaleRow } from './store';
import { addPackageToBasket, applyCoupon, createBasket, getBasket, getBasketAuthLinks, TebexError } from './tebex';

export type CheckoutItems = { basket: string; packages: string[]; coupons: string[]; exp: number };
export type CartItem = { kind: 'product' | 'bundle'; id: string };
export const MAX_CART_ITEMS = 20;

/** Runs one Tebex step and puts its name in front of any error, e.g. "Creating the basket: Tebex 422: …" */
async function step<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof TebexError) throw new TebexError(`${label}: ${e.message}`, e.status);
    throw e;
  }
}

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
  const current = await step('Reading the basket', () => getBasket(basket));
  if (current.packages?.length) {
    if (!current.links?.checkout) throw new TebexError('This checkout was already completed.', 409);
    return current.links.checkout;
  }
  for (const p of packages) await step(`Adding package ${p}`, () => addPackageToBasket(basket, p, 1));
  for (const code of coupons) {
    // A failed coupon shouldn't block the purchase — the customer sees the real price on Tebex before paying
    await applyCoupon(basket, code).catch((e) => console.error('[checkout] coupon failed:', code, (e as Error).message));
  }
  const b = await step('Reading the basket', () => getBasket(basket));
  if (!b.links?.checkout) throw new TebexError('Tebex did not return a checkout link.');
  return b.links.checkout;
}

/**
 * Starts a checkout for everything in the cart. Returns the URL to send the player to:
 *  • stores that need the player's game account (FiveM → cfx.re login) → the Tebex sign-in page first
 *  • otherwise → straight to the Tebex payment page
 */
export async function startCheckout(opts: { items: CartItem[]; ip?: string; discordId?: string | null }) {
  if (!opts.items.length) throw new TebexError('Your cart is empty.', 400);
  if (opts.items.length > MAX_CART_ITEMS) throw new TebexError(`Maximum ${MAX_CART_ITEMS} items per order.`, 400);

  // Resolve every item; one package is only bought once even if it's in a bundle and on its own
  const packages: string[] = [];
  const coupons: string[] = [];
  for (const item of opts.items) {
    const r = await resolvePurchase(item.kind, item.id);
    for (const p of r.packages) if (!packages.includes(p)) packages.push(p);
    for (const c of r.coupons) if (!coupons.includes(c)) coupons.push(c);
  }

  const basket = await step('Creating the basket', () =>
    createBasket({
      completeUrl: `${SITE.url}/vipshop?paid=1`,
      cancelUrl: `${SITE.url}/vipshop?cancelled=1`,
      ipAddress: opts.ip,
      custom: {
        source: 'website',
        items: opts.items.map((i) => `${i.kind}:${i.id}`).join(','),
        ...(opts.discordId ? { discord_id: opts.discordId } : {}),
      },
    })
  );

  return loginOrPay(basket.ident, packages, coupons);
}

/**
 * FiveM stores need the buyer to log in with their cfx.re account (that's how Tebex knows which
 * player gets the items). Tebex runs that login itself: we ask it for the login link and, if it
 * offers one, send the buyer there first. Tebex then returns them to /api/store/continue, which
 * fills the basket and forwards to payment. If Tebex offers no login, go straight to payment.
 */
export async function loginOrPay(basketIdent: string, packages: string[], coupons: string[]) {
  const token = signItems({ basket: basketIdent, packages, coupons, exp: Date.now() + 30 * 60_000 });
  const returnUrl = `${SITE.url}/api/store/continue?t=${encodeURIComponent(token)}`;

  let links: { name: string; url: string }[] = [];
  try {
    links = await getBasketAuthLinks(basketIdent, returnUrl);
  } catch (e) {
    // a 4xx here means this store has no login step; anything else is a real problem
    if (!(e instanceof TebexError) || e.status >= 500) throw new TebexError(`Getting the FiveM login link: ${(e as Error).message}`);
  }
  if (links.length) {
    // prefer the FiveM / cfx.re option if Tebex lists several
    const fivem = links.find((l) => /fivem|cfx/i.test(`${l.name} ${l.url}`));
    return (fivem ?? links[0]).url;
  }
  return fillAndGetCheckoutUrl(basketIdent, packages, coupons);
}
