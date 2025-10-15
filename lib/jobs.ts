export type JobKey = 'police' | 'ems' | 'justice' | 'mechanic';

export type Field =
  | { type: 'text' | 'number'; name: string; required?: boolean;
      labelEn: string; labelAr: string; placeholderEn?: string; placeholderAr?: string; min?: number; max?: number }
  | { type: 'textarea'; name: string; required?: boolean;
      labelEn: string; labelAr: string; placeholderEn?: string; placeholderAr?: string }
  | { type: 'select'; name: string; required?: boolean;
      labelEn: string; labelAr: string;
      options: { value: string; labelEn: string; labelAr: string }[] };

export const JOBS: Record<JobKey, {
  slug: JobKey;
  webhookEnv: string;
  titleEn: string; titleAr: string;
  descEn: string;  descAr: string;
  fields: Field[];
  embedImage?: string;
  mentionRoleId?: string;
  mentionRoles?: string[];
}> = {
  police: {
    slug: 'police',
    webhookEnv: 'DISCORD_WEBHOOK_POLICE',
    titleEn: 'Police',
    titleAr: 'الشرطة',
    descEn: 'Serve and protect the city. Training provided; experience preferred.',
    descAr: 'خدمة وحماية المدينة. توجد تدريبات، والخبرة ميزة.',
    embedImage: '/bg.png', 
    mentionRoleId: '1427851125830451210',
    fields: [
      { type: 'text', name: 'discord', required: true, labelEn: 'Discord', labelAr: 'دسكورد', placeholderEn: 'username', placeholderAr: 'اسم المستخدم' },
      { type: 'text', name: 'name', required: true, labelEn: 'Full Name', labelAr: 'الاسم الكامل' },
      { type: 'number', name: 'age', required: true, min: 18, labelEn: 'Age', labelAr: 'العمر' },
      { type: 'text', name: 'callsign', labelEn: 'Preferred Callsign', labelAr: 'النداء المفضل' },
      { type: 'number', name: 'city_hours', min: 0, labelEn: 'Estimated City Hours', labelAr: 'عدد ساعاتك بالمدينة (تقديري)' },
      { type: 'textarea', name: 'about', required: true, labelEn: 'Tell us about your experience if any & Why do you want to join?', labelAr: 'أخبرنا عن تجربتك إن وجدت ولماذا تريد الانضمام؟' },
    ],
  },
  ems: {
    slug: 'ems',
    webhookEnv: 'DISCORD_WEBHOOK_EMS',
    titleEn: 'EMS',
    titleAr: 'الإسعاف',
    descEn: 'Respond to emergencies and save lives. Calm and professionalism.',
    descAr: 'الاستجابة للطوارئ وإنقاذ الأرواح. الهدوء والاحترافية مطلوبة.',
    embedImage: '/bg.png', 
    mentionRoleId: '1427851166485712966',
    fields: [
      { type: 'text', name: 'discord', required: true, labelEn: 'Discord', labelAr: 'دسكورد' },
      { type: 'text', name: 'name', required: true, labelEn: 'Full Name', labelAr: 'الاسم الكامل' },
      { type: 'number', name: 'age', required: true, min: 16, labelEn: 'Age', labelAr: 'العمر' },
      { type: 'text', name: 'certs', labelEn: 'Medical Certs (if any)', labelAr: 'شهادات طبية (إن وجدت)' },
      { type: 'textarea', name: 'about', required: true, labelEn: 'Tell us about your EMS experience', labelAr: 'حدثنا عن خبرتك بالإسعاف' },
    ],
  },
  mechanic: {
    slug: 'mechanic',
    webhookEnv: 'DISCORD_WEBHOOK_MECHANIC',
    titleEn: 'Mechanic',
    titleAr: 'الميكانيكي',
    descEn: 'Keep the city moving. Repairs, tuning, and customer service.',
    descAr: 'حافظ على حركة المدينة. إصلاحات وتعديل وخدمة العملاء.',
    embedImage: '/bg.png', 
    mentionRoleId: '1427851199020793867',
    fields: [
      
      { type: 'text', name: 'discord', required: true, labelEn: 'Discord', labelAr: 'دسكورد' },
      { type: 'text', name: 'name', required: true, labelEn: 'Full Name', labelAr: 'الاسم الكامل' },
      { type: 'number', name: 'age', required: true, min: 16, labelEn: 'Age', labelAr: 'العمر' },
      { type: 'textarea', name: 'skills', required: true, labelEn: 'Mechanical skills', labelAr: 'مهاراتك الميكانيكية' },
      { type: 'textarea', name: 'about', required: true, labelEn: 'Why this role?', labelAr: 'لماذا هذا الدور؟' },
    ],
  },
  justice: {
    slug: 'justice',
    webhookEnv: 'DISCORD_WEBHOOK_JUSTICE',
    titleEn: 'Justice',
    titleAr: 'العدالة',
    descEn: 'Lawyers, prosecutors, and judges ensuring fair play.',
    descAr: 'محامون، وكلاء نيابة، وقضاة لضمان العدالة.',
    embedImage: '/bg.png', 
    mentionRoleId: '1427851241459023892',
    fields: [
      
      { type: 'text', name: 'discord', required: true, labelEn: 'Discord', labelAr: 'دسكورد' },
      { type: 'text', name: 'name', required: true, labelEn: 'Full Name', labelAr: 'الاسم الكامل' },
      { type: 'number', name: 'age', required: true, min: 18, labelEn: 'Age', labelAr: 'العمر' },
      {
        type: 'select', name: 'specialty', required: true,
        labelEn: 'Specialty', labelAr: 'التخصص',
        options: [
          { value: 'lawyer', labelEn: 'Lawyer', labelAr: 'محامي' },
          { value: 'prosecutor', labelEn: 'Prosecutor', labelAr: 'وكيل نيابة' },
          { value: 'judge', labelEn: 'Judge', labelAr: 'قاضي' },
        ],
      },
      { type: 'textarea', name: 'about', required: true, labelEn: 'Relevant experience', labelAr: 'الخبرة ذات الصلة' },
    ],
  },
};
