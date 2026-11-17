"use client";

import { useState } from "react";
import { tClient as t } from "@/lib/i18n-client";
import { useLang } from "@/lib/providers";
import { BRAND } from "@/lib/brand";
import Stat from "@/components/Stat";
import Particles from "@/components/Particles";
import { Info, BookOpen, Users, ChevronLeft, ChevronRight, ArrowUpRight, Radio } from "lucide-react";
import { SiDiscord, SiTiktok } from "react-icons/si";
import Reveal from "@/components/Reveal";
import Avatar from "@/components/Avatar";
import JoinUsCta from "@/components/JoinUsCta";
import LiveBadge from "@/components/LiveBadge";
import { ServerStatusPill, ConnectButton } from "@/components/home/ServerStatus";
import { SectionHeading, Features, Gallery, Faq, NewsPreview } from "@/components/home/Sections";
import { useLiveStreamers } from "@/lib/useLive";
import { useStatus } from "@/lib/useStatus";
import { SITE } from "@/lib/site";

export default function HomePage() {
  const { lang } = useLang();
  const L = t(lang);
  const { streamers: STREAMERS, live } = useLiveStreamers();
  const status = useStatus();
  const members = status?.discord?.members || SITE.fallbackMembers;
  const [page, setPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(STREAMERS.length / perPage));

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  const [line1, ...rest] = L.hero.title.split("\n");

  return (
    <main className="relative min-h-screen bg-ink">
      {/* HERO */}
      <section className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden text-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.png')" }}
          aria-hidden
        />
        <iframe
          className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-[1.35]"
          src="https://www.youtube-nocookie.com/embed/bKXeaF1ot40?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=bKXeaF1ot40"
          title="Hero background"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {/* Overlays: darken, green glow, grid, fade into page */}
        <div className="absolute inset-0 z-10 bg-ink/60" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_40%,rgb(var(--brand-rgb)/0.18),transparent_60%)]" />
        <div className="absolute inset-0 z-10 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-b from-transparent to-ink" />

        <div className="relative z-20 max-w-4xl px-4">
          <Reveal>
            <ServerStatusPill />
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              <span className="text-gradient drop-shadow-[0_0_30px_rgb(var(--brand-rgb)/0.25)]">{line1}</span>
              {rest.length > 0 && (
                <span className="mt-3 block text-2xl font-bold text-white/90 sm:text-3xl md:text-4xl">
                  {rest.join(" ")}
                </span>
              )}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">{L.hero.body}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap justify-center gap-3 [&_.btn]:px-6 [&_.btn]:py-3 [&_.btn]:text-base">
              <JoinUsCta label={L.hero.ctaJoin} />
              <ConnectButton />
              <a href="/rules" className="btn btn-ghost backdrop-blur">
                <BookOpen className="h-4 w-4" />
                {L.hero.ctaRules}
              </a>
            </div>
          </Reveal>
        </div>

        <a
          href="#streamers"
          aria-label="Scroll down"
          className="absolute bottom-8 left-1/2 z-20 flex h-10 w-6 -translate-x-1/2 justify-center rounded-full border-2 border-white/30 pt-2 transition hover:border-brand"
        >
          <span className="h-2 w-1 rounded-full bg-brand animate-scroll-hint" />
        </a>
      </section>

      <Features />

      {/* STREAMERS */}
      <section id="streamers" className="relative w-full overflow-hidden pb-24 pt-16 scroll-mt-24">
        <Particles className="z-0" quantity={60} color="#50f018" opacity={0.35} linkDistance={90} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_at_top,rgb(var(--brand-rgb)/0.10),transparent_70%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <SectionHeading
            eyebrow={<><Radio className="h-3.5 w-3.5" /> LIVE</>}
            title={L.live.title}
            subtitle={L.live.subtitle}
          />

          <div className="relative mt-12 flex flex-col items-center">
            <div className="w-full overflow-x-clip py-6">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                style={{ transform: `translateX(${L.isAr ? page * 100 : -page * 100}%)` }}
              >
                {Array.from({ length: totalPages }).map((_, pageIndex) => {
                  const pageItems = STREAMERS.slice(pageIndex * perPage, pageIndex * perPage + perPage);
                  return (
                    <div
                      key={pageIndex}
                      className="grid min-w-full shrink-0 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5"
                    >
                      {pageItems.map((s, i) => (
                        <StreamerAvatar key={s.name + i} name={s.name} avatar={s.avatar} link={s.link} live={live.has(s.name)} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button onClick={L.isAr ? nextPage : prevPage} className="btn btn-ghost h-11 w-11 rounded-full p-0" aria-label="Previous">
                  {L.isAr ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
                <div className="flex items-center gap-2" dir="ltr">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      aria-label={`Page ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === page ? "w-8 bg-brand" : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
                <button onClick={L.isAr ? prevPage : nextPage} className="btn btn-ghost h-11 w-11 rounded-full p-0" aria-label="Next">
                  {L.isAr ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SOCIAL STATS */}
      <div className="divider-glow" />
      <section className="relative mx-auto max-w-7xl px-4 py-24">
        <SectionHeading title={L.social.title} subtitle={L.social.body} />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Reveal>
            <Stat label={L.social.members} value={String(members)} icon={<SiDiscord className="h-6 w-6" />} />
          </Reveal>
          <Reveal delay={0.06}>
            <Stat label={L.social.followers} value={String(SITE.fallbackFollowers)} icon={<SiTiktok className="h-6 w-6" />} />
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <a href={BRAND.tiktok} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <SiTiktok className="h-4 w-4" /> {L.social.tiktok}
            </a>
            <a href={BRAND.discord} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <SiDiscord className="h-4 w-4" /> {L.social.discord}
            </a>
          </div>
        </Reveal>
      </section>

      <Gallery />

      {/* ABOUT / RULES / CONTACT */}
      <section id="rules-home" className="relative mx-auto max-w-7xl scroll-mt-28 px-4 pb-28 pt-8">
        <SectionHeading title={L.about.title} subtitle={L.about.body} />

        <div className="mt-20 grid grid-cols-1 items-stretch gap-14 md:grid-cols-3 md:gap-6">
          <Reveal className="h-full [&>div]:h-full">
            <InfoCard icon={<Info className="h-7 w-7" />} title={L.about.title} desc={L.about.body} />
          </Reveal>
          <Reveal delay={0.08} className="h-full [&>div]:h-full">
            <InfoCard
              icon={<BookOpen className="h-7 w-7" />}
              title={L.rules.title}
              desc={L.rules.body}
              link="/rules"
              linkLabel={L.nav.rules}
            />
          </Reveal>
          <Reveal delay={0.16} className="h-full [&>div]:h-full">
            <InfoCard
              icon={<Users className="h-7 w-7" />}
              title={L.isAr ? "اتصل بنا" : "Contact Us"}
              desc={
                L.isAr
                  ? "يمكنك التواصل معنا عن طريق جميع منصات التواصل الاجتماعي سواء الدسكورد او التويتر"
                  : "Our community is active daily with a strong presence across platforms."
              }
              link={BRAND.discord}
              linkLabel={L.isAr ? "الدخول إلى الديسكورد" : "Enter our Discord"}
            />
          </Reveal>
        </div>
      </section>

      <NewsPreview />
      <Faq />
    </main>
  );
}

function StreamerAvatar({ name, avatar, link, live }: { name: string; avatar: string; link: string; live?: boolean }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center text-center">
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-brand-grad opacity-40 blur-md transition duration-300 group-hover:opacity-90" />
        <div className="relative rounded-full bg-brand-grad p-[2px]">
          <Avatar src={avatar} alt={name} className="h-24 w-24 rounded-full border-4 border-ink transition duration-300 group-hover:scale-[1.04] sm:h-28 sm:w-28 md:h-32 md:w-32" />
        </div>
        {live && <LiveBadge />}
      </div>
      <p className="mt-4 flex items-center gap-1 text-sm font-semibold transition group-hover:text-brand sm:text-base">
        {name}
        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
      </p>
    </a>
  );
}

function InfoCard({
  icon,
  title,
  desc,
  link,
  linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="card card-hover group flex h-full min-h-[260px] flex-col items-center p-8 pt-14 text-center">
      <div className="absolute -top-7 left-1/2 -translate-x-1/2">
        <div className="icon-tile transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden>
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-extrabold">{title}</h3>
      <p className="mb-6 mt-3 line-clamp-6 text-white/65">{desc}</p>
      {link && (
        <a href={link} className="btn btn-outline mt-auto self-center">
          {linkLabel}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
