import { NextResponse } from 'next/server';
import { requireVipAdmin, dbError } from '@/lib/server/guard';
import { adminSnapshot, readRequest, removeImage, txt, uploadImage } from '@/lib/server/storeAdmin';
import { STORE_CATEGORIES } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

function clean(d: Record<string, any>) {
  const row = {
    tebex_package_id: String(d.tebex_package_id ?? '').replace(/\D/g, ''),
    name_en: txt(d.name_en, 120),
    name_ar: txt(d.name_ar, 120),
    desc_en: txt(d.desc_en, 1000),
    desc_ar: txt(d.desc_ar, 1000),
    category: STORE_CATEGORIES.includes(d.category) ? d.category : 'business',
    badge_en: txt(d.badge_en, 30),
    badge_ar: txt(d.badge_ar, 30),
    visible: d.visible !== false,
  };
  if (!row.tebex_package_id) return { error: 'Choose the Tebex package this product sells.' };
  if (!row.name_en || !row.name_ar) return { error: 'Write the product name in English and Arabic.' };
  return { row };
}

/** Create a product (multipart: data JSON + optional image) */
export async function POST(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const { data, image } = await readRequest(req);
  const c = clean(data);
  if ('error' in c) return NextResponse.json({ error: c.error }, { status: 400 });

  const { data: last } = await g.client.from('store_products').select('position').order('position', { ascending: false }).limit(1);
  let pic: { src: string; path: string | null } = { src: txt(data.image, 500), path: null };
  if (image) {
    const up = await uploadImage(g.client, image);
    if ('error' in up) return NextResponse.json({ error: up.error }, { status: 400 });
    pic = up;
  }
  const { error } = await g.client
    .from('store_products')
    .insert({ ...c.row, image: pic.src || null, image_path: pic.path, position: (last?.[0]?.position ?? -1) + 1 });
  if (error) {
    await removeImage(g.client, pic.path);
    return dbError(error.message);
  }
  return adminSnapshot();
}

/** Edit a product ({ id, ...fields } + optional new image), or reorder with { order: [ids] } */
export async function PATCH(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const { data, image } = await readRequest(req);

  if (Array.isArray(data.order)) {
    const ids = data.order.filter((x: unknown) => typeof x === 'string').slice(0, 300);
    const res = await Promise.all(ids.map((id: string, i: number) => g.client.from('store_products').update({ position: i }).eq('id', id)));
    const bad = res.find((r) => r.error);
    if (bad?.error) return dbError(bad.error.message);
    return adminSnapshot();
  }

  if (typeof data.id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const c = clean(data);
  if ('error' in c) return NextResponse.json({ error: c.error }, { status: 400 });

  const { data: cur } = await g.client.from('store_products').select('image_path').eq('id', data.id).maybeSingle();
  const update: Record<string, unknown> = { ...c.row };
  if (image) {
    const up = await uploadImage(g.client, image);
    if ('error' in up) return NextResponse.json({ error: up.error }, { status: 400 });
    update.image = up.src;
    update.image_path = up.path;
  } else if (data.removeImage) {
    update.image = null;
    update.image_path = null;
  }
  const { error } = await g.client.from('store_products').update(update).eq('id', data.id);
  if (error) return dbError(error.message);
  if ((image || data.removeImage) && cur?.image_path) await removeImage(g.client, cur.image_path);
  return adminSnapshot();
}

/** ?id=… → removes the product from the website (the Tebex package is not touched) */
export async function DELETE(req: Request) {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Bundles/sales that include it would break, so block and say which
  const [{ data: bundles }, { data: sales }] = await Promise.all([
    g.client.from('store_bundles').select('name_en').contains('product_ids', [id]),
    g.client.from('store_sales').select('name_en').contains('product_ids', [id]),
  ]);
  const usedBy = [...(bundles ?? []).map((b: any) => `bundle “${b.name_en}”`), ...(sales ?? []).map((s: any) => `sale “${s.name_en}”`)];
  if (usedBy.length) return NextResponse.json({ error: `Remove it from ${usedBy.join(', ')} first.` }, { status: 409 });

  const { data: cur } = await g.client.from('store_products').select('image_path').eq('id', id).maybeSingle();
  const { error } = await g.client.from('store_products').delete().eq('id', id);
  if (error) return dbError(error.message);
  await removeImage(g.client, cur?.image_path);
  return adminSnapshot();
}
