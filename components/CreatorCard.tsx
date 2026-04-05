'use client';

type Props = {
  name: string;
  avatar?: string;
  image?: string;
  url?: string;
  link?: string;
};

export default function CreatorCard({ name, avatar, image, url, link }: Props) {
  const src = '/logo.png';
  const href = url ?? link;

  const Inner = (
    <div className="group relative w-full aspect-[3/4] overflow-hidden rounded-2xl border border-[#6c2de4] bg-white/5">
      <div className="absolute inset-5 sm:inset-6 grid place-items-center">
        <div className="rounded-full p-2 sm:p-1.5 bg-black/20 ring-2 ring-[#6c2de4]/70">
          <img
            src={src}
            alt={name}
            className="h-24 w-auto sm:h-28 md:h-32 rounded-full object-contain ring-2 ring-[#6c2de4]/70 shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-3 text-center">
        <span className="inline-block rounded-lg bg-black/60 px-2 py-1 text-sm font-semibold">
          {name}
        </span>
      </div>
    </div>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      className="block cursor-pointer rounded-2xl transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      {Inner}
    </a>
  ) : (
    <div className="block rounded-2xl">{Inner}</div>
  );
}
