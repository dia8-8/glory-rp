import { NextResponse } from 'next/server';
import { requireAdmin, dbError } from '@/lib/server/guard';
import { getNews } from '@/lib/server/content';
import { NEWS } from '@/data/home';

export const dynamic = 'force-dynamic';

const s = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/** Validates an update coming from the admin form. */
function clean(body: any): { row: Record<string, string> } | { error: string } {
  const row = {
    date: s(body.date, 10),
    tag_en: s(body.tag_en, 40),
    tag_ar: s(body.tag_ar, 40),
    title_en: s(body.title_en, 160),
    title_ar: s(body.title_ar, 160),
    body_en: s(body.body_en, 2000),
    body_ar: s(body.body_ar, 2000),
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) return { error: 'Pick a date.' };
  if (!row.title_en || !row.title_ar) return { error: 'Write the title in English and Arabic.' };
  return { row };
}

export async function GET() {
  const g = await requireAdmin();
  if (g.error) return g.error;
  return NextResponse.json(await getNews());
}

/** Create an update, or { action: 'import' } to copy the built-in updates into an empty list. */
export async function POST(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));

  if (body.action === 'import') {
    const rows = NEWS.map((n) => ({
      date: n.date, tag_en: n.tag.en, tag_ar: n.tag.ar, title_en: n.title.en, title_ar: n.title.ar, body_en: n.body.en, body_ar: n.body.ar,
    }));
    const { error } = await g.client.from('news').insert(rows);
    if (error) return dbError(error.message);
    return NextResponse.json(await getNews());
  }

  const c = clean(body);
  if ('error' in c) return NextResponse.json({ error: c.error }, { status: 400 });
  const { error } = await g.client.from('news').insert(c.row);
  if (error) return dbError(error.message);
  return NextResponse.json(await getNews());
}

export async function PATCH(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  if (typeof body.id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const c = clean(body);
  if ('error' in c) return NextResponse.json({ error: c.error }, { status: 400 });
  const { error } = await g.client.from('news').update(c.row).eq('id', body.id);
  if (error) return dbError(error.message);
  return NextResponse.json(await getNews());
}

export async function DELETE(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await g.client.from('news').delete().eq('id', id);
  if (error) return dbError(error.message);
  return NextResponse.json(await getNews());
}
