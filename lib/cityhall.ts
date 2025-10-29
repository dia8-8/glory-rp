export type CityhallKey = 'business' | 'complaint';

export const CITYHALL: Record<
  CityhallKey,
  {
    slug: string;
    titleEn: string;
    titleAr: string;
    descEn: string;
    descAr: string;
    webhookEnv?: string;
    fields: {
      name: string;
      labelEn: string;
      labelAr: string;
      placeholderEn?: string;
      placeholderAr?: string;
      type: 'text' | 'textarea' | 'email' | 'select';
      required?: boolean;
      options?: string[];
    }[];
  }
> = {
  business: {
    slug: 'business',
    titleEn: 'Business License Application',
    titleAr: 'طلب ترخيص تجاري',
    descEn:
      'Apply to open or register a new business within Glory City. Please provide clear and detailed information about your business.',
    descAr:
      'قدّم طلبك لفتح أو تسجيل نشاط تجاري جديد داخل مدينة جلوري. يُرجى إدخال المعلومات بوضوح وتفصيل.',
    webhookEnv: 'DISCORD_CITYHALL_BUSINESS_WEBHOOK',
    fields: [
      {
        name: 'businessName',
        labelEn: 'Business Name',
        labelAr: 'اسم النشاط التجاري',
        placeholderEn: 'e.g. Glory Café',
        placeholderAr: 'مثال: مقهى جلوري',
        type: 'text',
        required: true,
      },
      {
        name: 'ownerName',
        labelEn: 'Owner Name',
        labelAr: 'اسم المالك',
        placeholderEn: 'Your full name',
        placeholderAr: 'اكتب اسمك الكامل',
        type: 'text',
        required: true,
      },
      {
        name: 'type',
        labelEn: 'Business Type',
        labelAr: 'نوع النشاط التجاري',
        type: 'select',
        required: true,
        options: ['Restaurant', 'Store', 'Service', 'Other'],
      },
      {
        name: 'description',
        labelEn: 'Business Description',
        labelAr: 'وصف النشاط التجاري',
        placeholderEn:
          'Describe your business idea, services, or products in detail.',
        placeholderAr:
          'صف فكرتك التجارية أو الخدمات / المنتجات التي ستقدمها.',
        type: 'textarea',
      },
      {
        name: 'contactEmail',
        labelEn: 'Contact Email',
        labelAr: 'البريد الإلكتروني للتواصل',
        placeholderEn: 'example@gloryrp.com',
        placeholderAr: 'example@gloryrp.com',
        type: 'email',
      },
    ],
  },

  complaint: {
    slug: 'complaint',
    titleEn: 'Submit a Complaint',
    titleAr: 'تقديم شكوى',
    descEn:
      'Report an issue, problem, or misconduct to the City Hall. Please include as much detail as possible to help us resolve your complaint.',
    descAr:
      'أبلِغ عن مشكلة أو مخالفة أو سلوك غير لائق إلى بلدية المدينة. يُرجى إدخال التفاصيل الكافية لمساعدتنا في معالجة الشكوى.',
    webhookEnv: 'DISCORD_CITYHALL_COMPLAINT_WEBHOOK',
    fields: [
      {
        name: 'subject',
        labelEn: 'Subject',
        labelAr: 'الموضوع',
        placeholderEn: 'Short title or topic of your complaint',
        placeholderAr: 'اكتب عنواناً مختصراً أو موضوع الشكوى',
        type: 'text',
        required: true,
      },
      {
        name: 'details',
        labelEn: 'Complaint Details',
        labelAr: 'تفاصيل الشكوى',
        placeholderEn: 'Describe what happened, when, and where.',
        placeholderAr: 'اشرح ما حدث ومتى وأين بالتفصيل.',
        type: 'textarea',
        required: true,
      },
      {
        name: 'contact',
        labelEn: 'Contact Info (optional)',
        labelAr: 'معلومات التواصل (اختياري)',
        placeholderEn: 'Discord, phone, or email (optional)',
        placeholderAr: 'ديسكورد أو رقم هاتف أو بريد إلكتروني (اختياري)',
        type: 'text',
      },
    ],
  },
};
