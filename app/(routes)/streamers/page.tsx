"use client";

import { useLiveStreamers } from "@/lib/useLive";
import LiveBadge from "@/components/LiveBadge";
import { tClient as t } from "@/lib/i18n-client";
import { useLang } from "@/lib/providers";
import Reveal from "@/components/Reveal";
import Avatar from "@/components/Avatar";
import { ArrowUpRight, Radio } from "lucide-react";

export default function StreamersPage() {
  const { lang } = useLang();
  const L = t(lang);
  const { streamers: STREAMERS, live } = useLiveStreamers();

  return (
    <main className="page-shell min-h-[100dvh] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:pt-36">
        <Reveal>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="pill mb-4">
              <Radio className="h-3.5 w-3.5" /> {STREAMERS.length} {L.isAr ? "صانع محتوى" : "creators"}
            </span>
            <h1 className="section-title">{L.nav.streamers}</h1>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand shadow-glow" />
            <p className="mt-5 text-base text-white/65">{L.live.subtitle}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {STREAMERS.map((s, i) => (
            <Reveal key={s.name + i} delay={(i % 10) * 0.04}>
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-hover group flex flex-col items-center p-6 text-center"
              >
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-brand-grad opacity-30 blur-md transition duration-300 group-hover:opacity-80" />
                  <div className="relative rounded-full bg-brand-grad p-[2px]">
                    <Avatar src={s.avatar} alt={s.name} className="h-24 w-24 rounded-full border-4 border-surface transition duration-300 group-hover:scale-[1.04] sm:h-28 sm:w-28" />
                  </div>
                  {live.has(s.name) && <LiveBadge />}
                </div>
                <p className="mt-4 truncate text-sm font-semibold transition group-hover:text-brand sm:text-base">
                  {s.name}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-white/40 transition group-hover:text-brand/80">
                  {L.isAr ? "زيارة القناة" : "Visit channel"} <ArrowUpRight className="h-3 w-3" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
