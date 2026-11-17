import { NextResponse } from 'next/server';
import { requireAdmin, dbError } from '@/lib/server/guard';
import { getInterviewFields } from '@/lib/server/content';
import { validateFields } from '@/lib/interview';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await requireAdmin();
  if (g.error) return g.error;
  return NextResponse.json(await getInterviewFields());
}

/** PUT { fields } → saves the interview questions */
export async function PUT(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  const v = validateFields(body.fields);
  if ('error' in v) return NextResponse.json({ error: v.error }, { status: 400 });

  const { error } = await g.client
    .from('site_settings')
    .upsert({ key: 'interview_fields', value: v.fields, updated_by: g.who, updated_at: new Date().toISOString() });
  if (error) return dbError(error.message);
  return NextResponse.json(await getInterviewFields());
}

/** DELETE → back to the original questions */
export async function DELETE() {
  const g = await requireAdmin();
  if (g.error) return g.error;
  const { error } = await g.client.from('site_settings').delete().eq('key', 'interview_fields');
  if (error) return dbError(error.message);
  return NextResponse.json(await getInterviewFields());
}
