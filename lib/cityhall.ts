export type CityhallKey = 'business' | 'complaint';

export const CITYHALL: Record<CityhallKey, any> = {
  business: {
    slug: 'business',
    titleEn: 'Business License Application',
    titleAr: 'طلب ترخيص تجاري',
    descEn:
      'Apply for a business permit within the city. Please fill in all the required details accurately.',
    descAr:
      'قدّم طلب ترخيص تجاري داخل المدينة. يُرجى تعبئة جميع البيانات المطلوبة بدقة.',
    webhookEnv: 'DISCORD_CITYHALL_BUSINESS_WEBHOOK',
    fields: [
      {
        name: 'fullName',
        labelEn: 'Full Name in City',
        labelAr: 'الاسم الكامل داخل المدينة',
        placeholderEn: 'Enter your full in-city name',
        placeholderAr: 'اكتب اسمك الكامل داخل المدينة',
        type: 'text',
        required: true,
      },
      {
        name: 'idNumber',
        labelEn: 'Citizen ID / Plate Number',
        labelAr: 'رقم الهوية / رقم اللوحة',
        placeholderEn: 'Enter your ID or vehicle plate number',
        placeholderAr: 'اكتب رقم الهوية أو رقم اللوحة',
        type: 'text',
        required: true,
      },
      {
        name: 'currentJob',
        labelEn: 'Current Occupation',
        labelAr: 'المهنة الحالية',
        placeholderEn: 'Enter your current job or position',
        placeholderAr: 'اكتب مهنتك الحالية',
        type: 'text',
        required: true,
      },
      {
        name: 'workDuration',
        labelEn: 'Work Duration (days or weeks)',
        labelAr: 'مدة العمل في المهنة (بالأيام أو الأسابيع)',
        placeholderEn: 'e.g. 5 days, 2 weeks',
        placeholderAr: 'مثال: ٥ أيام أو أسبوعين',
        type: 'text',
        required: true,
      },
      {
        name: 'criminalRecord',
        labelEn: 'Do you have a criminal record?',
        labelAr: 'هل لديك سجلّ جنائي؟',
        type: 'select',
        required: true,
        options: ['Yes', 'No'],
      },
    ],
  },

  complaint: {
    slug: 'complaint',
    titleEn: 'Submit a Complaint',
    titleAr: 'تقديم شكوى',
    descEn:
      'Report an issue or misconduct to the City Hall. Please describe your case in detail.',
    descAr:
      'أبلِغ عن مشكلة أو مخالفة إلى بلدية المدينة. يُرجى وصف حالتك بالتفصيل.',
    webhookEnv: 'DISCORD_CITYHALL_COMPLAINT_WEBHOOK',
    fields: [
      {
        name: 'subject',
        labelEn: 'Subject',
        labelAr: 'الموضوع',
        placeholderEn: 'Enter the title of your complaint',
        placeholderAr: 'اكتب عنوان الشكوى',
        type: 'text',
        required: true,
      },
      {
        name: 'details',
        labelEn: 'Details',
        labelAr: 'تفاصيل الشكوى',
        placeholderEn: 'Provide all relevant details about your complaint',
        placeholderAr: 'اكتب تفاصيل الشكوى بشكل كامل',
        type: 'textarea',
        required: true,
      },
      {
        name: 'contact',
        labelEn: 'Contact Information (optional)',
        labelAr: 'معلومات التواصل (اختياري)',
        placeholderEn: 'Discord / Email / Phone',
        placeholderAr: 'ديسكورد / البريد / رقم الهاتف',
        type: 'text',
      },
    ],
  },
};

