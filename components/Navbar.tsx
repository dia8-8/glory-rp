import { t, getLang } from '@/lib/i18n';
import LanguageToggle from './LanguageToggle';
import AuthButtons from './AuthButtons';
import JoinUsCta from './JoinUsCta';
import NavbarShell from './NavbarShell';

export default function Navbar() {
  const L = t(getLang());
  const links = [
    { href: '/', label: L.nav.home },
    { href: '/streamers', label: L.nav.streamers },
    { href: '/rules', label: L.nav.rules },
    { href: '/jobs', label: L.nav.jobs },
    { href: '/vipshop', label: L.nav.store },
  ];

  return (
    <NavbarShell
      brand={L.brand}
      links={links}
      cta={<JoinUsCta label={L.hero.ctaJoin} />}
      actions={
        <>
          <LanguageToggle />
          <AuthButtons />
        </>
      }
    />
  );
}
