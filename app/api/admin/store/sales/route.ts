import { NextResponse } from 'next/server';
import { requireVipAdmin, dbError } from '@/lib/server/guard';
import { adminSnapshot, packageIdsFor, readRequest, tebexFailure, txt } from '@/lib/server/storeAdmin';
import { couponCode, couponsConfigured, createCoupon, deleteCoupon } from '@/lib/server/tebex';

export const dynamic = 'force-dynamic';

function clean(d: Record<string, any>) {
  const starts = d.starts_at ? new Date(d.starts_at) : new Date();
  const ends = d.ends_at ? new Date(d.ends_at) : null;
  const row = {
    name_en: txt(d.name_en, 120),
    name_ar: txt(d.name_ar, 120),
    discount_percent: Math.round(Number(d.discount_percent) || 0),
    product_ids: Array.isArray(d.product_ids) ? [...new Set(d.product_ids.filter((x: unknown) => typeof x === 'string'))].slice(0, 200) as string[] : [],
    starts_at: starts,
    ends_at: ends,
    show_on_home: d.show_on_home !== false,
  };
  if (!row.name_en || !row.name_ar) return { error: 'Write the sale name in English and Arabic.' };
  if (row.discount_percent < 1 || row.discount_percent > 90) return { error: 'The discount must be between 1% and 90%.' };
  if (!row.product_ids.length) return { error: 'Pick at least one product for the sale.' };
  if (Number.isNaN(starts.getTime()) || (ends && Number.isNaN(ends.getTime()))) return { error: 'Check the dates.' };
  if (ends && ends <= starts) return { error: 'The end must be after the start.' };
  if (!couponsConfigured()) return { error: 'Add TEBEX_PRIVATE_KEY so sales can create a real Tebex discount.' };
  return { row };
}

/**
 * A sale = a Tebex coupon limited to the sale's packages, applied automatically at checkout while the
 * sale is active. Tebex coupon dates are whole days, so the coupon runs one extra day; the website
 * only applies it between the exact start and end times.
 */
async function makeCoupon(client: any, row: ReturnType<typeof clean> & { row: any }) {
  const r = row.row;
  return createCoupon({
    code: couponCode('SALE'),
    packageIds: await packageIdsFor(client, r.product_ids),
    percent: r.discount_percent,
    start: r.starts_at,
    end: r.ends_at ? new Date(r.ends_at.getTime() + 24 * 3600_000) : null,
    note: `Website sale: ${r.name_en}`,
  });
}

const toDb = (r: any) => ({ ...r, starts_at: r.starts_at.toISOString(), ends_at: r.ends_at ? r.ends_at.toISOString() : null });

export async function POST(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const { data } = await readRequest(req);
  const c = clean(data);
  if ('error' in c) return NextResponse.json({ error: c.error }, { status: 400 });
  let coupon;
  try {
    coupon = await makeCoupon(g.client, c);
  } catch (e) {
    return tebexFailure(e);
  }
  const { error } = await g.client.from('store_sales').insert({ ...toDb(c.row), coupon_id: coupon.id, coupon_code: coupon.code });
  if (error) {
    await deleteCoupon(coupon.id).catch(() => {});
    return dbError(error.message);
  }
  return adminSnapshot();
}

export async function PATCH(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const { data } = await readRequest(req);
  if (typeof data.id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const c = clean(data);
  if ('error' in c) return NextResponse.json({ error: c.error }, { status: 400 });
  const { data: cur } = await g.client.from('store_sales').select('coupon_id').eq('id', data.id).maybeSingle();
  if (!cur) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let coupon;
  try {
    coupon = await makeCoupon(g.client, c);
  } catch (e) {
    return tebexFailure(e);
  }
  const { error } = await g.client
    .from('store_sales')
    .update({ ...toDb(c.row), coupon_id: coupon.id, coupon_code: coupon.code })
    .eq('id', data.id);
  if (error) {
    await deleteCoupon(coupon.id).catch(() => {});
    return dbError(error.message);
  }
  if (cur.coupon_id) await deleteCoupon(cur.coupon_id).catch(() => {});
  return adminSnapshot();
}

/** ?id=… → ends and removes the sale (and its Tebex coupon) */
export async function DELETE(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { data: cur } = await g.client.from('store_sales').select('coupon_id').eq('id', id).maybeSingle();
  const { error } = await g.client.from('store_sales').delete().eq('id', id);
  if (error) return dbError(error.message);
  if (cur?.coupon_id) await deleteCoupon(cur.coupon_id).catch(() => {});
  return adminSnapshot();
}
