'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Download, ExternalLink } from 'lucide-react';
import { useLang } from '@/lib/providers';
import { api, PageHeader, SetupNeeded, BiInput, Notice } from './ui';

type Bi = { en: string; ar: string };
type Item = { id?: string; date: string; tag: Bi; title: Bi; body: Bi };
type Data = { items: Item[]; source: 'database' | 'default' };

/** Today in the browser's own timezone, as YYYY-MM-DD */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const blank = (): Item => ({ date: today(), tag: { en: 'Update', ar: 'تحديث' }, title: { en: '', ar: '' }, body: { en: '', ar: '' } });

export default function NewsEditor() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [data, setData] = useState<Data | null>(null);
  const [setup, setSetup] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function apply(r: { ok: boolean; data: any; error?: string }, okText?: string) {
    if (r.ok) {
      setData(r.data);
      if (okText) setMsg({ kind: 'ok', text: okText });
      return true;
    }
    if (r.error === 'setup-needed') setSetup(true);
    else setMsg({ kind: 'err', text: r.error || 'Error' });
    return false;
  }

  useEffect(() => {
    api<Data>('/api/admin/news').then((r) => apply(r));
  }, []);

  async function save() {
    if (!editing) return;
    setBusy(true);
    setMsg(null);
    const payload = {
      id: editing.id,
      date: editing.date,
      tag_en: editing.tag.en, tag_ar: editing.tag.ar,
      title_en: editing.title.en, title_ar: editing.title.ar,
      body_en: editing.body.en, body_ar: editing.body.ar,
    };
    const r = await api('/api/admin/news', { method: editing.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
    setBusy(false);
    if (apply(r, isAr ? 'تم الحفظ — يظهر الآن في الموقع.' : 'Saved — it’s live on the site.')) setEditing(null);
  }

  async function remove(item: Item) {
    if (!confirm(isAr ? 'حذف هذا الخبر؟' : 'Delete this update?')) return;
    apply(await api(`/api/admin/news?id=${item.id}`, { method: 'DELETE' }), isAr ? 'تم الحذف.' : 'Deleted.');
  }

  async function importDefaults() {
    setBusy(true);
    apply(await api('/api/admin/news', { method: 'POST', body: JSON.stringify({ action: 'import' }) }), isAr ? 'تم الاستيراد.' : 'Imported.');
    setBusy(false);
  }

  if (setup) return <SetupNeeded isAr={isAr} />;
  if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />;
  if (data.source === 'default') return <SetupNeeded isAr={isAr} />;

  const set = (patch: Partial<Item>) => setEditing((e) => (e ? { ...e, ...patch } : e));

  return (
    <div>
      <PageHeader
        title={isAr ? 'الأخبار والتحديثات' : 'News & Updates'}
        subtitle={isAr ? 'آخر 3 أخبار تظهر في الصفحة الرئيسية، وكلها في صفحة الأخبار.' : 'The latest 3 show on the home page; all of them on the News page.'}
      >
        <a href="/news" target="_blank" className="btn btn-ghost">
          <ExternalLink className="h-4 w-4" /> {isAr ? 'صفحة الأخبار' : 'News page'}
        </a>
        {!editing && (
          <button onClick={() => { setEditing(blank()); setMsg(null); }} className="btn btn-primary">
            <Plus className="h-4 w-4" /> {isAr ? 'خبر جديد' : 'New update'}
          </button>
        )}
      </PageHeader>

      {msg && <div className="mb-4"><Notice kind={msg.kind}>{msg.text}</Notice></div>}

      {editing && (
        <div className="card mb-8 space-y-4 border-brand/30 p-5 sm:p-6">
          <h2 className="text-lg font-bold">{editing.id ? (isAr ? 'تعديل الخبر' : 'Edit update') : isAr ? 'خبر جديد' : 'New update'}</h2>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'التاريخ' : 'Date'}</span>
              <input type="date" dir="ltr" className="field mt-1 text-sm [color-scheme:dark]" value={editing.date} onChange={(e) => set({ date: e.target.value })} />
            </label>
            <BiInput
              label={isAr ? 'الوسم' : 'Tag'}
              en={editing.tag.en} ar={editing.tag.ar} max={40}
              onEn={(v) => set({ tag: { ...editing.tag, en: v } })} onAr={(v) => set({ tag: { ...editing.tag, ar: v } })}
              placeholderEn="Update / Event / Season" placeholderAr="تحديث / فعالية / موسم"
            />
          </div>
          <BiInput
            label={isAr ? 'العنوان' : 'Title'}
            en={editing.title.en} ar={editing.title.ar} max={160}
            onEn={(v) => set({ title: { ...editing.title, en: v } })} onAr={(v) => set({ title: { ...editing.title, ar: v } })}
          />
          <BiInput
            label={isAr ? 'التفاصيل' : 'Details'} textarea rows={5}
            en={editing.body.en} ar={editing.body.ar} max={2000}
            onEn={(v) => set({ body: { ...editing.body, en: v } })} onAr={(v) => set({ body: { ...editing.body, ar: v } })}
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={save} disabled={busy} className="btn btn-primary">
              <Save className="h-4 w-4" /> {busy ? '…' : isAr ? 'حفظ ونشر' : 'Save & publish'}
            </button>
            <button onClick={() => setEditing(null)} className="btn btn-ghost">
              <X className="h-4 w-4" /> {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {data.items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-white/60">{isAr ? 'لا توجد أخبار بعد.' : 'No updates yet.'}</p>
          <button onClick={importDefaults} disabled={busy} className="btn btn-outline mt-5">
            <Download className="h-4 w-4" /> {isAr ? 'استيراد الخبر الحالي' : 'Import the current update'}
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.items.map((n) => (
            <li key={n.id} className="card flex flex-wrap items-start gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="pill">{isAr ? n.tag.ar : n.tag.en}</span>
                  <span className="text-white/45" dir="ltr">{n.date}</span>
                </div>
                <h3 className="mt-2 font-bold">{isAr ? n.title.ar : n.title.en}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/60">{isAr ? n.body.ar : n.body.en}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(n); setMsg(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn btn-ghost h-9 px-3">
                  <Pencil className="h-4 w-4" /> {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button onClick={() => remove(n)} className="btn h-9 w-9 border border-red-400/40 bg-red-400/10 p-0 text-red-300 hover:bg-red-400/20" title={isAr ? 'حذف' : 'Delete'}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
