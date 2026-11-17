import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  drawQuestions, grade, hasPassed, passToken, waitToken, waitLeft,
  PASS_COOKIE, WAIT_COOKIE, PASS_MARK, QUIZ_SIZE,
} from '@/lib/server/quiz';

export const dynamic = 'force-dynamic';

const cookieOpts = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };

/** GET → a fresh set of questions (without answers), or { passed: true } */
export async function GET() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jar = cookies();
  if (hasPassed(jar.get(PASS_COOKIE)?.value, id)) return NextResponse.json({ passed: true });
  const wait = waitLeft(jar.get(WAIT_COOKIE)?.value, id);
  return NextResponse.json({ passed: false, waitMs: wait, passMark: PASS_MARK, total: QUIZ_SIZE, questions: drawQuestions() });
}

/** POST { answers: { [id]: index } } → graded result; sets the pass cookie on success */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jar = cookies();
  const wait = waitLeft(jar.get(WAIT_COOKIE)?.value, id);
  if (wait > 0) return NextResponse.json({ error: 'wait', waitMs: wait }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const answers = (body?.answers ?? {}) as Record<string, number>;
  const result = grade(answers);

  const res = NextResponse.json(result);
  if (result.passed) {
    res.cookies.set(PASS_COOKIE, passToken(id), { ...cookieOpts, maxAge: 7 * 24 * 3600 });
  } else {
    res.cookies.set(WAIT_COOKIE, waitToken(id), { ...cookieOpts, maxAge: 120 });
  }
  return res;
}
