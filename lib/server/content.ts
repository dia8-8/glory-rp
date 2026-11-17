// Admin-managed content with safe fallbacks. Server only.
//   • Database set up → it is the source of truth (an empty table means "nothing to show").
//   • Database not set up / table missing → the built-in content from data/home.ts.
import { db } from './db';
import { GALLERY, NEWS } from '@/data/home';

type Bi = { en: string; ar: string };
export type GalleryItem = { id?: string; src: string; path?: string | null; caption: Bi; position?: number };
export type NewsItem = { id?: string; date: string; tag: Bi; title: Bi; body: Bi };
export type ContentSource = 'database' | 'default';

export async function getGallery(): Promise<{ items: GalleryItem[]; source: ContentSource }> {
  const client = db();
  if (client) {
    const { data, error } = await client
      .from('gallery')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });
    if (!error && data) {
      return {
        source: 'database',
        items: data.map((r: any) => ({ id: r.id, src: r.src, path: r.path, position: r.position, caption: { en: r.caption_en, ar: r.caption_ar } })),
      };
    }
  }
  return { source: 'default', items: GALLERY };
}

export async function getNews(limit?: number): Promise<{ items: NewsItem[]; source: ContentSource }> {
  const client = db();
  if (client) {
    let q = client.from('news').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (!error && data) {
      return {
        source: 'database',
        items: data.map((r: any) => ({
          id: r.id,
          date: String(r.date).slice(0, 10),
          tag: { en: r.tag_en, ar: r.tag_ar },
          title: { en: r.title_en, ar: r.title_ar },
          body: { en: r.body_en, ar: r.body_ar },
        })),
      };
    }
  }
  return { source: 'default', items: limit ? NEWS.slice(0, limit) : NEWS };
}
