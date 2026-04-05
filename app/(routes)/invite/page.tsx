'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function JoinServerPage() {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await signIn('discord', { callbackUrl: '/' });
  };

  return (
    <main
      className="relative min-h-[100dvh]"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 -z-10 bg-black/60" />

      <section className="mx-auto flex min-h-[100dvh] max-w-xl items-center justify-center px-4 text-center">
        <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur">
          <h1 className="text-3xl font-extrabold">
            Join Our Discord
          </h1>

          <p className="mt-3 text-white/80">
            You must join our Discord server before accessing the website.
          </p>

          <a
            href="https://discord.gg/Wvp2rU8sZ8"
            target="_blank"
            className="mt-6 inline-flex items-center justify-center gap-2 btn btn-primary"
          >
            Join Discord
          </a>

          <button
            onClick={handleCheck}
            disabled={checking}
            className="mt-4 w-full rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/10"
          >
            {checking ? 'Redirecting...' : 'I joined, continue'}
          </button>
        </div>
      </section>
    </main>
  );
}