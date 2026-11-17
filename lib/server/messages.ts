// Player-facing messages for decisions and new submissions.
// One source for both the Discord DM and the on-site notification, so they always match.
import { SITE } from '@/lib/site';
import { JOBS } from '@/lib/jobs';
import { TICKETS } from '@/lib/tickets';
import { CITYHALL } from '@/lib/cityhall';
import type { Submission, SubmissionKind, SubmissionStatus } from './db';

type Bi = { en: string; ar: string };
export type Message = { icon: string; title: Bi; body: Bi; link: string };

function categoryName(kind: SubmissionKind, category: string): Bi {
  if (kind === 'interview') return { en: 'join interview', ar: 'مقابلة الانضمام' };
  const src = (kind === 'job' ? JOBS : kind === 'ticket' ? TICKETS : CITYHALL) as Record<string, any>;
  const c = src[category];
  return { en: c?.titleEn ?? category, ar: c?.titleAr ?? category };
}

/** Message sent when staff make a decision. */
export function decisionMessage(sub: Pick<Submission, 'kind' | 'category'>, status: SubmissionStatus): Message {
  const name = categoryName(sub.kind, sub.category);
  const link = '/status';

  if (sub.kind === 'interview') {
    if (status === 'accepted')
      return {
        icon: '✅',
        title: { en: 'Your join interview was accepted!', ar: 'تم قبول مقابلة الانضمام!' },
        body: { en: 'Welcome to the city.', ar: 'مرحبًا بك في جلوري.' },
        link,
      };
    if (status === 'under18')
      return {
        icon: '🔞',
        title: { en: 'You must be 18 or older', ar: 'يجب أن يكون عمرك 18 سنة أو أكثر' },
        body: { en: 'You can apply again once you turn 18.', ar: 'يمكنك التقديم مجددًا عند بلوغك 18.' },
        link,
      };
    if (status === 'rejected')
      return {
        icon: '❌',
        title: { en: 'Your join interview was not accepted', ar: 'لم يتم قبول مقابلة الانضمام' },
        body: { en: 'You can apply again in 24 hours.', ar: 'يمكنك التقديم مجددًا بعد 24 ساعة.' },
        link,
      };
  }

  if (sub.kind === 'job') {
    if (status === 'accepted')
      return {
        icon: '✅',
        title: { en: `Your ${name.en} application was accepted!`, ar: `تم قبول طلبك في ${name.ar}!` },
        body: { en: 'Staff will contact you with the next steps.', ar: 'ستتواصل معك الإدارة بالخطوات القادمة.' },
        link: '/jobs',
      };
    return {
      icon: '❌',
      title: { en: `Your ${name.en} application was not accepted`, ar: `لم يتم قبول طلبك في ${name.ar}` },
      body: { en: 'Thanks for applying.', ar: 'شكرًا لتقديمك.' },
      link: '/jobs',
    };
  }

  // tickets & city hall
  return {
    icon: '📬',
    title: { en: `Your ${name.en} request was updated`, ar: `تم تحديث طلبك: ${name.ar}` },
    body: { en: 'Staff reviewed and closed your request.', ar: 'راجعت الإدارة طلبك وتم إغلاقه.' },
    link: '/',
  };
}

/** Message shown on the site right after a player submits something. */
export function receivedMessage(kind: SubmissionKind, category: string): Message {
  const name = categoryName(kind, category);
  return {
    icon: '📨',
    title: { en: `We received your ${name.en}`, ar: `تم استلام ${name.ar}` },
    body: { en: 'Staff will review it soon. You’ll be notified here.', ar: 'ستراجعه الإدارة قريبًا وسيصلك إشعار هنا.' },
    link: kind === 'interview' ? '/status' : '/',
  };
}

/** Discord DM text (both languages + optional staff note + full link). */
export function dmText(m: Message, note?: string) {
  const reason = note ? `\n\n📝 ${note}` : '';
  // add a full stop between title and body unless the title already ends with punctuation
  const join = (title: string, body: string) => (/[.!?؟]$/.test(title) ? `${title} ${body}` : `${title}. ${body}`);
  return `${m.icon} **Glory RP** — ${join(m.title.en, m.body.en)}\n${m.icon} ${join(m.title.ar, m.body.ar)}${reason}\n${SITE.url}${m.link}`;
}
