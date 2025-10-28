import { t, getLang } from '@/lib/i18n-server';
import { BRAND } from '@/lib/brand';
import { SiDiscord, SiTiktok } from 'react-icons/si';


export default function Footer() {
  const L = t(getLang());
  return (
    <footer className="mt-auto border-t border-white/10 py-10 text-sm text-white/70 bg-[#170930]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div>{L.footer}</div>
        <div className="flex items-center gap-4">
          <a className="hover:opacity-80" href={BRAND.discord} target="_blank" rel="noreferrer" aria-label="Discord"><SiDiscord size={22} /></a>
          {/*<a className="hover:opacity-80" href={BRAND.twitter} target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={22} /></a>*/}
          <a className="hover:opacity-80" href={BRAND.tiktok} target="_blank" rel="noreferrer" aria-label="Kick"><SiTiktok size={22} /></a>
        </div>
      </div>
    </footer>
  );
}
