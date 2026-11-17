// Join interview questions. Shared by the form (client) and the API (server). Edit here to change them.
import type { Field } from './jobs';

export type InterviewField = Field;

/** The interview questions, in order. The "I read the rules" checkbox is always added after them. */
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
