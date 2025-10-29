import Link from 'next/link';
import Image from 'next/image';
import { t, getLang } from '@/lib/i18n';
import { BRAND } from '@/lib/brand';
import LanguageToggle from './LanguageToggle';
import AuthButtons from './AuthButtons';
import JoinUsCta from './JoinUsCta';

export default function Navbar() {
  const lang = getLang();
  const L = t(lang);
  return (
    <header className="absolute inset-x-0 top-8 z-50 bg-transparent">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Glory RP logo"
            width={84}
            height={84}
            priority
            className="h-13 w-13 rounded-2xl object-contain"
            sizes="84px"
          />
          <span className="text-xl font-extrabold tracking-tight">{L.brand}</span>
        </Link>
        <nav className="hidden items-center gap-3 md:flex">
          <Link className="btn btn-ghost" href="/">{L.nav.home}</Link>
          <Link className="btn btn-ghost" href="/streamers">{L.nav.streamers}</Link>
          <Link className="btn btn-ghost" href="/rules">{L.nav.rules}</Link>
          <Link className="btn btn-ghost" href="/jobs">{L.nav.jobs}</Link>
          <Link className="btn btn-ghost" href="/hall">{L.nav.hall}</Link>
          <a className="btn btn-ghost" href={BRAND.store} target="_blank" rel="noreferrer">{L.nav.store}</a>
          <JoinUsCta label={L.hero.ctaJoin} />
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
