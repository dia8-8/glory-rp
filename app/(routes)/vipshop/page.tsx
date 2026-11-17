import Link from 'next/link';
import { Crown, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { getLang } from '@/lib/i18n-server';
import VipGrid from '@/components/VipGrid';
import StoreFront from '@/components/store/StoreFront';
import { getStorefront } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'VIP Shop',
  description: 'Purchase VIP packages for Glory RP including dealers, villas, gangs, and more.',
};

export default async function VipShopPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const isAr = getLang() === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  // Tebex store once it's set up with at least one product; until then the old shop + form
  const store = await getStorefront();
  const status = searchParams.paid ? 'paid' : searchParams.cancelled ? 'cancelled' : searchParams.error === 'expired' ? 'expired' : searchParams.error ? 'error' : null;
  const reason = typeof searchParams.reason === 'string' ? searchParams.reason.slice(0, 200) : null;

  return (
    <main className="page-shell text-white">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:pt-36">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <span className="pill mb-4">
            <Crown className="h-3.5 w-3.5" /> VIP
          </span>
          <h1 className="section-title">
            {isAr ? (
              <>متجر <span className="text-gradient">VIP</span></>
            ) : (
              <>VIP <span className="text-gradient">Shop</span></>
            )}
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand" />
          <p className="mt-5 text-base text-white/65">
            {store.mode === 'tebex'
              ? isAr ? 'اشترِ مباشرة وتصلك المشتريات داخل اللعبة تلقائيًا.' : 'Buy instantly — your items are delivered in game automatically.'
              : isAr ? 'اكتشف باقات VIP الحصرية وقدّم على الباقة المناسبة لك.' : 'Explore exclusive VIP options and apply for your custom package.'}
          </p>
        </header>

        {store.mode === 'tebex' ? (
          <StoreFront data={store} status={status} reason={reason} />
        ) : (
          <>
            <VipGrid />
            <div className="card mx-auto mt-14 flex max-w-2xl flex-col items-center gap-4 p-8 text-center">
              <p className="text-sm text-white/70">
                {isAr ? 'لشراء VIP، يرجى تعبئة النموذج من الرابط أدناه.' : 'To purchase VIP, please fill the form in the link below.'}
              </p>
              <p className="flex items-center gap-2 text-xs text-white/45">
                <AlertTriangle className="h-3.5 w-3.5 text-brand" />
                {isAr ? 'لا يمكن التعديل أو الاسترجاع بعد الشراء.' : 'No changes or refunds are accepted after purchase.'}
              </p>
              <Link href="/tickets/vip" className="btn btn-primary mt-2 px-8 py-3 text-base">
                {isAr ? 'فتح النموذج' : 'Open Form'} <Arrow className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
