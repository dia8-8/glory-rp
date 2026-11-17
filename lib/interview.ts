// Interview questions: defaults + validation. Shared by server and client (no secrets here).
import type { Field } from './jobs';

export type InterviewField = Field;

/** The original interview questions — used until an admin saves a custom set. */
export const DEFAULT_INTERVIEW_FIELDS: InterviewField[] = [
  { type: 'text', name: 'name', required: true, labelEn: 'Your character name', labelAr: 'اسم شخصيتك', placeholderEn: 'Must be a real name', placeholderAr: 'يجب أن يكون الاسم الحقيقي' },
  { type: 'number', name: 'age', required: true, labelEn: 'Age', labelAr: 'العمر', min: 16 },
  {
    type: 'select', name: 'mic', required: true, labelEn: 'Do you have a microphone?', labelAr: 'هل لديك مايكروفون؟',
    options: [
      { value: 'yes', labelEn: 'Yes', labelAr: 'نعم' },
      { value: 'no', labelEn: 'No', labelAr: 'لا' },
    ],
  },
  { type: 'textarea', name: 'experience', required: true, labelEn: 'Your RP experience', labelAr: 'خبرتك السابقة في RP' },
  { type: 'text', name: 'steam', required: true, labelEn: 'Steam link', labelAr: 'رابط Steam', placeholderEn: 'https://...', placeholderAr: 'https://...' },
  { type: 'textarea', name: 'about', required: true, labelEn: 'Your character story', labelAr: 'قصة شخصيتك' },
];

export const FIELD_TYPES = ['text', 'number', 'textarea', 'select'] as const;
const RESERVED = new Set(['rulesOk', 'discord', 'discord_id']);
const MAX_FIELDS = 25; // Discord embeds allow 25 fields

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Cleans admin input. Returns the safe field list, or an error message. */
export function validateFields(input: unknown): { fields: InterviewField[] } | { error: string } {
  if (!Array.isArray(input) || input.length === 0) return { error: 'Add at least one question.' };
  if (input.length > MAX_FIELDS) return { error: `Maximum ${MAX_FIELDS} questions.` };

  const out: InterviewField[] = [];
  const names = new Set<string>();
  for (const [i, raw] of input.entries()) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const type = FIELD_TYPES.includes(r.type as any) ? (r.type as InterviewField['type']) : null;
    const name = str(r.name, 40).replace(/[^a-zA-Z0-9_]/g, '');
    const labelEn = str(r.labelEn, 200);
    const labelAr = str(r.labelAr, 200);
    const n = i + 1;
    if (!type) return { error: `Question ${n}: choose a type.` };
    if (!name) return { error: `Question ${n}: the key may only use letters, numbers and _.` };
    if (RESERVED.has(name)) return { error: `Question ${n}: "${name}" is reserved.` };
    if (names.has(name)) return { error: `Question ${n}: key "${name}" is used twice.` };
    if (!labelEn || !labelAr) return { error: `Question ${n}: fill in both English and Arabic text.` };
    names.add(name);

    const base = { name, required: r.required !== false, labelEn, labelAr };
    if (type === 'select') {
      const options = (Array.isArray(r.options) ? r.options : [])
        .map((o: any) => ({ value: str(o?.value, 60) || str(o?.labelEn, 60), labelEn: str(o?.labelEn, 100), labelAr: str(o?.labelAr, 100) }))
        .filter((o) => o.value && o.labelEn && o.labelAr)
        .slice(0, 20);
      if (options.length < 2) return { error: `Question ${n}: a choice question needs at least 2 options (English and Arabic).` };
      out.push({ ...base, type, options });
    } else {
      const field: any = { ...base, type };
      const pEn = str(r.placeholderEn, 200);
      const pAr = str(r.placeholderAr, 200);
      if (pEn) field.placeholderEn = pEn;
      if (pAr) field.placeholderAr = pAr;
      if (type === 'number') {
        if (r.min !== undefined && r.min !== '' && Number.isFinite(Number(r.min))) field.min = Number(r.min);
        if (r.max !== undefined && r.max !== '' && Number.isFinite(Number(r.max))) field.max = Number(r.max);
      }
      out.push(field);
    }
  }
  return { fields: out };
}
