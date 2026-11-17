// Rules quiz — server only. Correct answers never leave the server (except to admins editing the quiz).
// Admins edit the questions at /admin/quiz; the list below is the built-in default used until they save.
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { db } from './db';

type Bi = { en: string; ar: string };
export type QuizQuestion = { id: string; q: Bi; options: Bi[]; answer: number };
export type QuizConfig = { questions: QuizQuestion[]; size: number; passMark: number };
type Question = QuizQuestion;

export const RETRY_WAIT_MS = 2 * 60_000;
const PASS_VALID_MS = 7 * 24 * 3600_000;

export const PASS_COOKIE = 'glory_quiz';
export const WAIT_COOKIE = 'glory_quiz_wait';

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'rdm',
    q: { en: 'What is RDM (Random Deathmatch)?', ar: 'ما هو الـ RDM؟' },
    options: [
      { en: 'Killing someone without a valid reason, threat or conflict', ar: 'قتل شخص بدون سبب أو تهديد أو نزاع واضح' },
      { en: 'Killing someone during an agreed shootout', ar: 'القتل أثناء اشتباك متفق عليه' },
      { en: 'Robbing a store with friends', ar: 'سرقة متجر مع الأصدقاء' },
      { en: 'Driving fast on the highway', ar: 'القيادة بسرعة على الطريق السريع' },
    ],
    answer: 0,
  },
  {
    id: 'vdm',
    q: { en: 'Who is allowed to use a vehicle as a weapon (VDM)?', ar: 'من المسموح له استخدام المركبة كسلاح (VDM)؟' },
    options: [
      { en: 'Only police', ar: 'الشرطة فقط' },
      { en: 'Only EMS', ar: 'الإسعاف فقط' },
      { en: 'Gang members during a war', ar: 'أعضاء العصابات أثناء الحرب' },
      { en: 'Nobody — it is forbidden for everyone', ar: 'لا أحد — ممنوع على الجميع' },
    ],
    answer: 3,
  },
  {
    id: 'meta',
    q: {
      en: 'A friend tells you on Discord where another player is, and you go find them in game. What is this?',
      ar: 'صديقك أخبرك في الديسكورد بمكان لاعب آخر وذهبت إليه داخل اللعبة. ماذا يسمى هذا؟',
    },
    options: [
      { en: 'Good teamwork', ar: 'عمل جماعي جيد' },
      { en: 'Meta gaming — a violation', ar: 'ميتا قيمنق — مخالفة' },
      { en: 'Allowed if it is your friend', ar: 'مسموح إذا كان صديقك' },
      { en: 'Powergaming — allowed', ar: 'باور قيمنق — مسموح' },
    ],
    answer: 1,
  },
  {
    id: 'nlr',
    q: { en: 'What does NLR (New Life Rule) mean after you die?', ar: 'ماذا يعني قانون NLR بعد موتك؟' },
    options: [
      { en: 'You can go back and take revenge', ar: 'يمكنك العودة والانتقام' },
      { en: 'You keep all memories of the scene', ar: 'تحتفظ بكل ذكريات المشهد' },
      { en: 'You forget what happened before death and cannot return to that situation', ar: 'تنسى ما حدث قبل موتك ولا يمكنك العودة لنفس الموقف' },
      { en: 'You must leave the server for an hour', ar: 'يجب أن تخرج من السيرفر لمدة ساعة' },
    ],
    answer: 2,
  },
  {
    id: 'fear',
    q: { en: 'You are unarmed and someone aims a gun at you. What should you do?', ar: 'أنت غير مسلح وشخص يوجه سلاحه عليك. ماذا تفعل؟' },
    options: [
      { en: 'Value your life and comply — don’t resist', ar: 'تقدّر حياتك وتتعاون — لا تقاوم' },
      { en: 'Punch them', ar: 'تضربه بيدك' },
      { en: 'Pull out your own weapon', ar: 'تسحب سلاحك' },
      { en: 'Laugh and walk away', ar: 'تضحك وتمشي' },
    ],
    answer: 0,
  },
  {
    id: 'staff-help',
    q: { en: 'You need help from staff while in game. What is the right way?', ar: 'تحتاج مساعدة من الإدارة داخل اللعبة. ما الطريقة الصحيحة؟' },
    options: [
      { en: 'Send an admin a private message', ar: 'ترسل رسالة خاصة لأحد الأدمن' },
      { en: 'Ask staff for help inside the roleplay', ar: 'تطلب المساعدة من الإدارة داخل الرول بلاي' },
      { en: 'Use /report in game or open a Discord ticket', ar: 'تستخدم /report داخل اللعبة أو تفتح تذكرة في الديسكورد' },
      { en: 'Stop the scene and shout for an admin', ar: 'توقف المشهد وتنادي على الأدمن' },
    ],
    answer: 2,
  },
  {
    id: 'failrp-report',
    q: { en: 'You see someone break the rules (Fail RP) during a scenario. What do you do?', ar: 'رأيت شخصًا يخالف القوانين (Fail RP) أثناء سيناريو. ماذا تفعل؟' },
    options: [
      { en: 'Shout "Fail RP" in the scene', ar: 'تقول "فيل آر بي" داخل المشهد' },
      { en: 'Finish the scenario, then open a ticket with evidence', ar: 'تكمل السيناريو ثم تفتح تذكرة مع الدليل' },
      { en: 'Leave the game immediately', ar: 'تخرج من اللعبة فورًا' },
      { en: 'DM an admin right away', ar: 'تراسل الأدمن فورًا' },
    ],
    answer: 1,
  },
  {
    id: 'safezone',
    q: { en: 'Which of these is a safe (green) zone?', ar: 'أي من هذه منطقة آمنة (خضراء)؟' },
    options: [
      { en: 'The hospital', ar: 'المستشفى' },
      { en: 'A gang HQ', ar: 'مقر العصابة' },
      { en: 'The highway', ar: 'الطريق السريع' },
      { en: 'A red zone', ar: 'المنطقة الحمراء' },
    ],
    answer: 0,
  },
  {
    id: 'eight',
    q: { en: 'What is the maximum number of participants in any criminal scenario?', ar: 'ما الحد الأقصى لعدد المشاركين في أي سيناريو إجرامي؟' },
    options: [
      { en: '4', ar: '4' },
      { en: '6', ar: '6' },
      { en: '8', ar: '8' },
      { en: 'No limit', ar: 'بدون حد' },
    ],
    answer: 2,
  },
  {
    id: 'ransom',
    q: { en: 'What is the maximum ransom when kidnapping a civilian?', ar: 'ما الحد الأقصى للفدية عند خطف مدني؟' },
    options: [
      { en: '$30,000', ar: '30,000$' },
      { en: '$70,000', ar: '70,000$' },
      { en: '$150,000', ar: '150,000$' },
      { en: 'Any amount', ar: 'أي مبلغ' },
    ],
    answer: 1,
  },
  {
    id: 'kidnap-police',
    q: { en: 'How many police must be online to kidnap a civilian?', ar: 'كم شرطي يجب أن يكون متواجدًا لخطف مدني؟' },
    options: [
      { en: 'At least 1', ar: '1 على الأقل' },
      { en: 'At least 2', ar: '2 على الأقل' },
      { en: 'At least 4', ar: '4 على الأقل' },
      { en: 'None needed', ar: 'لا يشترط' },
    ],
    answer: 2,
  },
  {
    id: 'combat-log',
    q: { en: 'What is Combat Logging?', ar: 'ما هو الـ Combat Logging؟' },
    options: [
      { en: 'Recording a fight on video', ar: 'تصوير القتال فيديو' },
      { en: 'Leaving the game to heal, escape or avoid an active scene', ar: 'الخروج من اللعبة للعلاج أو الهروب أو تجنب مشهد نشط' },
      { en: 'Writing a report after a fight', ar: 'كتابة تقرير بعد القتال' },
      { en: 'Joining a gang war', ar: 'المشاركة في حرب عصابات' },
    ],
    answer: 1,
  },
  {
    id: 'ck',
    q: { en: 'What is needed to execute (permanently kill) a character?', ar: 'ماذا يلزم لإعدام شخصية (قتل نهائي)؟' },
    options: [
      { en: 'Nothing, if you won the fight', ar: 'لا شيء إذا فزت بالقتال' },
      { en: 'Approval from your gang leader', ar: 'موافقة قائد عصابتك' },
      { en: 'Godfather approval and a strong roleplay reason', ar: 'موافقة الـ Godfather وسبب رول بلاي قوي' },
      { en: 'Permission from the police', ar: 'إذن من الشرطة' },
    ],
    answer: 2,
  },
  {
    id: 'war',
    q: { en: 'What does a gang war require?', ar: 'ماذا تتطلب حرب العصابات؟' },
    options: [
      { en: 'Admin approval', ar: 'موافقة الإدارة' },
      { en: 'Only that both gangs are online', ar: 'فقط أن تكون العصابتان متواجدتين' },
      { en: 'At least 20 members per gang', ar: '20 عضوًا على الأقل لكل عصابة' },
      { en: 'Nothing — it can start any time', ar: 'لا شيء — يمكن أن تبدأ في أي وقت' },
    ],
    answer: 0,
  },
  {
    id: 'mixing',
    q: { en: 'Which of these is "Mixing" (not allowed)?', ar: 'أي مما يلي يعتبر "Mixing" (ممنوع)؟' },
    options: [
      { en: 'Playing two different jobs on one character', ar: 'العمل في وظيفتين بنفس الشخصية' },
      { en: 'Using two of your characters in the same scenario or moving items between them', ar: 'استخدام شخصيتين لك في نفس السيناريو أو نقل الممتلكات بينهما' },
      { en: 'Talking in English and Arabic', ar: 'التحدث بالعربي والإنجليزي' },
      { en: 'Changing your outfit', ar: 'تغيير ملابسك' },
    ],
    answer: 1,
  },
  {
    id: 'stream-snipe',
    q: { en: 'Watching someone’s live stream to find them in game is called…', ar: 'مشاهدة بث شخص لمعرفة مكانه داخل اللعبة يسمى…' },
    options: [
      { en: 'Stream sniping — forbidden', ar: 'Stream Sniping — ممنوع' },
      { en: 'Supporting creators — allowed', ar: 'دعم صناع المحتوى — مسموح' },
      { en: 'Allowed if they are in another gang', ar: 'مسموح إذا كان من عصابة أخرى' },
      { en: 'Only forbidden for police', ar: 'ممنوع على الشرطة فقط' },
    ],
    answer: 0,
  },
];

/** Built-in quiz: every question above, 10 asked per attempt, 8 needed to pass. */
export const DEFAULT_QUIZ: QuizConfig = { questions: DEFAULT_QUESTIONS, size: 10, passMark: 8 };

/* ───────── Loading & saving (admin-edited quiz lives in site_settings, key 'quiz') ───────── */

export async function getQuiz(): Promise<{ config: QuizConfig; source: 'database' | 'default' }> {
  const client = db();
  if (client) {
    const { data, error } = await client.from('site_settings').select('value').eq('key', 'quiz').maybeSingle();
    if (!error && data?.value) {
      const v = validateQuiz(data.value);
      if ('config' in v) return { config: v.config, source: 'database' };
    }
  }
  return { config: DEFAULT_QUIZ, source: 'default' };
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Cleans what an admin sends. Returns a safe config or a readable error. */
export function validateQuiz(input: unknown): { config: QuizConfig } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const list = Array.isArray(raw.questions) ? raw.questions : null;
  if (!list || list.length === 0) return { error: 'Add at least one question.' };
  if (list.length > 100) return { error: 'Maximum 100 questions.' };

  const ids = new Set<string>();
  const questions: QuizQuestion[] = [];
  for (const [i, item] of list.entries()) {
    const r = (item ?? {}) as Record<string, any>;
    const n = i + 1;
    const q = { en: text(r.q?.en, 300), ar: text(r.q?.ar, 300) };
    if (!q.en || !q.ar) return { error: `Question ${n}: write it in English and Arabic.` };
    const options = (Array.isArray(r.options) ? r.options : []).map((o: any) => ({ en: text(o?.en, 200), ar: text(o?.ar, 200) }));
    if (options.length < 2 || options.length > 6) return { error: `Question ${n}: needs 2 to 6 answers.` };
    if (options.some((o: Bi) => !o.en || !o.ar)) return { error: `Question ${n}: every answer needs English and Arabic text.` };
    const answer = Number(r.answer);
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return { error: `Question ${n}: mark the correct answer.` };
    let id = text(r.id, 40).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!id || ids.has(id)) id = 'q_' + randomBytes(4).toString('hex');
    ids.add(id);
    questions.push({ id, q, options, answer });
  }

  const size = Number(raw.size);
  const passMark = Number(raw.passMark);
  if (!Number.isInteger(size) || size < 1 || size > Math.min(30, questions.length))
    return { error: `Questions per attempt must be between 1 and ${Math.min(30, questions.length)}.` };
  if (!Number.isInteger(passMark) || passMark < 1 || passMark > size)
    return { error: `Correct answers needed must be between 1 and ${size}.` };
  return { config: { questions, size, passMark } };
}

/* ───────── Question selection ───────── */

export type PublicQuestion = { id: string; q: Bi; options: Bi[] };

/** A random set of `size` questions, without the answers. */
export function drawQuestions(config: QuizConfig): PublicQuestion[] {
  const pool = [...config.questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, config.size).map(({ id, q, options }) => ({ id, q, options }));
}

/** answers: { [questionId]: chosenIndex }. Must answer exactly `size` real questions. */
export function grade(answers: Record<string, number>, config: QuizConfig) {
  const ids = Object.keys(answers);
  const total = config.size;
  if (ids.length !== total) return { score: 0, total, passed: false, wrong: [] as string[] };
  let score = 0;
  const wrong: string[] = [];
  for (const id of ids) {
    const q = config.questions.find((x) => x.id === id);
    if (q && Number(answers[id]) === q.answer) score++;
    else wrong.push(id);
  }
  return { score, total, passed: score >= config.passMark, wrong };
}

/* ───────── Signed cookies (HMAC with NEXTAUTH_SECRET) ───────── */

function sign(payload: string) {
  return createHmac('sha256', process.env.NEXTAUTH_SECRET || 'dev-secret').update(payload).digest('base64url');
}

function makeToken(discordId: string, until: number) {
  const payload = `${discordId}.${until}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the expiry time if the token is valid for this user, else 0. */
function readToken(token: string | undefined, discordId: string) {
  if (!token) return 0;
  const parts = token.split('.');
  if (parts.length !== 3) return 0;
  const [id, until, sig] = parts;
  if (id !== discordId) return 0;
  const good = sign(`${id}.${until}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(good);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return 0;
  const t = Number(until);
  return t > Date.now() ? t : 0;
}

export const passToken = (discordId: string) => makeToken(discordId, Date.now() + PASS_VALID_MS);
export const waitToken = (discordId: string) => makeToken(discordId, Date.now() + RETRY_WAIT_MS);
export const hasPassed = (token: string | undefined, discordId: string) => readToken(token, discordId) > 0;
/** ms left before the user may retry, 0 if they can try now */
export const waitLeft = (token: string | undefined, discordId: string) => {
  const t = readToken(token, discordId);
  return t ? t - Date.now() : 0;
};
