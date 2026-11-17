import HomeClient from '@/components/home/HomeClient';
import { getGallery, getNews } from '@/lib/server/content';

export const dynamic = 'force-dynamic';

/** Loads admin-managed content on the server, then renders the interactive home page. */
export default async function HomePage() {
  const [gallery, news] = await Promise.all([getGallery(), getNews(4)]);
  return (
    <HomeClient
      gallery={gallery.items.map(({ src, caption }) => ({ src, caption }))}
      news={news.items.map(({ date, tag, title, body }) => ({ date, tag, title, body }))}
    />
  );
}
