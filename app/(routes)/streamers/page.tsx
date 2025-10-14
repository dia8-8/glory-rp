import { STREAMERS } from '@/data/streamers';
import CreatorCard from '@/components/CreatorCard';
import { t, getLang } from '@/lib/i18n-server';

export default function StreamersPage() {
  const L = t(getLang());
  return (
    <main
      className="mx-auto max-w-8xl px-4 pb-14 pt-24 sm:pt-28 md:pt-32 relative min-h-[100dvh] bg-[#170930]">

      <div
        className="absolute inset-0 -z-10 bg-cover bg-center md:bg-fixed"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden />

      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">{L.nav.streamers}</h2>
        <p className="mt-3 text-base text-white/80">{L.live.subtitle}</p>
      </div>
      <div className="flex justify-center">
        <div className="inline-grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {STREAMERS.map((s) => (
            <div key={s.name} className="w-32 sm:w-36 md:w-40 lg:w-44">
              <CreatorCard {...s} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
