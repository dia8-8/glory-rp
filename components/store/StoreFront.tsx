'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Percent, Timer, CheckCircle2, XCircle, ShieldCheck, Check } from 'lucide-react';
import clsx from 'clsx';
import { useLang } from '@/lib/providers';
import { useCart } from './useCart';
import CartDrawer from './CartDrawer';

type Bi = { en: string; ar: string };
type Product = {
  id: string; name: Bi; desc: Bi; image: string | null; category: string; badge: Bi;
  price: number; salePrice: number | null; salePercent: number; saleEnds: string | null;
};
type Bundle = { id: string; name: Bi; desc: Bi; image: string | null; items: { id: string; name: Bi }[]; price: number; finalPrice: number; discountPercent: number };
type Sale = { id: string; name: Bi; percent: number; endsAt: string | null; productIds: string[] };
export type StoreData = { currency: string; products: Product[]; bundles: Bundle[]; sales: Sale[] };

const SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', SAR: 'SAR ', AED: 'AED ' };
/** Same output on server and browser (no Intl), so no hydration mismatch */
export const money = (n: number, cur: string) => `${SYMBOL[cur] ?? cur + ' '}${n.toFixed(2).replace(/\.00$/, '')}`;

const TABS = [
  { key: 'all', en: 'All', ar: 'الكل' },
  { key: 'bundles', en: 'Bundles', ar: 'الباقات' },
  { key: 'sale', en: 'On sale', ar: 'عروض' },
  { key: 'business', en: 'Businesses', ar: 'المشاريع' },
  { key: 'vehicle', en: 'Vehicles', ar: 'المركبات' },
  { key: 'property', en: 'Property & Gangs', ar: 'العقارات والعصابات' },
  { key: 'personal', en: 'Personal', ar: 'شخصي' },
];

/** "2d 4h 10m" countdown, rendered only in the browser */
export function Countdown({ to, isAr }: { to: string; isAr: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return null;
  const ms = Math.max(0, new Date(to).getTime() - now);
  const d = Math.floor(ms / 86400_000), h = Math.floor((ms % 86400_000) / 3600_000), m = Math.floor((ms % 3600_000) / 60_000);
  const parts = isAr ? [d && `${d}ي`, (d || h) && `${h}س`, `${m}د`] : [d && `${d}d`, (d || h) && `${h}h`, `${m}m`];
  return <span dir="ltr">{parts.filter(Boolean).join(' ')}</span>;
}

export default function StoreFront({ data, status, reason }: { data: StoreData; status?: 'paid' | 'cancelled' | 'error' | 'expired' | null; reason?: string | null }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const tr = (b: Bi) => (isAr ? b.ar || b.en : b.en || b.ar);
  const [tab, setTab] = useState('all');
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [error, setError] = useState<string | null>(
    status === 'expired'
      ? isAr ? 'انتهت صلاحية رابط الدفع. أضف المنتجات للسلة واضغط إتمام الشراء مرة أخرى.' : 'The checkout link expired. Press Checkout in your cart again.'
      : status === 'error'
        ? (isAr ? 'تعذر إكمال الدفع. حاول مرة أخرى.' : 'The checkout couldn’t be completed. Please try again.') + (reason ? ` (${reason})` : '')
        : null
  );
  const [banner, setBanner] = useState(status);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.products.length + data.bundles.length, bundles: data.bundles.length, sale: data.products.filter((p) => p.salePrice !== null).length };
    for (const p of data.products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [data]);
  const tabs = TABS.filter((t) => t.key === 'all' || counts[t.key]);

  const products = tab === 'all' ? data.products : tab === 'sale' ? data.products.filter((p) => p.salePrice !== null) : data.products.filter((p) => p.category === tab);
  const showBundles = (tab === 'all' || tab === 'bundles') && data.bundles.length > 0;

  // After a successful payment, empty the cart
  useEffect(() => {
    if (status === 'paid' && cart.ready) cart.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, cart.ready]);

  // Products already covered by a bundle in the cart can't be added on their own
  const coveredByBundle = useMemo(() => {
    const ids = new Set<string>();
    for (const i of cart.items) if (i.kind === 'bundle') data.bundles.find((b) => b.id === i.id)?.items.forEach((x) => ids.add(x.id));
    return ids;
  }, [cart.items, data.bundles]);

  function toggle(kind: 'product' | 'bundle', id: string) {
    setError(null);
    if (cart.has(kind, id)) return cart.remove(kind, id);
    // adding a bundle replaces its products if they were added on their own
    const replaces = kind === 'bundle' ? data.bundles.find((b) => b.id === id)?.items.map((x) => x.id) ?? [] : [];
    cart.add({ kind, id }, replaces);
    setBump((n) => n + 1);
  }

  const topSale = [...data.sales].sort((a, b) => b.percent - a.percent)[0];

  return (
    <div>
      {/* Result after returning from Tebex */}
      <AnimatePresence>
        {banner === 'paid' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card mb-8 flex items-start gap-4 border-brand/40 p-5">
            <CheckCircle2 className="h-7 w-7 shrink-0 text-brand" />
            <div className="flex-1">
              <h2 className="font-bold">{isAr ? 'شكرًا لشرائك! 🎉' : 'Thank you for your purchase! 🎉'}</h2>
              <p className="mt-1 text-sm text-white/65">
                {isAr
                  ? 'تم استلام الدفع عبر Tebex. ستصلك مشترياتك داخل اللعبة ورتبة الديسكورد تلقائيًا خلال دقائق.'
                  : 'Tebex received your payment. Your items will arrive in game and your Discord role will be added automatically within a few minutes.'}
              </p>
            </div>
            <button onClick={() => setBanner(null)} className="text-white/40 hover:text-white" aria-label="Close"><XCircle className="h-5 w-5" /></button>
          </motion.div>
        )}
        {banner === 'cancelled' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card mb-8 p-4 text-sm text-white/65">
            {isAr ? 'تم إلغاء الدفع، لم يتم خصم أي مبلغ.' : 'Checkout cancelled — you were not charged.'}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Sale banner */}
      {topSale && (
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-brand/40 bg-gradient-to-r from-brand/20 via-brand/10 to-transparent p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-ink"><Percent className="h-6 w-6" /></span>
            <div className="flex-1">
              <p className="text-lg font-extrabold">{tr(topSale.name)} — {isAr ? `خصم ${topSale.percent}%` : `${topSale.percent}% off`}</p>
              {topSale.endsAt && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/65">
                  <Timer className="h-4 w-4" /> {isAr ? 'ينتهي خلال' : 'Ends in'} <Countdown to={topSale.endsAt} isAr={isAr} />
                </p>
              )}
            </div>
            <button onClick={() => setTab('sale')} className="btn btn-primary">{isAr ? 'عرض العروض' : 'See the deals'}</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none]">
        <div className="mx-auto flex w-max gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1.5">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={clsx('relative whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition', tab === t.key ? 'text-ink' : 'text-white/65 hover:text-white')}>
              {tab === t.key && <motion.span layoutId="store-tab" className="absolute inset-0 rounded-xl bg-brand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{isAr ? t.ar : t.en} <span className={tab === t.key ? 'text-ink/60' : 'text-white/35'}>{counts[t.key] ?? 0}</span></span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      {/* Bundles */}
      {showBundles && (
        <section className="mb-12">
          {tab === 'all' && <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Package className="h-5 w-5 text-brand" /> {isAr ? 'الباقات' : 'Bundles'}</h2>}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {data.bundles.map((b) => (
              <article key={b.id} className="card card-hover group flex flex-col overflow-hidden sm:flex-row">
                <div className="relative aspect-[5/3] shrink-0 overflow-hidden bg-ink sm:aspect-auto sm:w-56">
                  {b.image ? <Image src={b.image} alt={tr(b.name)} fill sizes="300px" unoptimized={b.image.startsWith('http')} className="object-cover transition duration-500 group-hover:scale-110" /> : <div className="grid h-full place-items-center"><Package className="h-12 w-12 text-brand/50" /></div>}
                  {b.discountPercent > 0 && <span className="absolute start-3 top-3 rounded-md bg-brand px-2.5 py-1 text-xs font-extrabold text-ink">-{b.discountPercent}%</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold">{tr(b.name)}</h3>
                  {tr(b.desc) && <p className="mt-1 text-sm text-white/55">{tr(b.desc)}</p>}
                  <ul className="mt-3 space-y-1 text-sm text-white/70">
                    {b.items.map((it) => <li key={it.id} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" /> {tr(it.name)}</li>)}
                  </ul>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div dir="ltr">
                      {b.discountPercent > 0 && <span className="me-2 text-sm text-white/40 line-through">{money(b.price, data.currency)}</span>}
                      <span className="text-2xl font-extrabold text-brand">{money(b.finalPrice, data.currency)}</span>
                    </div>
                    <CartButton inCart={cart.has('bundle', b.id)} onClick={() => toggle('bundle', b.id)} isAr={isAr} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      {tab !== 'bundles' && (
        <>
          {tab === 'all' && showBundles && <h2 className="mb-4 text-xl font-bold">{isAr ? 'كل المنتجات' : 'All products'}</h2>}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <article key={p.id} className="card card-hover group flex flex-col overflow-hidden">
                <div className="relative aspect-[5/3] overflow-hidden bg-ink">
                  {p.image ? <Image src={p.image} alt={tr(p.name)} fill sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw" unoptimized={p.image.startsWith('http')} className="object-cover transition duration-500 group-hover:scale-110" /> : <div className="grid h-full place-items-center"><ShoppingCart className="h-10 w-10 text-brand/40" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
                  <div className="absolute start-3 top-3 flex gap-2">
                    {p.salePrice !== null && <span className="rounded-md bg-brand px-2 py-1 text-xs font-extrabold text-ink">-{p.salePercent}%</span>}
                    {tr(p.badge) && <span className="rounded-md bg-ink/80 px-2 py-1 text-xs font-bold backdrop-blur">{tr(p.badge)}</span>}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5 pt-2">
                  <h3 className="text-lg font-bold transition group-hover:text-brand">{tr(p.name)}</h3>
                  {tr(p.desc) && <p className="mt-1 line-clamp-3 text-sm text-white/55">{tr(p.desc)}</p>}
                  {p.saleEnds && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-brand/90"><Timer className="h-3.5 w-3.5" /> {isAr ? 'العرض ينتهي خلال' : 'Sale ends in'} <Countdown to={p.saleEnds} isAr={isAr} /></p>
                  )}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div dir="ltr">
                      {p.salePrice !== null && <span className="me-2 text-sm text-white/40 line-through">{money(p.price, data.currency)}</span>}
                      <span className="text-xl font-extrabold text-brand">{money(p.salePrice ?? p.price, data.currency)}</span>
                    </div>
                    {coveredByBundle.has(p.id) ? (
                      <span className="btn btn-ghost shrink-0 cursor-default text-xs text-white/50"><Package className="h-4 w-4" /> {isAr ? 'ضمن باقة' : 'In a bundle'}</span>
                    ) : (
                      <CartButton inCart={cart.has('product', p.id)} onClick={() => toggle('product', p.id)} isAr={isAr} />
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Floating cart button */}
      {cart.ready && cart.items.length > 0 && !cartOpen && (
        <motion.button
          key={bump}
          initial={{ scale: 0.9 }}
          animate={{ scale: [1.12, 1] }}
          transition={{ duration: 0.3 }}
          onClick={() => setCartOpen(true)}
          className="btn btn-primary fixed bottom-24 left-4 z-[60] h-14 rounded-2xl px-5 text-base shadow-2xl lg:bottom-6 lg:left-6"
          aria-label={isAr ? 'السلة' : 'Cart'}
        >
          <ShoppingCart className="h-5 w-5" /> {isAr ? 'السلة' : 'Cart'}
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-xs font-extrabold text-brand">{cart.items.length}</span>
        </motion.button>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        data={data}
        onError={(m) => { setError(m); setCartOpen(false); }}
      />

      <p className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-2 text-center text-xs text-white/45">
        <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
        {isAr
          ? 'الدفع الآمن عبر Tebex. تُسلَّم المشتريات داخل اللعبة ورتبة الديسكورد تلقائيًا. لا يمكن الاسترجاع بعد الشراء.'
          : 'Secure payment by Tebex. Items are delivered in game and your Discord role is added automatically. No refunds after purchase.'}
      </p>
    </div>
  );
}

function CartButton({ inCart, onClick, isAr }: { inCart: boolean; onClick: () => void; isAr: boolean }) {
  return inCart ? (
    <button onClick={onClick} className="btn btn-outline shrink-0" title={isAr ? 'إزالة من السلة' : 'Remove from cart'}>
      <Check className="h-4 w-4" /> {isAr ? 'في السلة' : 'In cart'}
    </button>
  ) : (
    <button onClick={onClick} className="btn btn-primary shrink-0">
      <ShoppingCart className="h-4 w-4" /> {isAr ? 'أضف للسلة' : 'Add to cart'}
    </button>
  );
}
