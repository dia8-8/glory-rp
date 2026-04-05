'use client';

import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function JoinUsCta({ label }: { label: string }) {
  const { status } = useSession();

  if (status === 'loading') {
    return <button className="btn btn-primary" disabled>{label}</button>;
  }

  if (status === 'authenticated') {
    return <Link href="/apply" className="btn btn-primary">{label}</Link>;
  }

  return (
    <button
      className="btn btn-primary"
      onClick={() => signIn('discord', { callbackUrl: '/apply' })}
    >
      {label}
    </button>
  );
}
