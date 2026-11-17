'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, ShoppingCart, Package, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { useLang } from '@/lib/providers';
import { money, type StoreData } from './StoreFront';
import type { useCart } from './useCart';
import BodyPortal from '@/components/BodyPortal';

type Bi = { en: string; ar: string };
type Line = { kind: 'product' | 'bundle'; id: string; name: Bi; image: string | null; price: number; final: number; note?: Bi };

/** Side panel with the cart contents, totals and the checkout button. */
export default function CartDrawer({
  open, onClose, cart, data, onError,
}: {
  open: boolean;
  onClose: () => void;
  cart: ReturnType<typeof useCart>;
  data: StoreData;
  onError: (msg: string) => void;
}) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const tr = (b: Bi) => (isAr ? b.ar || b.en : b.en || b.ar);
  const [busy, setBusy] = useState(false);

  // Turn cart ids into lines; anything no longer sold is dropped
  const lines: Line[] = useMemo(
    () =>
      cart.items.flatMap<Line>((i) => {
        if (i.kind === 'product') {
          const p = data.products.find((x) => x.id === i.id);
          return p ? [{ kind: 'product', id: p.id, name: p.name, image: p.image, price: p.price, final: p.salePrice ?? p.price, note: p.salePrice !== null ? { en: `${p.salePercent}% off`, ar: `خصم ${p.salePercent}%` } : undefined }] : [];
        }
        const b = data.bundles.find((x) => x.id === i.id);
        return b ? [{ kind: 'bundle', id: b.id, name: b.name, image: b.image, price: b.price, final: b.finalPrice, note: { en: `Bundle · ${b.items.length} items`, ar: `باقة · ${b.items.length} منتجات` } }] : [];
      }),
    [cart.items, data]
  );

  // Clean up items that disappeared from the store
  useEffect(() => {
    if (!cart.ready) return;
    for (const i of cart.items) if (!lines.some((l) => l.kind === i.kind && l.id === i.id)) cart.remove(i.kind, i.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, cart.ready]);

  // Close on Escape, lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const total = lines.reduce((s, l) => s + l.final, 0);
  const saved = lines.reduce((s, l) => s + (l.price - l.final), 0);

  async function checkout() {
    setBusy(true);
    const r = await fetch('/api/store/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: lines.map(({ kind, id }) => ({ kind, id })) }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && j.url) {
      window.location.href = j.url; // Tebex sign-in / payment page
      return;
    }
    setBusy(false);
    onError(j.error || (isAr ? 'حدث خطأ، حاول مرة أخرى.' : 'Something went wrong, please try again.'));
  }

  return (
    <BodyPortal>
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[90] bg-ink/70 backdrop-blur-sm" />
          <motion.aside
            role="dialog"
            aria-modal
            aria-label={isAr ? 'السلة' : 'Cart'}
            initial={{ x: isAr ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 end-0 z-[95] flex w-full max-w-md flex-col border-s border-white/10 bg-surface shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/[0.06] p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingCart className="h-5 w-5 text-brand" /> {isAr ? 'السلة' : 'Your cart'}
                <span className="text-sm font-medium text-white/40">({lines.length})</span>
              </h2>
              <button onClick={onClose} className="btn btn-ghost h-9 w-9 p-0" aria-label={isAr ? 'إغلاق' : 'Close'}><X className="h-5 w-5" /></button>
            </header>

            {lines.length === 0 ? (
              <div className="grid flex-1 place-items-center p-8 text-center text-white/50">
                <div><ShoppingCart className="mx-auto mb-3 h-10 w-10 text-white/20" />{isAr ? 'السلة فارغة.' : 'Your cart is empty.'}</div>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-white/[0.06] overflow-y-auto">
                {lines.map((l) => (
                  <li key={l.kind + l.id} className="flex items-center gap-3 p-4">
                    <div className="relative grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink">
                      {l.image ? <Image src={l.image} alt="" fill sizes="80px" unoptimized={l.image.startsWith('http')} className="object-cover" /> : l.kind === 'bundle' ? <Package className="h-6 w-6 text-brand/50" /> : <ShoppingCart className="h-5 w-5 text-brand/40" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{tr(l.name)}</p>
                      {l.note && <p className="text-xs text-brand/80">{tr(l.note)}</p>}
                      <p className="mt-0.5 text-sm" dir="ltr">
                        {l.final < l.price && <span className="me-1.5 text-white/40 line-through">{money(l.price, data.currency)}</span>}
                        <span className="font-bold">{money(l.final, data.currency)}</span>
                      </p>
                    </div>
                    <button onClick={() => cart.remove(l.kind, l.id)} className="btn btn-ghost h-9 w-9 p-0 text-white/50 hover:text-red-300" title={isAr ? 'إزالة' : 'Remove'}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {lines.length > 0 && (
              <footer className="space-y-3 border-t border-white/[0.06] p-5">
                {saved > 0.009 && (
                  <div className="flex justify-between text-sm text-brand">
                    <span>{isAr ? 'وفّرت' : 'You save'}</span>
                    <span dir="ltr">−{money(saved, data.currency)}</span>
                  </div>
                )}
                <div className="flex items-end justify-between">
                  <span className="text-white/70">{isAr ? 'المجموع' : 'Total'}</span>
                  <span className="text-2xl font-extrabold text-brand" dir="ltr">{money(total, data.currency)}</span>
                </div>
                {/* What happens next */}
                <ol className="space-y-1.5 rounded-xl border border-white/[0.06] bg-ink/40 p-3 text-xs text-white/60">
                  {[
                    { en: 'Log in with your FiveM (cfx.re) account — so the items go to your character', ar: 'سجّل الدخول بحساب FiveM (cfx.re) — لتصل المشتريات لشخصيتك' },
                    { en: 'Pay securely on Tebex (final price with any taxes shown there)', ar: 'ادفع بأمان عبر Tebex (السعر النهائي مع الضرائب يظهر هناك)' },
                    { en: 'Items arrive in game + your Discord role is added automatically', ar: 'تصلك المشتريات داخل اللعبة وتُضاف رتبة الديسكورد تلقائيًا' },
                  ].map((st, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-[10px] font-bold text-brand">{i + 1}</span>
                      {isAr ? st.ar : st.en}
                    </li>
                  ))}
                </ol>
                <button onClick={checkout} disabled={busy} className="btn btn-primary h-12 w-full text-base">
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {isAr ? 'تسجيل الدخول بـ FiveM والدفع' : 'Log in with FiveM & pay'}
                </button>
                <button onClick={() => cart.clear()} disabled={busy} className="w-full text-center text-xs text-white/40 hover:text-red-300">
                  {isAr ? 'إفراغ السلة' : 'Empty cart'}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-white/35">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" /> {isAr ? 'دفع آمن عبر Tebex' : 'Secure payment by Tebex'}
                </p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
    </BodyPortal>
  );
}
