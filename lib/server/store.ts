// VIP store data — server only. Website info (pictures, names, bundles, sales) from Supabase,
// prices and availability live from Tebex.
import { db } from './db';
import { getPackages, tebexConfigured, type TebexPackage } from './tebex';

type Bi = { en: string; ar: string };
export const STORE_CATEGORIES = ['business', 'vehicle', 'property', 'personal'] as const;
export type StoreCategory = (typeof STORE_CATEGORIES)[number];

export type ProductRow = {
  id: string; tebex_package_id: string; name_en: string; name_ar: string; desc_en: string; desc_ar: string;
  image: string | null; image_path: string | null; category: StoreCategory; badge_en: string; badge_ar: string;
  visible: boolean; position: number; created_at: string;
};
export type BundleRow = {
  id: string; name_en: string; name_ar: string; desc_en: string; desc_ar: string; image: string | null; image_path: string | null;
  product_ids: string[]; discount_percent: number; coupon_id: string | null; coupon_code: string | null;
  visible: boolean; position: number; created_at: string;
};
export type SaleRow = {
  id: string; name_en: string; name_ar: string; discount_percent: number; product_ids: string[];
  starts_at: string; ends_at: string | null; show_on_home: boolean; coupon_id: string | null; coupon_code: string | null; created_at: string;
};

/** What the public store page receives (no coupon codes). */
export type PublicProduct = {
  id: string; name: Bi; desc: Bi; image: string | null; category: StoreCategory; badge: Bi;
  price: number; salePrice: number | null; salePercent: number; saleEnds: string | null;
};
export type PublicBundle = {
  id: string; name: Bi; desc: Bi; image: string | null; items: { id: string; name: Bi }[];
  price: number; finalPrice: number; discountPercent: number;
};
export type PublicSale = { id: string; name: Bi; percent: number; endsAt: string | null; productIds: string[] };
export type Storefront =
  | { mode: 'legacy' } // not set up yet → old static shop
  | { mode: 'tebex'; currency: string; products: PublicProduct[]; bundles: PublicBundle[]; sales: PublicSale[] };

const round = (n: number) => Math.round(n * 100) / 100;

export async function loadStoreRows() {
  const client = db();
  if (!client) return null;
  const [p, b, s] = await Promise.all([
    client.from('store_products').select('*').order('position').order('created_at'),
    client.from('store_bundles').select('*').order('position').order('created_at'),
    client.from('store_sales').select('*').order('created_at', { ascending: false }),
  ]);
  if (p.error || b.error || s.error) return { error: (p.error || b.error || s.error)!.message };
  return { products: p.data as ProductRow[], bundles: b.data as BundleRow[], sales: s.data as SaleRow[] };
}

export function isSaleActive(s: Pick<SaleRow, 'starts_at' | 'ends_at'>, now = Date.now()) {
  return new Date(s.starts_at).getTime() <= now && (!s.ends_at || new Date(s.ends_at).getTime() > now);
}

/** Best active sale for each product id. */
export function saleByProduct(sales: SaleRow[]) {
  const map = new Map<string, SaleRow>();
  for (const s of sales.filter((x) => isSaleActive(x))) {
    for (const pid of s.product_ids) {
      const cur = map.get(pid);
      if (!cur || s.discount_percent > cur.discount_percent) map.set(pid, s);
    }
  }
  return map;
}

export async function getStorefront(): Promise<Storefront> {
  if (!tebexConfigured()) return { mode: 'legacy' };
  const rows = await loadStoreRows();
  if (!rows || 'error' in rows || rows.products.length === 0) return { mode: 'legacy' };

  let packages: TebexPackage[];
  try {
    packages = await getPackages();
  } catch (e) {
    console.error('[store] Tebex packages failed:', (e as Error).message);
    return { mode: 'legacy' };
  }
  const pkg = new Map(packages.map((p) => [String(p.id), p]));
  const sales = saleByProduct(rows.sales);
  const currency = packages[0]?.currency ?? 'USD';

  const products: PublicProduct[] = rows.products
    .filter((r) => r.visible && pkg.has(String(r.tebex_package_id))) // hide products whose Tebex package is gone
    .map((r) => {
      const price = round(pkg.get(String(r.tebex_package_id))!.total_price);
      const sale = sales.get(r.id);
      return {
        id: r.id,
        name: { en: r.name_en, ar: r.name_ar },
        desc: { en: r.desc_en, ar: r.desc_ar },
        image: r.image,
        category: r.category,
        badge: { en: r.badge_en, ar: r.badge_ar },
        price,
        salePercent: sale?.discount_percent ?? 0,
        salePrice: sale ? round(price * (1 - sale.discount_percent / 100)) : null,
        saleEnds: sale?.ends_at ?? null,
      };
    });

  const byId = new Map(products.map((p) => [p.id, p]));
  const bundles: PublicBundle[] = rows.bundles
    .filter((b) => b.visible && b.product_ids.length > 0 && b.product_ids.every((id) => byId.has(id)))
    .map((b) => {
      const items = b.product_ids.map((id) => byId.get(id)!);
      const price = round(items.reduce((sum, p) => sum + p.price, 0));
      return {
        id: b.id,
        name: { en: b.name_en, ar: b.name_ar },
        desc: { en: b.desc_en, ar: b.desc_ar },
        image: b.image,
        items: items.map((p) => ({ id: p.id, name: p.name })),
        price,
        discountPercent: b.discount_percent,
        finalPrice: round(price * (1 - b.discount_percent / 100)),
      };
    });

  const publicSales: PublicSale[] = rows.sales
    .filter((s) => isSaleActive(s))
    .map((s) => ({ id: s.id, name: { en: s.name_en, ar: s.name_ar }, percent: s.discount_percent, endsAt: s.ends_at, productIds: s.product_ids }));

  return { mode: 'tebex', currency, products, bundles, sales: publicSales };
}

/** Active sales marked "show on home", with their products — for the home page banner. */
export async function getHomeSales() {
  const sf = await getStorefront().catch(() => ({ mode: 'legacy' }) as Storefront);
  if (sf.mode !== 'tebex') return null;
  const rows = await loadStoreRows();
  if (!rows || 'error' in rows) return null;
  const homeIds = new Set(rows.sales.filter((s) => s.show_on_home && isSaleActive(s)).map((s) => s.id));
  const sales = sf.sales.filter((s) => homeIds.has(s.id));
  if (!sales.length) return null;
  const ids = new Set(sales.flatMap((s) => s.productIds));
  return { currency: sf.currency, sales, products: sf.products.filter((p) => ids.has(p.id) && p.salePrice !== null) };
}
