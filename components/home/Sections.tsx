'use client';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Drama, Briefcase, Store, Shield, Radio, Languages, Plus, X, ChevronLeft, ChevronRight, ArrowUpRight, Newspaper,
} from 'lucide-react';
import { useLang } from '@/lib/providers';
import Reveal from '@/components/Reveal';
import { FEATURES, FAQ, type Bi } from '@/data/home';

export type GalleryItem = { src: string; caption: Bi };
export type NewsItem = { date: string; tag: Bi; title: Bi; body: Bi };

const ICONS = { drama: Drama, briefcase: Briefcase, store: Store, shield: Shield, radio: Radio, languages: Languages };

function useBi() {
  const { lang } = useLang();
  return { isAr: lang === 'ar', tr: (b: Bi) => (lang === 'ar' ? b.ar : b.en) };
}

export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <Reveal>
          <span className="pill mb-4">{eyebrow}</span>
        </Reveal>
      )}
      <Reveal>
        <h2 className="section-title">{title}</h2>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand" />
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-base leading-relaxed text-white/65">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ───────── Why Glory RP ───────── */
export function Features() {
  const { isAr, tr } = useBi();
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24">
      <SectionHeading
        title={isAr ? 'لماذا جلوري؟' : 'Why Glory RP?'}
        subtitle={isAr ? 'كل ما تحتاجه لتجربة رول بلاي ممتعة في مكان واحد.' : 'Everything you need for a great roleplay experience, in one city.'}
      />
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => {
          const Icon = ICONS[f.icon];
          return (
            <Reveal key={f.title.en} delay={(i % 3) * 0.06} className="h-full [&>div]:h-full">
              <div className="card card-hover group flex h-full gap-4 p-6">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/25 transition group-hover:bg-brand group-hover:text-ink">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{tr(f.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">{tr(f.desc)}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ───────── Gallery + lightbox ───────── */
export function Gallery({ items: GALLERY }: { items: GalleryItem[] }) {
  const { isAr, tr } = useBi();
  const [open, setOpen] = useState<number | null>(null);
  const n = GALLERY.length;
  const go = (d: number) => setOpen((o) => (o === null ? o : (o + d + n) % n));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') go(isAr ? -1 : 1);
      if (e.key === 'ArrowLeft') go(isAr ? 1 : -1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAr]);

  if (!n) return null;

  return (
    <section id="gallery" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24">
      <SectionHeading
        title={isAr ? 'من داخل المدينة' : 'Inside the City'}
        subtitle={isAr ? 'لقطات من عالم جلوري.' : 'A look at life in Glory RP.'}
      />
      <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4">
        {GALLERY.map((g, i) => (
          <Reveal
            key={g.src + i}
            delay={(i % 4) * 0.05}
            className={`h-full [&>div]:h-full ${i === 0 ? 'col-span-2 row-span-2' : ''} ${i === 3 ? 'md:col-span-2' : ''}`}
          >
            <button
              onClick={() => setOpen(i)}
              className="group relative block h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Image
                src={g.src}
                alt={tr(g.caption)}
                fill
                sizes="(min-width:768px) 50vw, 100vw"
                unoptimized={g.src.startsWith('http')}
                className="object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent opacity-80 transition group-hover:opacity-100" />
              <span className="absolute bottom-3 start-3 rounded-lg bg-ink/70 px-2.5 py-1 text-sm font-semibold backdrop-blur">
                {tr(g.caption)}
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur"
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal
          >
            <button className="btn btn-ghost absolute end-4 top-4 h-11 w-11 p-0" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <button
              className="btn btn-ghost absolute start-4 top-1/2 h-11 w-11 -translate-y-1/2 p-0"
              aria-label="Previous"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
            >
              {isAr ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button
              className="btn btn-ghost absolute end-4 top-1/2 h-11 w-11 -translate-y-1/2 p-0"
              aria-label="Next"
              onClick={(e) => { e.stopPropagation(); go(1); }}
            >
              {isAr ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            <motion.figure
              key={open}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[75vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={GALLERY[open].src} alt={tr(GALLERY[open].caption)} fill sizes="100vw" unoptimized={GALLERY[open].src.startsWith('http')} className="rounded-2xl object-contain" />
              <figcaption className="absolute -bottom-10 inset-x-0 text-center text-sm text-white/70">
                {tr(GALLERY[open].caption)} · <span dir="ltr">{open + 1} / {n}</span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ───────── FAQ accordion ───────── */
export function Faq() {
  const { isAr, tr } = useBi();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative mx-auto max-w-3xl scroll-mt-28 px-4 py-24">
      <SectionHeading title={isAr ? 'الأسئلة الشائعة' : 'FAQ'} subtitle={isAr ? 'إجابات سريعة لأكثر الأسئلة تكرارًا.' : 'Quick answers to the most common questions.'} />
      <div className="mt-12 space-y-3">
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q.en} delay={i * 0.04}>
              <div className={`card overflow-hidden ${isOpen ? 'border-brand/30' : ''}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-start font-semibold"
                  aria-expanded={isOpen}
                >
                  {tr(f.q)}
                  <Plus className={`h-5 w-5 shrink-0 text-brand transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-5 leading-relaxed text-white/65">{tr(f.a)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ───────── News list (home preview + /news page) ───────── */
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/**
 * "2026-11-16" → "16 November 2026" / "16 نوفمبر 2026".
 * Formatted by hand (not Intl) so server and browser always produce identical text,
 * and parsed as plain numbers so the day never shifts with the viewer's timezone.
 */
function formatDate(iso: string, isAr: boolean) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${(isAr ? MONTHS_AR : MONTHS_EN)[m - 1]} ${y}`;
}

export function NewsList({ items: all, limit }: { items: NewsItem[]; limit?: number }) {
  const { isAr, tr } = useBi();
  const items = limit ? all.slice(0, limit) : all;
  if (!items.length) {
    return <p className="card p-8 text-center text-white/60">{isAr ? 'لا توجد أخبار بعد.' : 'No news yet.'}</p>;
  }
  return (
    <ol className="relative space-y-5 border-s border-white/10 ps-6">
      {items.map((n, i) => (
        <Reveal key={n.date + i} delay={i * 0.05}>
          <li className="relative">
            <span className="absolute -start-[31px] top-6 h-3 w-3 rounded-full bg-brand ring-4 ring-ink" />
            <article className="card card-hover p-6">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="pill">{tr(n.tag)}</span>
                <time dateTime={n.date} className="text-white/45" dir="ltr">
                  {formatDate(n.date, isAr)}
                </time>
              </div>
              <h3 className="mt-3 text-lg font-bold">{tr(n.title)}</h3>
              <p className="mt-2 leading-relaxed text-white/65">{tr(n.body)}</p>
            </article>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export function NewsPreview({ items: NEWS }: { items: NewsItem[] }) {
  const { isAr } = useBi();
  if (!NEWS.length) return null;
  return (
    <section className="relative mx-auto max-w-3xl px-4 py-24">
      <SectionHeading eyebrow={<><Newspaper className="h-3.5 w-3.5" /> {isAr ? 'جديد' : 'Latest'}</>} title={isAr ? 'آخر الأخبار' : 'Latest Updates'} />
      <div className="mt-12">
        <NewsList items={NEWS} limit={3} />
      </div>
      {NEWS.length > 3 && (
        <div className="mt-8 text-center">
          <Link href="/news" className="btn btn-outline">
            {isAr ? 'كل الأخبار' : 'All updates'} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
