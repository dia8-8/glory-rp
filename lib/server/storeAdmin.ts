// Helpers for the VIP store admin routes. Server only.
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getPackagesWithInfo, getWebstore, tebexConfigured, couponsConfigured, TebexError } from './tebex';
import { loadStoreRows } from './store';

export const STORE_BUCKET = 'store';
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Requests are multipart: a "data" JSON field + an optional "image" file. Plain JSON also works. */
export async function readRequest(req: Request): Promise<{ data: Record<string, any>; image: File | null }> {
  if ((req.headers.get('content-type') || '').includes('multipart/form-data')) {
    const form = await req.formData();
    let data: Record<string, any> = {};
    try {
      data = JSON.parse(String(form.get('data') ?? '{}'));
    } catch {
      /* keep empty */
    }
    const image = form.get('image');
    return { data, image: image instanceof File && image.size > 0 ? image : null };
  }
  return { data: (await req.json().catch(() => ({}))) ?? {}, image: null };
}

/** Uploads a picture to the public "store" bucket. Returns { src, path } or an error message. */
export async function uploadImage(client: SupabaseClient, file: File): Promise<{ src: string; path: string } | { error: string }> {
  const ext = TYPES[file.type];
  if (!ext) return { error: 'Use a JPG, PNG, WEBP or GIF image.' };
  if (file.size > MAX_BYTES) return { error: 'Image must be 5 MB or smaller.' };
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await client.storage.from(STORE_BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    cacheControl: '31536000',
  });
  if (up.error) return { error: up.error.message };
  return { src: client.storage.from(STORE_BUCKET).getPublicUrl(path).data.publicUrl, path };
}

export async function removeImage(client: SupabaseClient, path?: string | null) {
  if (path) await client.storage.from(STORE_BUCKET).remove([path]);
}

/** Everything the admin editor needs in one response. */
export async function adminSnapshot() {
  const rows = await loadStoreRows();
  if (!rows) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  if ('error' in rows) {
    const missing = /does not exist|Could not find the table|schema cache/i.test(rows.error ?? '');
    return NextResponse.json({ error: missing ? 'setup-needed' : rows.error ?? 'Error' }, { status: missing ? 503 : 500 });
  }

  let packages: Awaited<ReturnType<typeof getPackagesWithInfo>>['packages'] = [];
  let packageInfo: Awaited<ReturnType<typeof getPackagesWithInfo>>['info'] | null = null;
  let store: { name: string; currency: string; url?: string; usernames?: boolean } | null = null;
  let tebexError: string | null = null;
  if (tebexConfigured()) {
    try {
      const [p, w] = await Promise.all([getPackagesWithInfo(), getWebstore()]);
      packages = p.packages;
      packageInfo = p.info;
      store = { name: w.name, currency: w.currency, url: w.webstore_url, usernames: w.supports_usernames };
    } catch (e) {
      tebexError = e instanceof TebexError ? e.message : String(e);
    }
  }

  return NextResponse.json({
    ...rows,
    tebex: {
      configured: tebexConfigured(),
      coupons: couponsConfigured(),
      error: tebexError,
      store,
      packageInfo,
      packages: packages.map((p) => ({ id: p.id, name: p.name, price: p.total_price, currency: p.currency, category: p.category?.name ?? '', image: p.image ?? null })),
    },
  });
}

export function tebexFailure(e: unknown) {
  const msg = e instanceof TebexError ? e.message : String((e as Error)?.message ?? e);
  return NextResponse.json({ error: msg }, { status: e instanceof TebexError ? e.status : 500 });
}

/** Numeric Tebex package ids for a list of website product ids. */
export async function packageIdsFor(client: SupabaseClient, productIds: string[]) {
  if (!productIds.length) return [];
  const { data } = await client.from('store_products').select('id, tebex_package_id').in('id', productIds);
  return (data ?? []).map((r: any) => Number(r.tebex_package_id)).filter((n) => Number.isFinite(n));
}
