import { getLang, t } from '@/lib/i18n-server';
import SignInClient from './SignInClient';

export default function Page() {
  const lang = getLang();
  const L = t(lang);
  return <SignInClient initialLang={lang} strings={L} />;
}
