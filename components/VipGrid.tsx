'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/lib/providers';
import { VIP_CATEGORIES, VIP_ITEMS, type VipCategory } from '@/data/vip';

export default function VipGrid() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [cat, setCat] = useState<VipCategory | 'all'>('all');
  const items = cat === 'all' ? VIP_ITEMS : VIP_ITEMS.filter((i) => i.category === cat);
  const count = (k: VipCategory | 'all') => (k === 'all' ? VIP_ITEMS.length : VIP_ITEMS.filter((i) => i.category === k).length);

  return (
    <>
      {/* Filter tabs */}
      <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <div className="mx-auto flex w-max gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1.5">
          {VIP_CATEGORIES.map((c) => {
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`relative whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active ? 'text-ink' : 'text-white/65 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="vip-tab"
                    className="absolute inset-0 rounded-xl bg-brand"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">
                  {isAr ? c.ar : c.en}{' '}
                  <span className={active ? 'text-ink/60' : 'text-white/35'}>{count(c.key)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.article
              layout
              key={item.name.en}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`card card-hover group flex flex-col overflow-hidden ${item.soldOut ? 'opacity-60' : ''}`}
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={isAr ? item.name.ar : item.name.en}
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                <div className="absolute start-3 top-3 flex gap-2">
                  {item.soldOut && (
                    <span className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                      {isAr ? 'نفدت' : 'SOLD OUT'}
                    </span>
                  )}
                  {item.badge && (
                    <span className="rounded-md bg-brand px-2.5 py-1 text-xs font-bold text-ink">
                      {isAr ? item.badge.ar : item.badge.en}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5 pt-2">
                <h2 className="text-lg font-bold transition group-hover:text-brand">{isAr ? item.name.ar : item.name.en}</h2>
                {item.price1 && <p className="mt-3 text-sm font-semibold text-brand">{isAr ? item.price1.ar : item.price1.en}</p>}
                {item.price2 && <p className="mt-1 text-sm text-white/55">{isAr ? item.price2.ar : item.price2.en}</p>}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
