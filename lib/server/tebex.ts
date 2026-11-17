// Tebex connection — server only.
//
//   TEBEX_PUBLIC_TOKEN            Public token from creator.tebex.io/developers/api-keys (starts like "abcd-...").
//                                 Used to list packages and create checkouts.
//   TEBEX_HEADLESS_PRIVATE_KEY    Optional. Private key from the same api-keys page. Lets the server pass the
//                                 buyer's real IP to Tebex (an authenticated request). Without it, baskets are
//                                 created without the IP.
//   TEBEX_PRIVATE_KEY             Game server secret key (Game servers → your server). Only needed to create
//                                 discount coupons for sales and bundles (Plugin API).
//
// Tebex handles payments and delivery (in-game items via the FiveM Tebex resource, Discord roles
// via the package's Discord deliverable). This file never touches money.
//
// Docs: https://docs.tebex.io/developers/headless-api/endpoints · https://docs.tebex.io/plugin/endpoints/coupons

import { randomInt } from 'node:crypto';

const HEADLESS = 'https://headless.tebex.io/api/accounts';
const PLUGIN = 'https://plugin.tebex.io';

export const tebexConfigured = () => !!process.env.TEBEX_PUBLIC_TOKEN;
export const couponsConfigured = () => !!process.env.TEBEX_PRIVATE_KEY;

export class TebexError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

function base() {
  const token = process.env.TEBEX_PUBLIC_TOKEN;
  if (!token) throw new TebexError('Tebex is not configured (TEBEX_PUBLIC_TOKEN missing).', 503);
  return `${HEADLESS}/${encodeURIComponent(token)}`;
}

async function call<T>(url: string, init: RequestInit & { revalidate?: number } = {}): Promise<T> {
  const { revalidate, ...rest } = init;
  const r = await fetch(url, {
    ...rest,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...rest.headers },
    ...(revalidate !== undefined ? { next: { revalidate } } : { cache: 'no-store' }),
    signal: AbortSignal.timeout(10_000),
  }).catch((e) => {
    throw new TebexError(`Could not reach Tebex: ${e?.message || e}`);
  });
  const text = await r.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON */
  }
  if (!r.ok) {
    const msg = json?.detail || json?.message || json?.error_message || json?.title || text.slice(0, 200) || r.statusText;
    throw new TebexError(`Tebex ${r.status}: ${msg}`, r.status >= 500 ? 502 : r.status);
  }
  return json as T;
}

/* ───────── Headless API (public token) ───────── */

export type TebexPackage = {
  id: number;
  ident?: string;
  name: string;
  description?: string;
  image?: string | null;
  base_price: number;
  total_price: number;
  sales_tax?: number;
  currency: string;
  discount?: number;
  category?: { id: number; name: string };
  disable_quantity?: boolean;
};

export type TebexWebstore = { id: number; name: string; currency: string; webstore_url?: string; supports_usernames?: boolean; platform_type?: string };

export async function getWebstore(): Promise<TebexWebstore> {
  const j = await call<{ data: TebexWebstore }>(`${base()}/`, { revalidate: 300 });
  return j.data;
}

type TebexCategory = { id: number; name: string; packages?: TebexPackage[]; subcategories?: TebexCategory[] };

/** Every package found inside categories (some stores only return packages this way). */
async function packagesFromCategories(): Promise<{ packages: TebexPackage[]; categories: number }> {
  const j = await call<{ data: TebexCategory[] }>(`${base()}/categories?includePackages=1`, { revalidate: 60 });
  const out: TebexPackage[] = [];
  let categories = 0;
  const walk = (cats: TebexCategory[] = []) => {
    for (const c of cats) {
      categories++;
      for (const p of c.packages ?? []) out.push({ ...p, category: p.category ?? { id: c.id, name: c.name } });
      walk(c.subcategories);
    }
  };
  walk(j.data);
  return { packages: out, categories };
}

/** All packages with live prices (cached for 60 seconds), plus counts for the connection panel. */
export async function getPackagesWithInfo(): Promise<{ packages: TebexPackage[]; info: { fromPackages: number; fromCategories: number; categories: number } }> {
  const [direct, viaCats] = await Promise.all([
    call<{ data: TebexPackage[] }>(`${base()}/packages`, { revalidate: 60 }).then((j) => j.data ?? []),
    packagesFromCategories().catch(() => ({ packages: [] as TebexPackage[], categories: 0 })),
  ]);
  // merge both lists, one entry per package id
  const byId = new Map<number, TebexPackage>();
  for (const p of [...direct, ...viaCats.packages]) if (p?.id !== undefined && !byId.has(p.id)) byId.set(p.id, p);
  return {
    packages: [...byId.values()],
    info: { fromPackages: direct.length, fromCategories: viaCats.packages.length, categories: viaCats.categories },
  };
}

export async function getPackages(): Promise<TebexPackage[]> {
  return (await getPackagesWithInfo()).packages;
}

type Basket = { ident: string; links?: { checkout?: string; payment?: string }; packages?: unknown[]; total_price?: number };

export async function createBasket(opts: { completeUrl: string; cancelUrl: string; ipAddress?: string; custom?: Record<string, unknown> }) {
  const body = {
    complete_url: opts.completeUrl,
    cancel_url: opts.cancelUrl,
    complete_auto_redirect: true,
    custom: opts.custom ?? {},
  };
  const priv = process.env.TEBEX_HEADLESS_PRIVATE_KEY;
  const token = process.env.TEBEX_PUBLIC_TOKEN ?? '';

  // Passing the buyer's IP is an authenticated request (Basic auth: public token + private key).
  if (priv && opts.ipAddress) {
    try {
      const j = await call<{ data: Basket }>(`${base()}/baskets`, {
        method: 'POST',
        headers: { Authorization: 'Basic ' + Buffer.from(`${token}:${priv}`).toString('base64') },
        body: JSON.stringify({ ...body, ip_address: opts.ipAddress }),
      });
      return j.data;
    } catch (e) {
      // wrong/rotated key → fall back to a plain basket instead of blocking the purchase
      if (!(e instanceof TebexError) || e.status >= 500) throw e;
      console.error('[tebex] authenticated basket failed, retrying without IP:', e.message);
    }
  }
  const j = await call<{ data: Basket }>(`${base()}/baskets`, { method: 'POST', body: JSON.stringify(body) });
  return j.data;
}

/** Sign-in links for baskets that need the player's game account (FiveM stores log in with cfx.re). */
export async function getBasketAuthLinks(basketIdent: string, returnUrl: string) {
  const j = await call<{ name: string; url: string }[] | { data: { name: string; url: string }[] }>(
    `${base()}/baskets/${encodeURIComponent(basketIdent)}/auth?returnUrl=${encodeURIComponent(returnUrl)}`
  );
  return Array.isArray(j) ? j : j?.data ?? [];
}

/**
 * POSTs to the first address Tebex recognises. Tebex's docs disagree on some basket paths
 * (guide: /api/baskets/{ident}/…, spec: /api/accounts/{token}/{ident}/…), so we try each form.
 * Only "not found / not allowed" moves on to the next one; any other error (e.g. 422) is real and is thrown.
 */
async function postFirstWorking<T>(urls: string[], body: unknown): Promise<T> {
  let last: TebexError | null = null;
  for (const url of urls) {
    try {
      return await call<T>(url, { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      if (!(e instanceof TebexError) || ![404, 405].includes(e.status)) throw e;
      last = e;
    }
  }
  throw last ?? new TebexError('Tebex basket address not found.');
}

export async function addPackageToBasket(basketIdent: string, packageId: string | number, quantity = 1) {
  const b = encodeURIComponent(basketIdent);
  const j = await postFirstWorking<{ data: Basket }>(
    [`${HEADLESS.replace('/accounts', '')}/baskets/${b}/packages`, `${base()}/baskets/${b}/packages`, `${base()}/${b}/packages`],
    { package_id: String(packageId), quantity }
  );
  return j.data;
}

export async function applyCoupon(basketIdent: string, code: string) {
  const b = encodeURIComponent(basketIdent);
  return postFirstWorking<{ success: boolean; message: string }>(
    [`${base()}/baskets/${b}/coupons`, `${HEADLESS.replace('/accounts', '')}/baskets/${b}/coupons`],
    { coupon_code: code }
  );
}

export async function getBasket(basketIdent: string) {
  const j = await call<{ data: Basket }>(`${base()}/baskets/${encodeURIComponent(basketIdent)}`);
  return j.data;
}

/* ───────── Plugin API (secret key) — coupons for sales & bundles ───────── */

function pluginHeaders() {
  const key = process.env.TEBEX_PRIVATE_KEY;
  if (!key) throw new TebexError('TEBEX_PRIVATE_KEY is missing, so discounts can’t be created.', 503);
  return { 'X-Tebex-Secret': key };
}

/**
 * Checks TEBEX_PRIVATE_KEY with Tebex (Plugin API "information"): returns the game server it belongs to,
 * or the reason it's rejected. Used by the admin connection panel.
 */
export async function checkServerKey(): Promise<{ ok: true; server: string } | { ok: false; error: string }> {
  if (!process.env.TEBEX_PRIVATE_KEY) return { ok: false, error: 'missing' };
  try {
    const j = await call<{ server?: { name?: string; id?: number } }>(`${PLUGIN}/information`, { headers: pluginHeaders(), revalidate: 300 });
    return { ok: true, server: j?.server?.name || `#${j?.server?.id ?? '?'}` };
  } catch (e) {
    try {
      explainPluginError(e);
    } catch (x) {
      return { ok: false, error: (x as Error).message };
    }
    return { ok: false, error: String(e) };
  }
}

/** Turns Tebex's "wrong key" reply into an instruction the admin can act on. */
function explainPluginError(e: unknown): never {
  if (e instanceof TebexError && e.status === 403 && /No server could be found/i.test(e.message)) {
    throw new TebexError(
      'TEBEX_PRIVATE_KEY is not a game server secret key. Use the key from Tebex → Game Servers → your FiveM server (the same one as sv_tebexSecret), then redeploy.',
      403
    );
  }
  throw e;
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

/** Creates a percentage coupon limited to the given packages. Returns { id, code }. */
export async function createCoupon(opts: {
  code: string;
  packageIds: number[];
  percent: number;
  start?: Date;
  end?: Date | null;
  minimum?: number;
  note: string;
}) {
  const j = await call<{ data: { id: number; code: string } }>(`${PLUGIN}/coupons`, {
    method: 'POST',
    headers: pluginHeaders(),
    body: JSON.stringify({
      code: opts.code,
      effective_on: 'package',
      packages: opts.packageIds,
      discount_type: 'percentage',
      discount_percentage: opts.percent,
      discount_amount: 0,
      redeem_unlimited: true,
      expire_never: !opts.end,
      ...(opts.end ? { expire_date: ymd(opts.end) } : {}),
      start_date: ymd(opts.start ?? new Date()),
      basket_type: 'both',
      minimum: opts.minimum ?? 0,
      discount_application_method: 0,
      note: opts.note,
    }),
  }).catch(explainPluginError);
  return { id: String(j.data.id), code: j.data.code ?? opts.code };
}

export async function deleteCoupon(id: string) {
  await call(`${PLUGIN}/coupons/${encodeURIComponent(id)}`, { method: 'DELETE', headers: pluginHeaders() }).catch((e: TebexError) => {
    if (e.status !== 404) throw e; // already gone is fine
  });
}

/** Random, hard-to-guess coupon code, e.g. GLORY-SALE-7K2M9QX4 */
export function couponCode(prefix: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[randomInt(chars.length)];
  return `GLORY-${prefix}-${s}`;
}
