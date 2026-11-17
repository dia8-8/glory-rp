import { NextResponse } from 'next/server';
import { requireVipAdmin, dbError } from '@/lib/server/guard';
import { adminSnapshot, packageIdsFor, readRequest, removeImage, tebexFailure, txt, uploadImage } from '@/lib/server/storeAdmin';
import { couponCode, couponsConfigured, createCoupon, deleteCoupon, getPackages } from '@/lib/server/tebex';
import type { SupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function clean(d: Record<string, any>) {
  const row = {
    name_en: txt(d.name_en, 120),
    name_ar: txt(d.name_ar, 120),
    desc_en: txt(d.desc_en, 1000),
    desc_ar: txt(d.desc_ar, 1000),
    product_ids: Array.isArray(d.product_ids) ? [...new Set(d.product_ids.filter((x: unknown) => typeof x === 'string'))].slice(0, 20) as string[] : [],
    discount_percent: Math.max(0, Math.min(90, Math.round(Number(d.discount_percent) || 0))),
    visible: d.visible !== false,
  };
  if (!row.name_en || !row.name_ar) return { error: 'Write the bundle name in English and Arabic.' };
  if (row.product_ids.length < 2) return { error: 'A bundle needs at least 2 products.' };
  if (row.discount_percent > 0 && !couponsConfigured())
    return { error: 'Add TEBEX_PRIVATE_KEY to give bundles a discount (or set the discount to 0).' };
  return { row };
}

/**
 * The bundle discount is a Tebex coupon limited to the bundle's packages. Its minimum basket value is
 * (almost) the full bundle price, so the code can't be reused to discount a single item.
 */
async function makeCoupon(client: SupabaseClient, name: string, productIds: string[], percent: number) {
  if (percent <= 0) return { id: null, code: null };
  const pkgIds = await packageIdsFor(client, productIds);
  const prices = new Map((await getPackages()).map((p) => [p.id, p.base_price]));
  const full = pkgIds.reduce((sum, id) => sum + (prices.get(id) ?? 0), 0);
  return createCoupon({
    code: couponCode('BUNDLE'),
    packageIds: pkgIds,
    percent,
    minimum: Math.floor(full * 0.99 * 100) / 100,
    note: `Website bundle: ${name}`,
  });
}

export async function POST(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const { data, image } = await readRequest(req);
  const c = clean(data);
  if ('error' in c) return NextResponse.json({ error: c.error }, { status: 400 });

  let coupon: { id: string | null; code: string | null };
  try {
    coupon = await makeCoupon(g.client, c.row.name_en, c.row.product_ids, c.row.discount_percent);
  } catch (e) {
    return tebexFailure(e);
  }
  let pic: { src: string | null; path: string | null } = { src: null, path: null };
  if (image) {
    const up = await uploadImage(g.client, image);
    if ('error' in up) return NextResponse.json({ error: up.error }, { status: 400 });
    pic = up;
  }
  const { data: last } = await g.client.from('store_bundles').select('position').order('position', { ascending: false }).limit(1);
  const { error } = await g.client.from('store_bundles').insert({
    ...c.row,
    image: pic.src,
    image_path: pic.path,
    coupon_id: coupon.id,
    coupon_code: coupon.code,
    position: (last?.[0]?.position ?? -1) + 1,
  });
  if (error) {
    if (coupon.id) await deleteCoupon(coupon.id).catch(() => {});
    await removeImage(g.client, pic.path);
    return dbError(error.message);
  }
  return adminSnapshot();
}

export async function PATCH(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const { data, image } = await readRequest(req);
  if (typeof data.id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const c = clean(data);
  if ('error' in c) return NextResponse.json({ error: c.error }, { status: 400 });

  const { data: cur } = await g.client.from('store_bundles').select('*').eq('id', data.id).maybeSingle();
  if (!cur) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // New coupon first, then swap, then delete the old one — never leaves the bundle without a working discount
  const changed =
    cur.discount_percent !== c.row.discount_percent ||
    JSON.stringify([...cur.product_ids].sort()) !== JSON.stringify([...c.row.product_ids].sort());
  let coupon = { id: cur.coupon_id as string | null, code: cur.coupon_code as string | null };
  if (changed) {
    try {
      coupon = await makeCoupon(g.client, c.row.name_en, c.row.product_ids, c.row.discount_percent);
    } catch (e) {
      return tebexFailure(e);
    }
  }

  const update: Record<string, unknown> = { ...c.row, coupon_id: coupon.id, coupon_code: coupon.code };
  if (image) {
    const up = await uploadImage(g.client, image);
    if ('error' in up) return NextResponse.json({ error: up.error }, { status: 400 });
    update.image = up.src;
    update.image_path = up.path;
  } else if (data.removeImage) {
    update.image = null;
    update.image_path = null;
  }
  const { error } = await g.client.from('store_bundles').update(update).eq('id', data.id);
  if (error) {
    if (changed && coupon.id) await deleteCoupon(coupon.id).catch(() => {});
    return dbError(error.message);
  }
  if (changed && cur.coupon_id) await deleteCoupon(cur.coupon_id).catch(() => {});
  if ((image || data.removeImage) && cur.image_path) await removeImage(g.client, cur.image_path);
  return adminSnapshot();
}

export async function DELETE(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { data: cur } = await g.client.from('store_bundles').select('coupon_id, image_path').eq('id', id).maybeSingle();
  const { error } = await g.client.from('store_bundles').delete().eq('id', id);
  if (error) return dbError(error.message);
  if (cur?.coupon_id) await deleteCoupon(cur.coupon_id).catch(() => {});
  await removeImage(g.client, cur?.image_path);
  return adminSnapshot();
}
