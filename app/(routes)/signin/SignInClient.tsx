'use client';
import { signIn } from 'next-auth/react';
import type { Lang } from '@/lib/i18n';
import { tClient as T, getLangClient } from '@/lib/i18n-client';
import { useSearchParams } from 'next/navigation';

export default function SignInClient({ initialLang, strings }: { initialLang: Lang; strings: any }) {
  const L = T(getLangClient());
  const params = useSearchParams();
  const rawCb = params.get('callbackUrl') || '/';
  const callbackUrl = rawCb.startsWith('/') ? rawCb : '/';

  return (
    <main
      className="relative min-h-[100dvh]"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden />
      <section className="mx-auto flex min-h-[100dvh] w-full max-w-xl items-center justify-center px-4 text-center">
        <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur">
          <h1 className="text-3xl font-extrabold">{strings.login.title}</h1>
          <p className="mt-2 text-white/80">{strings.login.body}</p>

          <button
            onClick={() => signIn('discord', { callbackUrl })}
            className="mt-6 inline-flex items-center gap-2 btn btn-primary"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.19.34-.41.8-.56 1.16a18.27 18.27 0 0 0-7.996 0c-.15-.37-.37-.82-.56-1.16c-1.3.24-2.54.64-3.759 1.17C.533 9.053-.32 13.59.099 18.06a19.93 19.93 0 0 0 6.088 3.11c.49-.67.93-1.39 1.31-2.14c-.72-.27-1.41-.6-2.06-.98c.17-.12.34-.25.5-.38c3.97 1.86 8.27 1.86 12.2 0c.17.13.34.26.51.38c-.65.39-1.34.71-2.05.98c.38.75.81 1.47 1.3 2.14a19.93 19.93 0 0 0 6.089-3.11c.5-5.25-.838-9.74-3.77-13.69zM8.51 15.28c-1.19 0-2.17-1.09-2.17-2.43c0-1.33.96-2.42 2.17-2.42c1.21 0 2.18 1.09 2.17 2.42c0 1.34-.96 2.43-2.17 2.43m6.98 0c-1.19 0-2.17-1.09-2.17-2.43c0-1.33.96-2.42 2.17-2.42c1.21 0 2.18 1.09 2.17 2.42c0 1.34-.96 2.43-2.17 2.43"
              />
            </svg>
            {strings.login.btn}
          </button>
        </div>
      </section>
    </main>
  );
}
