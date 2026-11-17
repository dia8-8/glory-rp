'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Percent, Timer, ArrowRight, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useLang } from '@/lib/providers';
import Reveal from '@/components/Reveal';
import { Countdown, money } from '@/components/store/StoreFront';

type Bi = { en: string; ar: string };
export type HomeSales = {
  currency: string;
  sales: { id: string; name: Bi; percent: number; endsAt: string | null }[];
  products: { id: string; name: Bi; image: string | null; price: number; salePrice: number | null; salePercent: number }[];
};

/** "On sale now" block on the home page — shown only while a sale marked "show on home" is running. */
export default function SaleSpotlight({ data }: { data: HomeSales }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const tr = (b: Bi) => (isAr ? b.ar || b.en : b.en || b.ar);
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const sale = [...data.sales].sort((a, b) => b.percent - a.percent)[0];
  const items = data.products.slice(0, 4);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-brand/40 bg-gradient-to-br from-brand/20 via-surface to-surface p-6 sm:p-10">
          <div className="pointer-events-none absolute -end-20 -top-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="pill mb-3"><Percent className="h-3.5 w-3.5" /> {isAr ? 'عرض لفترة محدودة' : 'Limited-time sale'}</span>
              <h2 className="text-3xl font-black sm:text-4xl">
                {tr(sale.name)} <span className="text-gradient">{isAr ? `خصم ${sale.percent}%` : `${sale.percent}% OFF`}</span>
              </h2>
              {sale.endsAt && (
                <p className="mt-2 flex items-center gap-1.5 text-white/65">
                  <Timer className="h-4 w-4 text-brand" /> {isAr ? 'ينتهي خلال' : 'Ends in'} <Countdown to={sale.endsAt} isAr={isAr} />
                </p>
              )}
            </div>
            <Link href="/vipshop" className="btn btn-primary px-6 py-3 text-base">
              {isAr ? 'تسوّق العروض' : 'Shop the sale'} <Arrow className="h-4 w-4" />
            </Link>
          </div>

          {items.length > 0 && (
            <div className="relative mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {items.map((p) => (
                <Link key={p.id} href="/vipshop" className="group overflow-hidden rounded-2xl border border-white/10 bg-ink/60 transition hover:border-brand/50">
                  <div className="relative aspect-[5/3] overflow-hidden">
                    {p.image ? (
                      <Image src={p.image} alt={tr(p.name)} fill sizes="300px" unoptimized={p.image.startsWith('http')} className="object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="grid h-full place-items-center"><ShoppingCart className="h-8 w-8 text-brand/40" /></div>
                    )}
                    <span className="absolute start-2 top-2 rounded-md bg-brand px-2 py-0.5 text-xs font-extrabold text-ink">-{p.salePercent}%</span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{tr(p.name)}</p>
                    <p className="mt-1 text-sm" dir="ltr">
                      <span className="me-1.5 text-white/40 line-through">{money(p.price, data.currency)}</span>
                      <span className="font-extrabold text-brand">{money(p.salePrice ?? p.price, data.currency)}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
