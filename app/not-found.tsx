import Link from 'next/link';
import Image from 'next/image';
import { getLang } from '@/lib/i18n-server';
import { Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  const isAr = getLang() === 'ar';
  return (
    <main className="page-shell flex items-center justify-center">
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <Image src="/logo.png" alt="" width={96} height={96} className="mx-auto h-20 w-20 opacity-90" />
        <p className="mt-8 text-8xl font-black tracking-tighter text-gradient sm:text-9xl" dir="ltr">404</p>
        <h1 className="mt-4 text-2xl font-extrabold">{isAr ? 'هذه الصفحة غير موجودة' : 'This page left the city'}</h1>
        <p className="mt-3 text-white/60">
          {isAr ? 'ربما تم نقل الرابط أو حذفه.' : 'The link may have moved or no longer exists.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            <Home className="h-4 w-4" /> {isAr ? 'الرئيسية' : 'Back home'}
          </Link>
          <Link href="/rules" className="btn btn-ghost">
            <BookOpen className="h-4 w-4" /> {isAr ? 'القوانين' : 'Rules'}
          </Link>
        </div>
      </div>
    </main>
  );
}
