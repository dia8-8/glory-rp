export type CityhallKey = 'business' | 'complaint';

export const CITYHALL: Record<CityhallKey, any> = {
  business: {
    slug: 'business',
    titleEn: 'Business License Application',
    titleAr: 'طلب ترخيص تجاري',
    descEn: 'Apply to open or register a new business within Glory City.',
    descAr: 'قدّم طلبك لفتح أو تسجيل نشاط تجاري جديد داخل مدينة جلوري.',
    webhookEnv: 'DISCORD_CITYHALL_BUSINESS_WEBHOOK',
    fields: [
      { name: 'businessName', labelEn: 'Business Name', labelAr: 'اسم النشاط التجاري', type: 'text', required: true },
      { name: 'ownerName', labelEn: 'Owner Name', labelAr: 'اسم المالك', type: 'text', required: true },
      { name: 'type', labelEn: 'Business Type', labelAr: 'نوع النشاط', type: 'select', required: true, options: ['Restaurant', 'Store', 'Service', 'Other'] },
      { name: 'description', labelEn: 'Description', labelAr: 'الوصف', type: 'textarea' },
    ],
  },
  complaint: {
    slug: 'complaint',
    titleEn: 'Submit a Complaint',
    titleAr: 'تقديم شكوى',
    descEn: 'Report a problem or submit a complaint to the City Hall.',
    descAr: 'أبلغ عن مشكلة أو قدّم شكوى إلى بلدية المدينة.',
    webhookEnv: 'DISCORD_CITYHALL_COMPLAINT_WEBHOOK',
    fields: [
      { name: 'subject', labelEn: 'Subject', labelAr: 'الموضوع', type: 'text', required: true },
      { name: 'details', labelEn: 'Details', labelAr: 'التفاصيل', type: 'textarea', required: true },
      { name: 'contact', labelEn: 'Contact Info (optional)', labelAr: 'معلومات التواصل (اختياري)', type: 'text' },
    ],
  },
};

