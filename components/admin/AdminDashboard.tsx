'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  Check, X, Archive, RotateCcw, Search, RefreshCw, Inbox, ExternalLink, Database, Copy, ShieldCheck,
} from 'lucide-react';
import { useLang } from '@/lib/providers';

type Bi = { en: string; ar: string };
export type Labels = { fields: Record<string, Bi>; categories: Record<string, Bi> };

type Status = 'pending' | 'accepted' | 'rejected' | 'closed';
type Kind = 'interview' | 'job' | 'cityhall' | 'ticket';
type Item = {
  id: string;
  kind: Kind;
  category: string;
  discord_id: string;
  discord_name: string;
  avatar: string | null;
  answers: Record<string, unknown>;
  status: Status;
  note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

const STATUS_TABS: { key: Status | 'all'; en: string; ar: string }[] = [
  { key: 'pending', en: 'Pending', ar: 'قيد المراجعة' },
  { key: 'accepted', en: 'Accepted', ar: 'مقبول' },
  { key: 'rejected', en: 'Rejected', ar: 'مرفوض' },
  { key: 'closed', en: 'Closed', ar: 'مغلق' },
  { key: 'all', en: 'All', ar: 'الكل' },
];
const KIND_TABS: { key: Kind | 'all'; en: string; ar: string }[] = [
  { key: 'all', en: 'All types', ar: 'كل الأنواع' },
  { key: 'interview', en: 'Interviews', ar: 'المقابلات' },
  { key: 'job', en: 'Jobs', ar: 'الوظائف' },
  { key: 'ticket', en: 'Tickets', ar: 'التذاكر' },
  { key: 'cityhall', en: 'City Hall', ar: 'البلدية' },
];
const STATUS_STYLE: Record<Status, string> = {
  pending: 'bg-amber-400/10 text-amber-300 ring-amber-400/30',
  accepted: 'bg-brand/10 text-brand ring-brand/30',
  rejected: 'bg-red-400/10 text-red-300 ring-red-400/30',
  closed: 'bg-white/5 text-white/60 ring-white/15',
};

function timeAgo(iso: string, isAr: boolean) {
  const sec = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const steps: [number, string, string][] = [
    [60, 's', 'ث'],
    [3600, 'm', 'د'],
    [86400, 'h', 'س'],
    [2592000, 'd', 'ي'],
    [31536000, 'mo', 'ش'],
    [Infinity, 'y', 'سنة'],
  ];
  const div = [1, 60, 3600, 86400, 2592000, 31536000];
  const i = steps.findIndex(([limit]) => sec < limit);
  const v = Math.floor(sec / div[i]);
  const unit = isAr ? steps[i][2] : steps[i][1];
  return isAr ? `منذ ${v}${unit}` : `${v}${unit} ago`;
}

export default function AdminDashboard({ labels, configured }: { labels: Labels; configured: boolean }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const tr = (b?: Bi, fallback = '') => (b ? (isAr ? b.ar : b.en) : fallback);

  const [status, setStatus] = useState<Status | 'all'>('pending');
  const [kind, setKind] = useState<Kind | 'all'>('all');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(configured ? null : 'not-configured');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (kind !== 'all') params.set('kind', kind);
    if (q.trim()) params.set('q', q.trim());
    const r = await fetch(`/api/admin/submissions?${params}`).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : { error: 'network' };
    if (!r || !r.ok) setError(j.error || 'error');
    else {
      setError(null);
      setItems(j.items ?? []);
      setPending(j.pending ?? 0);
    }
    setLoading(false);
  }, [configured, status, kind, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const selected = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId]);

  if (error === 'not-configured' || error === 'table-missing') return <SetupNotice reason={error} isAr={isAr} />;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="pill mb-3">
            <ShieldCheck className="h-3.5 w-3.5" /> {isAr ? 'الإدارة' : 'Staff'}
          </span>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{isAr ? 'لوحة الإدارة' : 'Staff Dashboard'}</h1>
          <p className="mt-1 text-white/55">
            {isAr ? `${pending} طلب بانتظار المراجعة` : `${pending} waiting for review`}
          </p>
        </div>
        <button onClick={load} className="btn btn-ghost" disabled={loading}>
          <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} /> {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
          <div className="flex w-max gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatus(t.key)}
                className={clsx(
                  'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
                  status === t.key ? 'bg-brand text-ink' : 'text-white/65 hover:text-white'
                )}
              >
                {isAr ? t.ar : t.en}
                {t.key === 'pending' && pending > 0 && (
                  <span className={clsx('ms-1.5 rounded-full px-1.5 text-xs', status === 'pending' ? 'bg-ink/20' : 'bg-amber-400/20 text-amber-300')}>
                    {pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind | 'all')}
            className="field mt-0 w-auto py-2 text-sm"
            aria-label={isAr ? 'النوع' : 'Type'}
          >
            {KIND_TABS.map((k) => (
              <option key={k.key} value={k.key}>{isAr ? k.ar : k.en}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isAr ? 'اسم أو ID ديسكورد' : 'Name or Discord ID'}
              className="field mt-0 w-56 py-2 ps-9 text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-4 border-red-400/30 p-4 text-sm text-red-300">
          {isAr ? 'حدث خطأ: ' : 'Error: '}
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* List */}
        <div className="card overflow-hidden">
          {loading && items.length === 0 ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-white/50">
              <Inbox className="mx-auto h-10 w-10 text-white/25" />
              <p className="mt-3">{isAr ? 'لا توجد طلبات هنا.' : 'Nothing here.'}</p>
            </div>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-white/[0.06] overflow-y-auto">
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => setSelectedId(it.id)}
                    className={clsx(
                      'flex w-full items-center gap-3 p-3.5 text-start transition hover:bg-white/[0.04]',
                      selectedId === it.id && 'bg-brand/[0.07]'
                    )}
                  >
                    <AvatarImg src={it.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold">{it.discord_name}</span>
                        <span className="shrink-0 text-xs text-white/40">{timeAgo(it.created_at, isAr)}</span>
                      </div>
                      <div className="mt-0.5 truncate text-sm text-white/55">{tr(labels.categories[it.category], it.category)}</div>
                    </div>
                    <StatusBadge status={it.status} isAr={isAr} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {selected ? (
            <Detail
              key={selected.id}
              item={selected}
              labels={labels}
              isAr={isAr}
              onUpdated={(u) => {
                setItems((xs) => xs.map((x) => (x.id === u.id ? u : x)));
                setPending((p) => p + (u.status === 'pending' ? 1 : 0) - (selected.status === 'pending' ? 1 : 0));
              }}
            />
          ) : (
            <div className="card hidden p-12 text-center text-white/45 lg:block">
              {isAr ? 'اختر طلبًا لعرض التفاصيل.' : 'Select a submission to see the details.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AvatarImg({ src, size = 'h-10 w-10' }: { src: string | null; size?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src || '/logo.png'} alt="" className={clsx(size, 'shrink-0 rounded-xl bg-ink object-cover', !src && 'object-contain p-1.5')} />;
}

function StatusBadge({ status, isAr }: { status: Status; isAr: boolean }) {
  const t = STATUS_TABS.find((s) => s.key === status)!;
  return (
    <span className={clsx('shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ring-1', STATUS_STYLE[status])}>
      {isAr ? t.ar : t.en}
    </span>
  );
}

function Detail({
  item, labels, isAr, onUpdated,
}: { item: Item; labels: Labels; isAr: boolean; onUpdated: (i: Item) => void }) {
  const [note, setNote] = useState(item.note ?? '');
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState<Status | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const isDecision = item.kind === 'interview' || item.kind === 'job';
  const tr = (b?: Bi, f = '') => (b ? (isAr ? b.ar : b.en) : f);

  async function act(status: Status) {
    if (status === 'rejected' && item.kind === 'interview' && !confirm(isAr ? 'رفض المقابلة سيعطي اللاعب رتبة المرفوض. متابعة؟' : 'Rejecting gives the player the Rejected role. Continue?')) return;
    setBusy(status);
    setMsg(null);
    const r = await fetch(`/api/admin/submissions/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, notify }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(null);
    if (!r?.ok) return setMsg({ ok: false, text: j.error || 'Error' });
    onUpdated(j.item);
    const parts = [isAr ? 'تم الحفظ' : 'Saved'];
    if (j.roles === true) parts.push(isAr ? 'تم تحديث الرتب' : 'roles updated');
    if (j.roles === false) parts.push(isAr ? '⚠️ فشل تحديث الرتب (تحقق من صلاحيات البوت)' : '⚠️ role update failed (check bot permissions)');
    if (j.dm === true) parts.push(isAr ? 'تم إرسال رسالة خاصة' : 'DM sent');
    if (j.dm === false) parts.push(isAr ? '⚠️ تعذر إرسال رسالة (الخاص مغلق)' : '⚠️ DM failed (player has DMs closed)');
    setMsg({ ok: j.roles !== false, text: parts.join(' · ') });
  }

  const entries = Object.entries(item.answers ?? {}).filter(([, v]) => v !== '' && v !== null && v !== undefined);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <AvatarImg src={item.avatar} size="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold">{item.discord_name}</h2>
          <button
            onClick={() => navigator.clipboard?.writeText(item.discord_id)}
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/45 hover:text-white"
            title={isAr ? 'نسخ' : 'Copy'}
            dir="ltr"
          >
            {item.discord_id} <Copy className="h-3 w-3" />
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="pill">{tr(labels.categories[item.category], item.category)}</span>
            <StatusBadge status={item.status} isAr={isAr} />
          </div>
        </div>
        <a
          href={`https://discord.com/users/${item.discord_id}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost h-9 w-9 p-0"
          title="Discord"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <dl className="mt-6 max-h-[38vh] space-y-3 overflow-y-auto pe-1">
        {entries.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-white/[0.06] bg-ink/40 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">{tr(labels.fields[k], k)}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-white/85">
              {typeof v === 'boolean' ? (v ? '✓' : '✗') : String(v)}
            </dd>
          </div>
        ))}
      </dl>

      {item.reviewed_by && (
        <p className="mt-4 text-xs text-white/40">
          {isAr ? 'آخر مراجعة: ' : 'Last reviewed by '}
          {item.reviewed_by}
        </p>
      )}

      <div className="mt-5 border-t border-white/[0.06] pt-5">
        <label className="text-sm text-white/70" htmlFor="note">
          {isAr ? 'ملاحظة / سبب (تُرسل للاعب)' : 'Note / reason (sent to the player)'}
        </label>
        <textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="field resize-none text-sm" maxLength={500} />
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4 accent-brand" />
          {isAr ? 'إرسال رسالة خاصة للاعب في الديسكورد' : 'Send the player a Discord DM'}
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {isDecision ? (
            <>
              <button onClick={() => act('accepted')} disabled={!!busy} className="btn btn-primary">
                <Check className="h-4 w-4" /> {busy === 'accepted' ? '…' : isAr ? 'قبول' : 'Accept'}
              </button>
              <button
                onClick={() => act('rejected')}
                disabled={!!busy}
                className="btn border border-red-400/40 bg-red-400/10 text-red-300 hover:bg-red-400/20"
              >
                <X className="h-4 w-4" /> {busy === 'rejected' ? '…' : isAr ? 'رفض' : 'Reject'}
              </button>
            </>
          ) : (
            <button onClick={() => act('closed')} disabled={!!busy} className="btn btn-primary">
              <Archive className="h-4 w-4" /> {busy === 'closed' ? '…' : isAr ? 'إغلاق' : 'Close'}
            </button>
          )}
          {item.status !== 'pending' && (
            <button onClick={() => act('pending')} disabled={!!busy} className="btn btn-ghost">
              <RotateCcw className="h-4 w-4" /> {isAr ? 'إعادة فتح' : 'Reopen'}
            </button>
          )}
        </div>
        {item.kind === 'interview' && (
          <p className="mt-3 text-xs text-white/40">
            {isAr
              ? 'القبول يعطي رتبة Whitelist ويزيل رتبة المرفوض. الرفض يعطي رتبة المرفوض.'
              : 'Accept gives the Whitelist role and removes Rejected. Reject gives the Rejected role.'}
          </p>
        )}
        {msg && <p className={clsx('mt-3 text-sm', msg.ok ? 'text-brand' : 'text-amber-300')}>{msg.text}</p>}
      </div>
    </div>
  );
}

function SetupNotice({ reason, isAr }: { reason: string; isAr: boolean }) {
  return (
    <div className="card mx-auto max-w-2xl p-8">
      <Database className="h-10 w-10 text-brand" />
      <h1 className="mt-4 text-2xl font-extrabold">{isAr ? 'خطوة إعداد واحدة' : 'One setup step needed'}</h1>
      <p className="mt-2 text-white/65">
        {reason === 'table-missing'
          ? isAr
            ? 'قاعدة بيانات Supabase متصلة لكن جدول الطلبات غير موجود بعد.'
            : 'Supabase is connected, but the submissions table doesn’t exist yet.'
          : isAr
            ? 'لم يتم إعداد Supabase. أضف NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY.'
            : 'Supabase isn’t configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'}
      </p>
      <ol className="mt-5 list-decimal space-y-2 ps-5 text-sm text-white/75">
        <li>{isAr ? 'افتح Supabase ← SQL Editor ← New query' : 'Open Supabase → SQL Editor → New query'}</li>
        <li>
          {isAr ? 'الصق محتوى الملف ' : 'Paste the contents of '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-brand">supabase/001_submissions.sql</code>
          {isAr ? ' واضغط Run' : ' and press Run'}
        </li>
        <li>{isAr ? 'حدّث هذه الصفحة' : 'Refresh this page'}</li>
      </ol>
    </div>
  );
}
