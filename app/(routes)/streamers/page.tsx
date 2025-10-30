"use client";

import { STREAMERS } from "@/data/streamers";
import { tClient as t, getLangClient as getLang } from "@/lib/i18n-client";
import Reveal from "@/components/Reveal";

export default function StreamersPage() {
  const L = t(getLang());

  return (
    <main className="mx-auto max-w-8xl px-4 pb-14 pt-24 sm:pt-28 md:pt-32 relative min-h-[100dvh] bg-[#170930] text-white">
      {/* Background overlays */}
      <div className="absolute inset-0 -z-10 bg-cover bg-center md:bg-fixed" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden />

      <Reveal>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">{L.nav.streamers}</h2>
          <p className="mt-3 text-base text-white/80">{L.live.subtitle}</p>
        </div>

        <div className="flex justify-center">
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {STREAMERS.map((s, i) => (
              <Reveal key={s.name + i} delay={i * 0.05}>
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center transition-transform hover:scale-105"
                >
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-[#b841e4] object-cover shadow-lg group-hover:shadow-[#b841e4]/50 transition"
                  />
                  <p className="mt-3 text-sm sm:text-base font-semibold group-hover:text-[#b841e4] transition">
                    {s.name}
                  </p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </main>
  );
}
