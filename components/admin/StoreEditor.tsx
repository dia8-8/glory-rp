'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import {
  Plus, Pencil, Trash2, Save, X, ArrowUp, ArrowDown, EyeOff, AlertTriangle, CheckCircle2, Plug, Package,
  Percent, ShoppingBag, ImagePlus, ExternalLink, Home,
} from 'lucide-react';
import { useLang } from '@/lib/providers';
import { api, PageHeader, SetupNeeded, BiInput, Notice } from './ui';
import { money } from '@/components/store/StoreFront';

/* ───────── types (mirror the API) ───────── */
type Product = {
  id: string; tebex_package_id: string; name_en: string; name_ar: string; desc_en: string; desc_ar: string;
  image: string | null; category: string; badge_en: string; badge_ar: string; visible: boolean; position: number;
};
type Bundle = {
  id: string; name_en: string; name_ar: string; desc_en: string; desc_ar: string; image: string | null;
  product_ids: string[]; discount_percent: number; coupon_code: string | null; visible: boolean;
};
type Sale = {
  id: string; name_en: string; name_ar: string; discount_percent: number; product_ids: string[];
  starts_at: string; ends_at: string | null; show_on_home: boolean; coupon_code: string | null;
};
type TebexPkg = { id: number; name: string; price: number; currency: string; category: string; image: string | null };
type Snapshot = {
  products: Product[]; bundles: Bundle[]; sales: Sale[];
  tebex: { configured: boolean; coupons: boolean; error: string | null; store: { name: string; currency: string; url?: string; usernames?: boolean } | null; packages: TebexPkg[] };
};

const CATEGORIES = [
  { v: 'business', en: 'Business', ar: 'مشروع' },
  { v: 'vehicle', en: 'Vehicle', ar: 'مركبة' },
  { v: 'property', en: 'Property & Gangs', ar: 'عقار وعصابة' },
  { v: 'personal', en: 'Personal', ar: 'شخصي' },
];
const SECTIONS = [
  { key: 'products', en: 'Products', ar: 'المنتجات', Icon: ShoppingBag },
  { key: 'bundles', en: 'Bundles', ar: 'الباقات', Icon: Package },
  { key: 'sales', en: 'Sales', ar: 'العروض', Icon: Percent },
  { key: 'connection', en: 'Tebex connection', ar: 'ربط Tebex', Icon: Plug },
] as const;

/** Sends { data, image? } as multipart (what the store APIs expect) */
function send(url: string, method: string, data: object, image?: File | null) {
  const fd = new FormData();
  fd.append('data', JSON.stringify(data));
  if (image) fd.append('image', image);
  return api<Snapshot>(url, { method, body: fd });
}

/** datetime-local <-> ISO in the admin's own timezone */
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

export default function StoreEditor() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [setup, setSetup] = useState(false);
  const [section, setSection] = useState<(typeof SECTIONS)[number]['key']>('products');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function apply(r: { ok: boolean; data: any; error?: string }, okText?: string) {
    if (r.ok) {
      setSnap(r.data);
      if (okText) setMsg({ kind: 'ok', text: okText });
      return true;
    }
    if (r.error === 'setup-needed') setSetup(true);
    else setMsg({ kind: 'err', text: r.error || 'Error' });
    return false;
  }

  useEffect(() => {
    api<Snapshot>('/api/admin/store').then((r) => {
      apply(r);
      if (r.ok && (!r.data.tebex.configured || r.data.tebex.error)) setSection('connection');
    });
  }, []);

  if (setup) return <SetupNeeded isAr={isAr} file="supabase/005_store.sql" />;
  if (!snap) return <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />;

  const pkgById = new Map(snap.tebex.packages.map((p) => [String(p.id), p]));
  const currency = snap.tebex.store?.currency ?? snap.tebex.packages[0]?.currency ?? 'USD';
  const ctx = { snap, isAr, pkgById, currency, apply, setMsg };

  return (
    <div>
      <PageHeader
        title={isAr ? 'متجر VIP' : 'VIP store'}
        subtitle={
          isAr
            ? 'الدفع والتسليم (داخل اللعبة ورتبة الديسكورد) يتم عبر Tebex. هنا تتحكم بما يظهر في الموقع.'
            : 'Tebex handles payment and delivery (in game + Discord role). Here you control what the website shows.'
        }
      >
        <a href="/vipshop" target="_blank" className="btn btn-ghost"><ExternalLink className="h-4 w-4" /> {isAr ? 'عرض المتجر' : 'View store'}</a>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map(({ key, en, ar, Icon }) => {
          const count = key === 'products' ? snap.products.length : key === 'bundles' ? snap.bundles.length : key === 'sales' ? snap.sales.length : null;
          const warn = key === 'connection' && (!snap.tebex.configured || !!snap.tebex.error);
          return (
            <button
              key={key}
              onClick={() => { setSection(key); setMsg(null); }}
              className={clsx('btn', section === key ? 'btn-primary' : 'btn-ghost')}
            >
              <Icon className="h-4 w-4" /> {isAr ? ar : en}
              {count !== null && <span className="opacity-60">{count}</span>}
              {warn && <AlertTriangle className="h-4 w-4 text-amber-300" />}
            </button>
          );
        })}
      </div>

      {msg && <div className="mb-4"><Notice kind={msg.kind}>{msg.text}</Notice></div>}

      {section === 'products' && <Products {...ctx} />}
      {section === 'bundles' && <Bundles {...ctx} />}
      {section === 'sales' && <Sales {...ctx} />}
      {section === 'connection' && <Connection {...ctx} />}
    </div>
  );
}

type Ctx = {
  snap: Snapshot; isAr: boolean; pkgById: Map<string, TebexPkg>; currency: string;
  apply: (r: { ok: boolean; data: any; error?: string }, okText?: string) => boolean;
  setMsg: (m: { kind: 'ok' | 'err'; text: string } | null) => void;
};

/* ───────── shared bits ───────── */
function ImagePicker({ current, file, onFile, onRemove, isAr }: { current: string | null; file: File | null; onFile: (f: File | null) => void; onRemove?: () => void; isAr: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  const src = preview ?? current;
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'الصورة' : 'Picture'}</span>
      <label className="relative mt-1 grid aspect-[5/3] cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-white/15 text-center text-sm text-white/50 hover:border-brand/50">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span><ImagePlus className="mx-auto mb-1 h-7 w-7 text-brand" />{isAr ? 'اختر صورة' : 'Choose a picture'}<span className="block text-xs text-white/35">JPG · PNG · WEBP · GIF — 5 MB</span></span>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </label>
      {src && onRemove && (
        <button type="button" onClick={() => { onFile(null); onRemove(); }} className="mt-1 text-xs text-red-300 hover:underline">{isAr ? 'إزالة الصورة' : 'Remove picture'}</button>
      )}
    </div>
  );
}

function ProductChecklist({ products, selected, onChange, isAr, pkgById, currency }: { products: Product[]; selected: string[]; onChange: (ids: string[]) => void; isAr: boolean; pkgById: Map<string, TebexPkg>; currency: string }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'المنتجات' : 'Products'} ({selected.length})</span>
        <div className="flex gap-3 text-xs">
          <button type="button" className="text-brand hover:underline" onClick={() => onChange(products.map((p) => p.id))}>{isAr ? 'تحديد الكل' : 'Select all'}</button>
          <button type="button" className="text-white/50 hover:underline" onClick={() => onChange([])}>{isAr ? 'إلغاء' : 'Clear'}</button>
        </div>
      </div>
      <ul className="mt-1 grid max-h-64 gap-1 overflow-y-auto rounded-xl border border-white/[0.06] p-2 sm:grid-cols-2">
        {products.map((p) => {
          const pkg = pkgById.get(p.tebex_package_id);
          return (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5">
                <input type="checkbox" className="h-4 w-4 accent-brand" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                <span className="flex-1 truncate">{isAr ? p.name_ar : p.name_en}</span>
                {pkg && <span className="text-xs text-white/40" dir="ltr">{money(pkg.price, currency)}</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const RowActions = ({ onEdit, onDelete, isAr, extra }: { onEdit: () => void; onDelete: () => void; isAr: boolean; extra?: React.ReactNode }) => (
  <div className="flex gap-1.5">
    {extra}
    <button onClick={onEdit} className="btn btn-ghost h-9 px-3"><Pencil className="h-4 w-4" /> {isAr ? 'تعديل' : 'Edit'}</button>
    <button onClick={onDelete} className="btn h-9 w-9 border border-red-400/40 bg-red-400/10 p-0 text-red-300 hover:bg-red-400/20" title={isAr ? 'حذف' : 'Delete'}><Trash2 className="h-4 w-4" /></button>
  </div>
);

/* ───────── Products ───────── */
type ProductForm = Omit<Product, 'id' | 'position' | 'image'> & { id?: string; image: string | null; removeImage?: boolean };
const blankProduct = (): ProductForm => ({ tebex_package_id: '', name_en: '', name_ar: '', desc_en: '', desc_ar: '', image: null, category: 'business', badge_en: '', badge_ar: '', visible: true });

function Products({ snap, isAr, pkgById, currency, apply }: Ctx) {
  const [form, setForm] = useState<ProductForm | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<ProductForm>) => setForm((f) => (f ? { ...f, ...p } : f));
  const used = new Set(snap.products.map((p) => p.tebex_package_id));

  async function save() {
    if (!form) return;
    setBusy(true);
    const r = await send('/api/admin/store/products', form.id ? 'PATCH' : 'POST', form, file);
    setBusy(false);
    if (apply(r, isAr ? 'تم الحفظ — ظاهر في المتجر.' : 'Saved — it’s live in the store.')) { setForm(null); setFile(null); }
  }
  async function remove(p: Product) {
    if (!confirm(isAr ? 'إزالة المنتج من الموقع؟ (لن يُحذف من Tebex)' : 'Remove this product from the website? (It stays in Tebex.)')) return;
    apply(await api('/api/admin/store/products?id=' + p.id, { method: 'DELETE' }), isAr ? 'تمت الإزالة.' : 'Removed.');
  }
  async function move(i: number, d: -1 | 1) {
    const list = [...snap.products];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    apply(await send('/api/admin/store/products', 'PATCH', { order: list.map((p) => p.id) }));
  }

  return (
    <div>
      {!form && (
        <button onClick={() => { setForm(blankProduct()); setFile(null); }} disabled={!snap.tebex.packages.length} className="btn btn-primary mb-5">
          <Plus className="h-4 w-4" /> {isAr ? 'منتج جديد' : 'New product'}
        </button>
      )}
      {!snap.tebex.packages.length && !form && (
        <p className="mb-5 text-sm text-amber-300">{isAr ? 'اربط Tebex أولًا (تبويب ربط Tebex) لاختيار المنتجات.' : 'Connect Tebex first (Tebex connection tab) to pick products.'}</p>
      )}

      {form && (
        <div className="card mb-6 grid gap-5 border-brand/30 p-5 sm:p-6 lg:grid-cols-[280px_1fr]">
          <ImagePicker current={form.removeImage ? null : form.image} file={file} onFile={setFile} onRemove={() => set({ removeImage: true })} isAr={isAr} />
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'منتج Tebex (السعر والتسليم)' : 'Tebex package (price & delivery)'}</span>
              <select
                className="field mt-1 text-sm"
                value={form.tebex_package_id}
                onChange={(e) => {
                  const pkg = pkgById.get(e.target.value);
                  set({ tebex_package_id: e.target.value, ...(!form.name_en && pkg ? { name_en: pkg.name } : {}), ...(!form.image && !file && pkg?.image ? { image: pkg.image } : {}) });
                }}
              >
                <option value="">{isAr ? '— اختر —' : '— choose —'}</option>
                {snap.tebex.packages.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} · {money(p.price, p.currency)}{p.category ? ` · ${p.category}` : ''}{used.has(String(p.id)) && String(p.id) !== form.tebex_package_id ? (isAr ? ' (مضاف)' : ' (already added)') : ''}
                  </option>
                ))}
              </select>
            </label>
            <BiInput label={isAr ? 'الاسم' : 'Name'} en={form.name_en} ar={form.name_ar} onEn={(v) => set({ name_en: v })} onAr={(v) => set({ name_ar: v })} max={120} />
            <BiInput label={isAr ? 'الوصف' : 'Description'} textarea rows={3} en={form.desc_en} ar={form.desc_ar} onEn={(v) => set({ desc_en: v })} onAr={(v) => set({ desc_ar: v })} max={1000} />
            <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'القسم' : 'Category'}</span>
                <select className="field mt-1 text-sm" value={form.category} onChange={(e) => set({ category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{isAr ? c.ar : c.en}</option>)}
                </select>
              </label>
              <BiInput label={isAr ? 'شارة (اختياري)' : 'Badge (optional)'} en={form.badge_en} ar={form.badge_ar} onEn={(v) => set({ badge_en: v })} onAr={(v) => set({ badge_ar: v })} max={30} placeholderEn="Popular / New" placeholderAr="الأكثر طلبًا / جديد" />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/75">
              <input type="checkbox" className="h-4 w-4 accent-brand" checked={form.visible} onChange={(e) => set({ visible: e.target.checked })} />
              {isAr ? 'ظاهر في المتجر' : 'Visible in the store'}
            </label>
            <div className="flex gap-2">
              <button onClick={save} disabled={busy} className="btn btn-primary"><Save className="h-4 w-4" /> {busy ? '…' : isAr ? 'حفظ' : 'Save'}</button>
              <button onClick={() => { setForm(null); setFile(null); }} className="btn btn-ghost"><X className="h-4 w-4" /> {isAr ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {snap.products.length === 0 ? (
        <div className="card p-10 text-center text-white/55">
          {isAr ? 'لا توجد منتجات بعد — المتجر القديم (النموذج) يظهر حتى تضيف أول منتج.' : 'No products yet — the old shop (with the form) shows until you add the first one.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {snap.products.map((p, i) => {
            const pkg = pkgById.get(p.tebex_package_id);
            return (
              <li key={p.id} className={clsx('card flex flex-wrap items-center gap-4 p-3', !p.visible && 'opacity-60')}>
                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-ink">
                  {p.image && <Image src={p.image} alt="" fill sizes="96px" unoptimized={p.image.startsWith('http')} className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{isAr ? p.name_ar : p.name_en} {!p.visible && <EyeOff className="inline h-4 w-4 text-white/40" />}</p>
                  <p className="text-xs text-white/45">
                    {pkg ? <span dir="ltr">{money(pkg.price, currency)} · Tebex #{p.tebex_package_id}</span> : (
                      <span className="text-amber-300"><AlertTriangle className="inline h-3.5 w-3.5" /> {isAr ? 'المنتج غير موجود في Tebex — مخفي من المتجر' : 'Package not found in Tebex — hidden from the store'}</span>
                    )}
                  </p>
                </div>
                <RowActions
                  isAr={isAr}
                  onEdit={() => { setForm({ ...p, removeImage: false }); setFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  onDelete={() => remove(p)}
                  extra={<>
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="btn btn-ghost h-9 w-9 p-0"><ArrowUp className="h-4 w-4" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === snap.products.length - 1} className="btn btn-ghost h-9 w-9 p-0"><ArrowDown className="h-4 w-4" /></button>
                  </>}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ───────── Bundles ───────── */
type BundleForm = Omit<Bundle, 'id' | 'coupon_code'> & { id?: string; removeImage?: boolean };
const blankBundle = (): BundleForm => ({ name_en: '', name_ar: '', desc_en: '', desc_ar: '', image: null, product_ids: [], discount_percent: 10, visible: true });

function Bundles({ snap, isAr, pkgById, currency, apply }: Ctx) {
  const [form, setForm] = useState<BundleForm | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<BundleForm>) => setForm((f) => (f ? { ...f, ...p } : f));
  const priceOf = (ids: string[]) => ids.reduce((s, id) => s + (pkgById.get(snap.products.find((p) => p.id === id)?.tebex_package_id ?? '')?.price ?? 0), 0);

  async function save() {
    if (!form) return;
    setBusy(true);
    const r = await send('/api/admin/store/bundles', form.id ? 'PATCH' : 'POST', form, file);
    setBusy(false);
    if (apply(r, isAr ? 'تم حفظ الباقة.' : 'Bundle saved.')) { setForm(null); setFile(null); }
  }
  async function remove(b: Bundle) {
    if (!confirm(isAr ? 'حذف هذه الباقة؟' : 'Delete this bundle?')) return;
    apply(await api('/api/admin/store/bundles?id=' + b.id, { method: 'DELETE' }), isAr ? 'تم الحذف.' : 'Deleted.');
  }

  const total = form ? priceOf(form.product_ids) : 0;

  return (
    <div>
      {!form && (
        <button onClick={() => { setForm(blankBundle()); setFile(null); }} disabled={snap.products.length < 2} className="btn btn-primary mb-5">
          <Plus className="h-4 w-4" /> {isAr ? 'باقة جديدة' : 'New bundle'}
        </button>
      )}
      {form && (
        <div className="card mb-6 grid gap-5 border-brand/30 p-5 sm:p-6 lg:grid-cols-[280px_1fr]">
          <ImagePicker current={form.removeImage ? null : form.image} file={file} onFile={setFile} onRemove={() => set({ removeImage: true })} isAr={isAr} />
          <div className="space-y-4">
            <BiInput label={isAr ? 'اسم الباقة' : 'Bundle name'} en={form.name_en} ar={form.name_ar} onEn={(v) => set({ name_en: v })} onAr={(v) => set({ name_ar: v })} max={120} />
            <BiInput label={isAr ? 'الوصف' : 'Description'} textarea rows={2} en={form.desc_en} ar={form.desc_ar} onEn={(v) => set({ desc_en: v })} onAr={(v) => set({ desc_ar: v })} max={1000} />
            <ProductChecklist products={snap.products} selected={form.product_ids} onChange={(ids) => set({ product_ids: ids })} isAr={isAr} pkgById={pkgById} currency={currency} />
            <div className="flex flex-wrap items-end gap-4">
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'خصم الباقة %' : 'Bundle discount %'}</span>
                <input type="number" dir="ltr" min={0} max={90} className="field mt-1 w-32" value={form.discount_percent} onChange={(e) => set({ discount_percent: Number(e.target.value) })} />
              </label>
              <p className="pb-2 text-sm" dir="ltr">
                {form.discount_percent > 0 && <span className="me-2 text-white/40 line-through">{money(total, currency)}</span>}
                <span className="font-bold text-brand">{money(total * (1 - form.discount_percent / 100), currency)}</span>
              </p>
            </div>
            {form.discount_percent > 0 && !snap.tebex.coupons && (
              <p className="text-sm text-amber-300"><AlertTriangle className="inline h-4 w-4" /> {isAr ? 'الخصم يحتاج TEBEX_PRIVATE_KEY.' : 'Discounts need TEBEX_PRIVATE_KEY.'}</p>
            )}
            <label className="flex items-center gap-2 text-sm text-white/75">
              <input type="checkbox" className="h-4 w-4 accent-brand" checked={form.visible} onChange={(e) => set({ visible: e.target.checked })} />
              {isAr ? 'ظاهرة في المتجر' : 'Visible in the store'}
            </label>
            <div className="flex gap-2">
              <button onClick={save} disabled={busy} className="btn btn-primary"><Save className="h-4 w-4" /> {busy ? '…' : isAr ? 'حفظ' : 'Save'}</button>
              <button onClick={() => { setForm(null); setFile(null); }} className="btn btn-ghost"><X className="h-4 w-4" /> {isAr ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {snap.bundles.length === 0 ? (
        <div className="card p-10 text-center text-white/55">{isAr ? 'لا توجد باقات بعد.' : 'No bundles yet.'}</div>
      ) : (
        <ul className="space-y-2">
          {snap.bundles.map((b) => {
            const price = priceOf(b.product_ids);
            return (
              <li key={b.id} className={clsx('card flex flex-wrap items-center gap-4 p-3', !b.visible && 'opacity-60')}>
                <div className="relative grid h-14 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink">
                  {b.image ? <Image src={b.image} alt="" fill sizes="96px" unoptimized={b.image.startsWith('http')} className="object-cover" /> : <Package className="h-6 w-6 text-brand/50" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{isAr ? b.name_ar : b.name_en} {b.discount_percent > 0 && <span className="ms-1 rounded bg-brand px-1.5 text-xs font-bold text-ink">-{b.discount_percent}%</span>}</p>
                  <p className="text-xs text-white/45" dir="ltr">{b.product_ids.length} {isAr ? 'منتجات' : 'products'} · {money(price * (1 - b.discount_percent / 100), currency)}</p>
                </div>
                <RowActions isAr={isAr} onEdit={() => { setForm({ ...b, removeImage: false }); setFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={() => remove(b)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ───────── Sales ───────── */
type SaleForm = Omit<Sale, 'id' | 'coupon_code'> & { id?: string };
const blankSale = (): SaleForm => {
  const end = new Date(Date.now() + 3 * 86400_000);
  return { name_en: '', name_ar: '', discount_percent: 20, product_ids: [], starts_at: new Date().toISOString(), ends_at: end.toISOString(), show_on_home: true };
};

function saleState(s: Sale, now: number) {
  if (new Date(s.starts_at).getTime() > now) return 'scheduled';
  if (s.ends_at && new Date(s.ends_at).getTime() <= now) return 'ended';
  return 'active';
}

function Sales({ snap, isAr, pkgById, currency, apply }: Ctx) {
  const [form, setForm] = useState<SaleForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), []);
  const set = (p: Partial<SaleForm>) => setForm((f) => (f ? { ...f, ...p } : f));

  async function save() {
    if (!form) return;
    setBusy(true);
    const r = await send('/api/admin/store/sales', form.id ? 'PATCH' : 'POST', form);
    setBusy(false);
    if (apply(r, isAr ? 'تم حفظ العرض وإنشاء الخصم في Tebex.' : 'Sale saved and the discount created in Tebex.')) setForm(null);
  }
  async function remove(s: Sale) {
    if (!confirm(isAr ? 'إنهاء وحذف هذا العرض؟' : 'End and delete this sale?')) return;
    apply(await api('/api/admin/store/sales?id=' + s.id, { method: 'DELETE' }), isAr ? 'تم حذف العرض.' : 'Sale deleted.');
  }

  const STATE = {
    active: { en: 'Live', ar: 'فعّال', cls: 'bg-brand/15 text-brand ring-brand/30' },
    scheduled: { en: 'Scheduled', ar: 'مجدول', cls: 'bg-amber-400/10 text-amber-300 ring-amber-400/30' },
    ended: { en: 'Ended', ar: 'منتهي', cls: 'bg-white/5 text-white/50 ring-white/15' },
  };

  return (
    <div>
      {!snap.tebex.coupons && (
        <p className="card mb-5 border-amber-400/30 p-4 text-sm text-amber-300">
          <AlertTriangle className="me-1 inline h-4 w-4" />
          {isAr ? 'العروض تحتاج TEBEX_PRIVATE_KEY لإنشاء خصم حقيقي في Tebex.' : 'Sales need TEBEX_PRIVATE_KEY to create a real discount in Tebex.'}
        </p>
      )}
      {!form && (
        <button onClick={() => setForm(blankSale())} disabled={!snap.products.length || !snap.tebex.coupons} className="btn btn-primary mb-5">
          <Plus className="h-4 w-4" /> {isAr ? 'عرض جديد' : 'New sale'}
        </button>
      )}
      {form && (
        <div className="card mb-6 space-y-4 border-brand/30 p-5 sm:p-6">
          <BiInput label={isAr ? 'اسم العرض' : 'Sale name'} en={form.name_en} ar={form.name_ar} onEn={(v) => set({ name_en: v })} onAr={(v) => set({ name_ar: v })} max={120} placeholderEn="Summer Sale" placeholderAr="عروض الصيف" />
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'الخصم %' : 'Discount %'}</span>
              <input type="number" dir="ltr" min={1} max={90} className="field mt-1" value={form.discount_percent} onChange={(e) => set({ discount_percent: Number(e.target.value) })} />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'يبدأ' : 'Starts'}</span>
              <input type="datetime-local" dir="ltr" className="field mt-1 [color-scheme:dark]" value={toLocalInput(form.starts_at)} onChange={(e) => set({ starts_at: fromLocalInput(e.target.value) ?? new Date().toISOString() })} />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'ينتهي (اختياري)' : 'Ends (optional)'}</span>
              <input type="datetime-local" dir="ltr" className="field mt-1 [color-scheme:dark]" value={toLocalInput(form.ends_at)} onChange={(e) => set({ ends_at: fromLocalInput(e.target.value) })} />
            </label>
          </div>
          <ProductChecklist products={snap.products} selected={form.product_ids} onChange={(ids) => set({ product_ids: ids })} isAr={isAr} pkgById={pkgById} currency={currency} />
          <label className="flex items-center gap-2 text-sm text-white/75">
            <input type="checkbox" className="h-4 w-4 accent-brand" checked={form.show_on_home} onChange={(e) => set({ show_on_home: e.target.checked })} />
            <Home className="h-4 w-4 text-brand" /> {isAr ? 'إظهار العرض في الصفحة الرئيسية' : 'Show this sale on the home page'}
          </label>
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="btn btn-primary"><Save className="h-4 w-4" /> {busy ? '…' : isAr ? 'حفظ ونشر' : 'Save & publish'}</button>
            <button onClick={() => setForm(null)} className="btn btn-ghost"><X className="h-4 w-4" /> {isAr ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </div>
      )}

      {snap.sales.length === 0 ? (
        <div className="card p-10 text-center text-white/55">{isAr ? 'لا توجد عروض.' : 'No sales yet.'}</div>
      ) : (
        <ul className="space-y-2">
          {snap.sales.map((s) => {
            const st = now ? STATE[saleState(s, now)] : null;
            return (
              <li key={s.id} className="card flex flex-wrap items-center gap-4 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/15 text-lg font-black text-brand">{s.discount_percent}%</span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {isAr ? s.name_ar : s.name_en}
                    {st && <span className={clsx('rounded-md px-2 py-0.5 text-xs ring-1', st.cls)}>{isAr ? st.ar : st.en}</span>}
                    {s.show_on_home && <Home className="h-4 w-4 text-brand" />}
                  </p>
                  <p className="text-xs text-white/45" dir="ltr">
                    {s.product_ids.length} {isAr ? 'منتجات' : 'products'} · {new Date(s.starts_at).toLocaleString()} → {s.ends_at ? new Date(s.ends_at).toLocaleString() : '∞'}
                  </p>
                </div>
                <RowActions isAr={isAr} onEdit={() => { setForm(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={() => remove(s)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ───────── Connection ───────── */
function Connection({ snap, isAr }: Ctx) {
  const t = snap.tebex;
  const Row = ({ ok, title, detail }: { ok: boolean; title: string; detail: React.ReactNode }) => (
    <li className="flex gap-3 rounded-xl border border-white/[0.06] p-4">
      {ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />}
      <div><p className="font-semibold">{title}</p><div className="mt-0.5 text-sm text-white/60">{detail}</div></div>
    </li>
  );
  const code = (s: string) => <code className="rounded bg-white/10 px-1.5 py-0.5 text-brand">{s}</code>;
  return (
    <div className="card max-w-3xl p-5 sm:p-6">
      <ul className="space-y-3">
        <Row
          ok={t.configured && !t.error && !!t.store}
          title={isAr ? 'المتجر (Headless API)' : 'Store (Headless API)'}
          detail={
            t.error ? <span className="text-red-300">{t.error}</span>
            : t.store ? <>{isAr ? 'متصل بـ' : 'Connected to'} <b className="text-white">{t.store.name}</b> · {t.store.currency} · {t.packages.length} {isAr ? 'منتج في Tebex' : 'Tebex packages'}</>
            : <>{isAr ? 'أضف' : 'Add'} {code('TEBEX_PUBLIC_TOKEN')} — Tebex → Integrations → Headless API</>
          }
        />
        <Row
          ok={t.coupons}
          title={isAr ? 'الخصومات (للعروض والباقات)' : 'Discounts (sales & bundles)'}
          detail={t.coupons ? (isAr ? 'المفتاح موجود — يمكن إنشاء خصومات.' : 'Key set — discounts can be created.') : <>{isAr ? 'أضف' : 'Add'} {code('TEBEX_PRIVATE_KEY')} — Tebex → Game servers → {isAr ? 'المفتاح السري' : 'secret key'}</>}
        />
        {t.store && (
          <Row
            ok
            title={isAr ? 'تسجيل الدخول عند الدفع' : 'Login at checkout'}
            detail={t.store.usernames
              ? (isAr ? 'يسجل المشتري دخوله بحساب FiveM (cfx.re) قبل الدفع حتى يعرف Tebex لمن يسلّم.' : 'Buyers log in with their FiveM (cfx.re) account before paying, so Tebex knows who to deliver to.')
              : (isAr ? 'لا يحتاج المتجر تسجيل دخول.' : 'This store doesn’t need a login.')}
          />
        )}
      </ul>
      <p className="mt-5 text-sm text-white/50">
        {isAr
          ? 'المنتجات الجديدة، أوامر التسليم داخل اللعبة ورتب الديسكورد تُعدّ داخل لوحة Tebex. بعدها اختر المنتج هنا وأضف صورته واسمه.'
          : 'New products, in-game delivery commands and Discord roles are set up in the Tebex panel. Then pick the package here and add its picture and name.'}
      </p>
    </div>
  );
}
