import { NextResponse } from 'next/server';
import { requireAdmin, dbError } from '@/lib/server/guard';
import { getQuiz, validateQuiz } from '@/lib/server/quiz';

export const dynamic = 'force-dynamic';

/** GET → the full quiz including correct answers (admins only) */
export async function GET() {
  const g = await requireAdmin();
  if (g.error) return g.error;
  return NextResponse.json(await getQuiz());
}

/** PUT { questions, size, passMark } → saves and publishes the quiz */
export async function PUT(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const v = validateQuiz(await req.json().catch(() => ({})));
  if ('error' in v) return NextResponse.json({ error: v.error }, { status: 400 });

  const { error } = await g.client
    .from('site_settings')
    .upsert({ key: 'quiz', value: v.config, updated_by: g.who, updated_at: new Date().toISOString() });
  if (error) return dbError(error.message);
  return NextResponse.json(await getQuiz());
}

/** DELETE → back to the built-in questions */
export async function DELETE() {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const { error } = await g.client.from('site_settings').delete().eq('key', 'quiz');
  if (error) return dbError(error.message);
  return NextResponse.json(await getQuiz());
}
