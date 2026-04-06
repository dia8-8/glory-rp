import RulesClient from './RulesClient';
import { t, getLang } from '@/lib/i18n-server';

export default function RulesPage() {
  const lang = getLang();
  const L = t(lang);

  return <RulesClient lang={lang} L={L} />;
}