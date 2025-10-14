'use client';
import { useState, useEffect } from 'react';

export default function LanguageToggle() {
  const [lang, setLang] = useState<'ar'|'en'>('ar');
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=([^;]+)/);
    const v = (match?.[1] ?? 'ar') as 'ar'|'en';
    setLang(v);
    document.documentElement.dir = v === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = v;
  }, []);
  return (
    <button
      onClick={() => {
        const next = lang === 'ar' ? 'en' : 'ar';
        document.cookie = `lang=${next}; path=/; max-age=31536000`;
        setLang(next);
        location.reload();
      }}
      className="btn btn-ghost"
    >
      {lang === 'ar' ? 'EN' : 'AR'}
    </button>
  );
}
