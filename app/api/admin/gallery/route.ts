import { NextResponse } from 'next/server';
import { requireAdmin, dbError } from '@/lib/server/guard';
import { getGallery } from '@/lib/server/content';
import { GALLERY } from '@/data/home';

export const dynamic = 'force-dynamic';

const BUCKET = 'gallery';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const cap = (v: unknown) => String(v ?? '').trim().slice(0, 120);

export async function GET() {
  const g = await requireAdmin();
  if (g.error) return g.error;
  return NextResponse.json(await getGallery());
}

/** multipart/form-data: file, caption_en, caption_ar  → uploads a new image
 *  application/json: { action: 'import' }              → copies the built-in images into an empty gallery */
export async function POST(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const { client } = g;

  const { data: last, error: lastErr } = await client.from('gallery').select('position').order('position', { ascending: false }).limit(1);
  if (lastErr) return dbError(lastErr.message);
  let position = (last?.[0]?.position ?? -1) + 1;

  if ((req.headers.get('content-type') || '').includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    if (body.action !== 'import') return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    const rows = GALLERY.map((x) => ({ src: x.src, caption_en: x.caption.en, caption_ar: x.caption.ar, position: position++ }));
    const { error } = await client.from('gallery').insert(rows);
    if (error) return dbError(error.message);
    return NextResponse.json(await getGallery());
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Use a JPG, PNG, WEBP or GIF image.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 400 });

  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await client.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    cacheControl: '31536000',
  });
  if (up.error) return dbError(up.error.message);
  const src = client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  const { error } = await client.from('gallery').insert({
    src,
    path,
    caption_en: cap(form?.get('caption_en')),
    caption_ar: cap(form?.get('caption_ar')),
    position,
  });
  if (error) {
    await client.storage.from(BUCKET).remove([path]); // don't leave an orphan file
    return dbError(error.message);
  }
  return NextResponse.json(await getGallery());
}

/** { id, caption_en, caption_ar } → edit captions
 *  { order: string[] }             → save a new order (ids, first = top-left) */
export async function PATCH(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const { client } = g;
  const body = await req.json().catch(() => ({}));

  if (Array.isArray(body.order)) {
    const ids: string[] = body.order.filter((x: unknown) => typeof x === 'string').slice(0, 200);
    const results = await Promise.all(ids.map((id, i) => client.from('gallery').update({ position: i }).eq('id', id)));
    const failed = results.find((r) => r.error);
    if (failed?.error) return dbError(failed.error.message);
    return NextResponse.json(await getGallery());
  }

  if (typeof body.id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await client
    .from('gallery')
    .update({ caption_en: cap(body.caption_en), caption_ar: cap(body.caption_ar) })
    .eq('id', body.id);
  if (error) return dbError(error.message);
  return NextResponse.json(await getGallery());
}

/** ?id=… → removes the image and its stored file */
export async function DELETE(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const { client } = g;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data: row, error: readErr } = await client.from('gallery').select('path').eq('id', id).maybeSingle();
  if (readErr) return dbError(readErr.message);
  const { error } = await client.from('gallery').delete().eq('id', id);
  if (error) return dbError(error.message);
  if (row?.path) await client.storage.from(BUCKET).remove([row.path]);
  return NextResponse.json(await getGallery());
}
