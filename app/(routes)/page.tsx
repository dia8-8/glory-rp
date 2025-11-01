"use client";

import { useState } from "react";
import { tClient as t, getLangClient as getLang } from "@/lib/i18n-client";
import { BRAND } from "@/lib/brand";
import Stat from "@/components/Stat";
import { STREAMERS } from "@/data/streamers";
import Particles from "@/components/Particles";
import { Info, BookOpen, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import JoinUsCta from "@/components/JoinUsCta";

export default function HomePage() {
  const L = t(getLang());
  const [page, setPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.ceil(STREAMERS.length / perPage);
  const start = page * perPage;
  const current = STREAMERS.slice(start, start + perPage);

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <main
      className="relative min-h-screen bg-black/40 bg-blend-multiply bg-cover bg-center md:bg-fixed"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center text-center bg-transparent">
        <iframe
          className="absolute inset-0 z-0 h-full w-full pointer-events-none scale-[1.15]"
          src="https://www.youtube-nocookie.com/embed/bKXeaF1ot40?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=bKXeaF1ot40"
          title="Hero background"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <div className="absolute inset-0 z-10 bg-black/40" />

        <div className="relative z-20 max-w-3xl px-4">
          <Reveal>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl whitespace-pre-line">
              {L.hero.title}
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-lg text-white/90">{L.hero.body}</p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <JoinUsCta label={L.hero.ctaJoin} />
              <a href="/rules" className="btn btn-ghost">
                {L.hero.ctaRules}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STREAMERS SECTION (smooth slider) */}
      <hr className="h-px border-0 bg-[#a865fa]" />
      <section className="relative w-full bg-[#170930] pt-12 pb-20 overflow-hidden">
        <Particles
          className="z-0"
          quantity={70}
          color="#ffffff"
          opacity={0.45}
          linkDistance={80}
        />

        <div className="relative z-10 mx-auto mt-6 max-w-7xl px-4 text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
              {L.live.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 text-base text-white/80">{L.live.subtitle}</p>
          </Reveal>

          {/* SLIDER CONTAINER */}
          <div className="relative mt-10 flex flex-col items-center">
            <div className="overflow-hidden w-full">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
              >
                {Array.from({ length: totalPages }).map((_, pageIndex) => {
                  const start = pageIndex * perPage;
                  const pageItems = STREAMERS.slice(start, start + perPage);
                  return (
                    <div
                      key={pageIndex}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 min-w-full shrink-0"
                    >
                      {pageItems.map((s, i) => (
                        <a
                          key={s.name + i}
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
                  );
                })}
              </div>
            </div>

            {/* CONTROLS */}
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
        </div>
      </section>


      {/* SOCIAL STATS */}
      <hr className="h-px border-0 bg-[#a865fa]" />
      <section className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
              {L.social.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 text-base text-white/80">{L.social.body}</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Reveal>
            <Stat label={L.social.members} value={"1000"} />
          </Reveal>
          <Reveal delay={0.06}>
            <Stat label={L.social.followers} value={"250"} />
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a
              href={BRAND.tiktok}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              {L.social.tiktok}
            </a>
            <a
              href={BRAND.discord}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              {L.social.discord}
            </a>
          </div>
        </Reveal>
      </section>

      {/* ABOUT / RULES CTA */}
      <section
        id="rules-home"
        className="relative mx-auto max-w-7xl px-4 py-16 scroll-mt-28"
      >
        <div className="mx-auto mb-8 max-w-3xl text-center pb-12">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
              {L.about.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 text-base text-white/80">{L.about.body}</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <Reveal>
            <InfoCard
              icon={<Info className="h-7 w-7 text-white/70" />}
              title={L.about.title}
              desc={L.about.body}
            />
          </Reveal>

          <Reveal delay={0.08}>
            <InfoCard
              icon={<BookOpen className="h-7 w-7 text-white/70" />}
              title={L.rules.title}
              desc={L.rules.body}
              link="/rules"
              linkLabel={L.nav.rules}
            />
          </Reveal>

          <Reveal delay={0.16}>
            <InfoCard
              icon={<Users className="h-7 w-7 text-white/70" />}
              title={L.isAr ? "اتصل بنا" : "Contact Us"}
              desc={
                L.isAr
                  ? "يمكنك التواصل معنا عن طريق جميع منصات التواصل الاجتماعي سواء الدسكورد او التويتر"
                  : "Our community is active daily with a strong presence across platforms."
              }
              link={BRAND.discord}
              linkLabel={
                L.isAr ? "الدخول إلى الديسكورد" : "Enter our Discord"
              }
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, desc, link, linkLabel }: any) {
  return (
    <div className="card relative p-8 pt-12 h-full min-h-[260px] flex flex-col items-center text-center">
      <div className="absolute -top-7 left-1/2 -translate-x-1/2">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl ring-2 ring-white/20 shadow-xl"
          style={{
            background: "linear-gradient(135deg, var(--brand-from), var(--brand-to))",
          }}
          aria-hidden
        >
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-extrabold">{title}</h3>
      <p className="mt-3 text-white/80">{desc}</p>
      {link && (
        <a href={link} className="mt-6 inline-block btn btn-ghost self-center">
          {linkLabel}
        </a>
      )}
    </div>
  );
}
