import HomeClient from '@/components/home/HomeClient';
import { getGallery, getNews } from '@/lib/server/content';
import { getHomeSales } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Loads admin-managed content on the server, then renders the interactive home page. */
export default async function HomePage() {
  const [gallery, news, sales] = await Promise.all([getGallery(), getNews(4), getHomeSales().catch(() => null)]);
  return (
    <HomeClient
      gallery={gallery.items.map(({ src, caption }) => ({ src, caption }))}
      news={news.items.map(({ date, tag, title, body }) => ({ date, tag, title, body }))}
      sales={sales}
    />
  );
}
