'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Trash2, Upload, Save, ImagePlus, Download, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { useLang } from '@/lib/providers';
import { api, PageHeader, SetupNeeded, BiInput, Notice } from './ui';

type Item = { id?: string; src: string; caption: { en: string; ar: string } };
type Data = { items: Item[]; source: 'database' | 'default' };

export default function GalleryEditor() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [data, setData] = useState<Data | null>(null);
  const [setup, setSetup] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // upload form
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [capEn, setCapEn] = useState('');
  const [capAr, setCapAr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function apply(r: { ok: boolean; data: any; error?: string }, okText?: string) {
    if (r.ok) {
      setData(r.data);
      if (okText) setMsg({ kind: 'ok', text: okText });
    } else if (r.error === 'setup-needed') setSetup(true);
    else setMsg({ kind: 'err', text: r.error || 'Error' });
  }

  useEffect(() => {
    api<Data>('/api/admin/gallery').then((r) => apply(r));
  }, []);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('caption_en', capEn);
    fd.append('caption_ar', capAr);
    const r = await api('/api/admin/gallery', { method: 'POST', body: fd });
    setBusy(false);
    apply(r, isAr ? 'تمت إضافة الصورة.' : 'Image added.');
    if (r.ok) {
      setFile(null);
      setCapEn('');
      setCapAr('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function importDefaults() {
    setBusy(true);
    apply(await api('/api/admin/gallery', { method: 'POST', body: JSON.stringify({ action: 'import' }) }), isAr ? 'تم استيراد الصور.' : 'Images imported.');
    setBusy(false);
  }

  async function move(index: number, dir: -1 | 1) {
    if (!data) return;
    const items = [...data.items];
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    [items[index], items[j]] = [items[j], items[index]];
    setData({ ...data, items }); // instant feedback
    apply(await api('/api/admin/gallery', { method: 'PATCH', body: JSON.stringify({ order: items.map((x) => x.id) }) }));
  }

  async function remove(item: Item) {
    if (!confirm(isAr ? 'حذف هذه الصورة نهائيًا؟' : 'Delete this image permanently?')) return;
    apply(await api(`/api/admin/gallery?id=${item.id}`, { method: 'DELETE' }), isAr ? 'تم الحذف.' : 'Deleted.');
  }

  async function saveCaption(item: Item, en: string, ar: string) {
    apply(
      await api('/api/admin/gallery', { method: 'PATCH', body: JSON.stringify({ id: item.id, caption_en: en, caption_ar: ar }) }),
      isAr ? 'تم حفظ الوصف.' : 'Caption saved.'
    );
  }

  if (setup) return <SetupNeeded isAr={isAr} />;
  if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />;
  if (data.source === 'default') return <SetupNeeded isAr={isAr} />;

  return (
    <div>
      <PageHeader
        title={isAr ? 'معرض الصور' : 'Gallery'}
        subtitle={
          isAr
            ? 'الصور التي تظهر في قسم "من داخل المدينة" في الصفحة الرئيسية. أول صورة تظهر بحجم كبير.'
            : 'Images shown in the “Inside the City” section on the home page. The first image is shown large.'
        }
      >
        <a href="/#gallery" target="_blank" className="btn btn-ghost">
          <ExternalLink className="h-4 w-4" /> {isAr ? 'عرض الموقع' : 'View site'}
        </a>
      </PageHeader>

      {/* Upload */}
      <div className="card mb-8 grid gap-5 p-5 sm:p-6 lg:grid-cols-[260px_1fr]">
        <label
          className={clsx(
            'relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed text-center transition',
            preview ? 'border-brand/40' : 'border-white/15 hover:border-brand/50'
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="px-4 text-sm text-white/50">
              <ImagePlus className="mx-auto mb-2 h-8 w-8 text-brand" />
              {isAr ? 'اضغط أو اسحب صورة هنا' : 'Click or drop an image here'}
              <span className="mt-1 block text-xs text-white/35">JPG · PNG · WEBP · GIF — {isAr ? 'حتى 5 ميغابايت' : 'max 5 MB'}</span>
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="flex flex-col gap-4">
          <BiInput label={isAr ? 'الوصف' : 'Caption'} en={capEn} ar={capAr} onEn={setCapEn} onAr={setCapAr} max={120} placeholderEn="e.g. Villas" placeholderAr="مثال: الفلل" />
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <button onClick={upload} disabled={!file || busy} className="btn btn-primary">
              <Upload className="h-4 w-4" /> {busy ? '…' : isAr ? 'رفع الصورة' : 'Upload image'}
            </button>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
          </div>
        </div>
      </div>

      {/* Current images */}
      {data.items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-white/60">
            {isAr ? 'المعرض فارغ، لذلك القسم مخفي في الصفحة الرئيسية.' : 'The gallery is empty, so the section is hidden on the home page.'}
          </p>
          <button onClick={importDefaults} disabled={busy} className="btn btn-outline mt-5">
            <Download className="h-4 w-4" /> {isAr ? 'استيراد الصور الحالية' : 'Import the current images'}
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item, i) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={i}
              total={data.items.length}
              isAr={isAr}
              onMove={(d) => move(i, d)}
              onRemove={() => remove(item)}
              onSave={(en, ar) => saveCaption(item, en, ar)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryCard({
  item, index, total, isAr, onMove, onRemove, onSave,
}: {
  item: Item; index: number; total: number; isAr: boolean;
  onMove: (d: -1 | 1) => void; onRemove: () => void; onSave: (en: string, ar: string) => void;
}) {
  const [en, setEn] = useState(item.caption.en);
  const [ar, setAr] = useState(item.caption.ar);
  const dirty = en !== item.caption.en || ar !== item.caption.ar;
  // arrows follow reading direction
  const Prev = isAr ? ArrowRight : ArrowLeft;
  const Next = isAr ? ArrowLeft : ArrowRight;

  return (
    <li className="card overflow-hidden">
      <div className="relative aspect-video">
        <Image src={item.src} alt={en} fill sizes="400px" unoptimized={item.src.startsWith('http')} className="object-cover" />
        <span className="absolute start-2 top-2 rounded-md bg-ink/80 px-2 py-0.5 text-xs font-bold">
          #{index + 1}
          {index === 0 && <span className="ms-1 text-brand">{isAr ? '· كبيرة' : '· large'}</span>}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <BiInput label={isAr ? 'الوصف' : 'Caption'} en={en} ar={ar} onEn={setEn} onAr={setAr} max={120} />
        <div className="flex items-center gap-2">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="btn btn-ghost h-9 w-9 p-0" title={isAr ? 'تقديم' : 'Move earlier'}>
            <Prev className="h-4 w-4" />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="btn btn-ghost h-9 w-9 p-0" title={isAr ? 'تأخير' : 'Move later'}>
            <Next className="h-4 w-4" />
          </button>
          <button onClick={() => onSave(en, ar)} disabled={!dirty} className="btn btn-primary ms-auto h-9 px-3">
            <Save className="h-4 w-4" /> {isAr ? 'حفظ' : 'Save'}
          </button>
          <button onClick={onRemove} className="btn h-9 w-9 border border-red-400/40 bg-red-400/10 p-0 text-red-300 hover:bg-red-400/20" title={isAr ? 'حذف' : 'Delete'}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
