'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'ar' | 'en';

type ProvidersProps = {
  children: React.ReactNode;
  initialLang?: Lang;
};

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
});

export function Providers({ children, initialLang = 'en' }: ProvidersProps) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )lang=(ar|en)/);
    if (m && (m[1] as Lang) !== lang) setLang(m[1] as Lang);
  }, [lang]);

  return (
    <SessionProvider>
      <LangCtx.Provider value={{ lang, setLang }}>
        {children}
      </LangCtx.Provider>
    </SessionProvider>
  );
}

export const useLang = () => useContext(LangCtx);
