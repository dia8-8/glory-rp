import { getLang } from '@/lib/i18n-server';
import { NewsList } from '@/components/home/Sections';
import { Newspaper } from 'lucide-react';
import { getNews } from '@/lib/server/content';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'News & Updates' };

export default async function NewsPage() {
  const isAr = getLang() === 'ar';
  const { items } = await getNews();
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:pt-36">
        <header className="mb-14 text-center">
          <span className="pill mb-4">
            <Newspaper className="h-3.5 w-3.5" /> {isAr ? 'جديد' : 'Changelog'}
          </span>
          <h1 className="section-title">{isAr ? 'الأخبار والتحديثات' : 'News & Updates'}</h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand" />
        </header>
        <NewsList items={items.map(({ date, tag, title, body }) => ({ date, tag, title, body }))} />
      </div>
    </main>
  );
}
