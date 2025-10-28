import { t, getLang } from '@/lib/i18n-server';
import { BRAND } from '@/lib/brand';
import CreatorCard from '@/components/CreatorCard';
import Stat from '@/components/Stat';
import { STREAMERS } from '@/data/streamers';
import Particles from '@/components/Particles';
import { Info, BookOpen, Users } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Link from 'next/link';
import JoinUsCta from '@/components/JoinUsCta';

export default function HomePage() {
  const L = t(getLang());
  return (
    <main className="relative min-h-screen bg-black/40 bg-blend-multiply bg-cover bg-center md:bg-fixed" style={{ backgroundImage: "url('/bg.png')" }}>
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

        {/* Hero content */}
        <div className="relative z-20 max-w-3xl px-4">
          <Reveal><h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl whitespace-pre-line">{L.hero.title}</h1></Reveal>
          <Reveal delay={0.08}><p className="mt-4 text-lg text-white/90">{L.hero.body}</p></Reveal>
          <Reveal delay={0.16}>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <JoinUsCta label={L.hero.ctaJoin} />
              <a href="/rules" className="btn btn-ghost">{L.hero.ctaRules}</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* LIVE/CREATORS */}
      <hr className="h-px border-0 bg-[#a865fa]" />
      <section className="relative w-full bg-[#170930] pt-12 pb-20">
        <Particles className="z-0" quantity={70} color="#ffffff" opacity={0.45} linkDistance={80} />
        <div className="relative z-10 mx-auto mt-6 max-w-7xl px-4">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <Reveal><h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">{L.live.title}</h2></Reveal>
          <Reveal delay={0.08}><p className="mt-3 text-base text-white/80">{L.live.subtitle}</p></Reveal>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {STREAMERS.slice(0, 12).map((s, i) => (
            <Reveal key={s.name} delay={i * 0.05}>
              <CreatorCard {...s} />
            </Reveal>
          ))}
        </div>
      </div>
      </section>
     <hr className="h-px border-0 bg-[#a865fa]" />

      {/* SOCIAL STATS */}
      <section className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto mb-8 max-w-3xl text-center">
        <Reveal><h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">{L.social.title}</h2></Reveal>
        <Reveal delay={0.08}><p className="mt-3 text-base text-white/80">{L.social.body}</p></Reveal>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Reveal><Stat label={L.social.members} value={"950"} /></Reveal>
        <Reveal delay={0.06}><Stat label={L.social.followers} value={"250"} /></Reveal>
        {/*<Reveal delay={0.12}><Stat label={L.social.twitter} value={"600"} /></Reveal>*/}
      </div>

      <Reveal delay={0.18}>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <a href={BRAND.tiktok} target="_blank" rel="noreferrer" className="btn btn-ghost">{L.social.tiktok}</a>
          <a href={BRAND.discord} target="_blank" rel="noreferrer" className="btn btn-ghost">{L.social.discord}</a>
          {/*<a href={BRAND.twitter} target="_blank" rel="noreferrer" className="btn btn-ghost">{L.social.twitter}</a>*/}
        </div>
      </Reveal>

      </section>

      {/* ABOUT / RULES CTA */}
      <section id="rules-home" className="relative mx-auto max-w-7xl px-4 py-16 scroll-mt-28">
        <div className="mx-auto mb-8 max-w-3xl text-center pb-12">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">{L.about.title}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 text-base text-white/80">{L.about.body}</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* ABOUT */}
          <Reveal>
            <div className="card relative p-8 pt-12 h-full min-h-[260px] flex flex-col items-center text-center">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl ring-2 ring-white/20 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }}
                  aria-hidden
                >
                  <Info className="h-7 w-7 text-white/70" />
                </div>
              </div>
              <h3 className="text-xl font-extrabold">{L.about.title}</h3>
              <p className="mt-3 text-white/80">{L.about.body}</p>
            </div>
          </Reveal>

          {/* RULES */}
          <Reveal delay={0.08}>
            <div className="card relative p-8 pt-12 h-full min-h-[260px] flex flex-col items-center text-center">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl ring-2 ring-white/20 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }}
                  aria-hidden
                >
                  <BookOpen className="h-7 w-7 text-white/70" />
                </div>
              </div>
              <h3 className="text-xl font-extrabold">{L.rules.title}</h3>
              <p className="mt-3 text-white/80">{L.rules.body}</p>
              <a href="/rules" className="mt-6 inline-block btn btn-ghost self-center">
                {L.nav.rules}
              </a>
            </div>
          </Reveal>

          {/* COMMUNITY */}
          <Reveal delay={0.16}>
            <div className="card relative p-8 pt-12 h-full min-h-[260px] flex flex-col items-center text-center">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl ring-2 ring-white/20 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }}
                  aria-hidden
                >
                  <Users className="h-7 w-7 text-white/70" />
                </div>
              </div>
              <h3 className="text-xl font-extrabold">{L.isAr ? 'اتصل بنا' : 'Contact Us'}</h3>
              <p className="mt-3 text-white/80">
                {L.isAr
                  ? 'يمكنك التواصل معنا عن طريق جميع منصات التواصل الاجتماعي سواء الدسكورد او التويتر'
                  : 'Our community is active daily with a strong presence across platforms.'}
              </p>
              <a href={BRAND.discord} className="mt-6 inline-block btn btn-ghost self-center">
                {L.isAr ? 'الدخول إلى الديسكورد' : 'Enter our Discord'}
              </a>
            </div>
          </Reveal>
        </div>
      </section>



    </main>
  );
}
