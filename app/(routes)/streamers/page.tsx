"use client";

import { useState } from "react";
import { STREAMERS } from "@/data/streamers";
import { tClient as t, getLangClient as getLang } from '@/lib/i18n-client';
import Reveal from "@/components/Reveal";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function StreamersPage() {
  const L = t(getLang());
  const [page, setPage] = useState(0);
  const perPage = 10;

  const totalPages = Math.ceil(STREAMERS.length / perPage);
  const start = page * perPage;
  const current = STREAMERS.slice(start, start + perPage);

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <main className="relative min-h-[100svh] bg-[#170930] text-white px-4 pb-14 pt-24 sm:pt-28 md:pt-32">
      <Reveal>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {L.nav.streamers}
          </h2>
          <p className="mt-3 text-base text-white/80">{L.live.subtitle}</p>
        </div>

        {/* Slider Wrapper */}
        <div className="relative flex flex-col items-center">
          {/* Streamers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 transition-transform duration-500 ease-in-out">
            {current.map((s) => (
              <a
                key={s.name + s.link}
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
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevPage}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <span className="text-sm opacity-80">
              {page + 1} / {totalPages}
            </span>

            <button
              onClick={nextPage}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
