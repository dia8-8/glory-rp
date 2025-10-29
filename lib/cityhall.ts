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
    mentionRoleId: process.env.DISCORD_ROLEID_BUSINESS, // ✅ new
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
        labelEn: 'Citizen ID',
        labelAr: 'رقم الهوية',
        placeholderEn: 'Enter your citizen ID',
        placeholderAr: 'اكتب رقم الهوية',
        type: 'text',
        required: true,
      },
      {
        name: 'currentJob',
        labelEn: 'Current Job',
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
      // ---------------- Project Info ----------------
      {
        name: 'projectName',
        labelEn: 'Proposed Project Name',
        labelAr: 'اسم المشروع المقترح',
        placeholderEn: 'Enter the name of your proposed project',
        placeholderAr: 'اكتب اسم المشروع المقترح',
        type: 'text',
        required: true,
      },
      {
        name: 'projectType',
        labelEn: 'Type of Project (e.g. restaurant, workshop, shop, office)',
        labelAr: 'نوع المشروع (مطعم، ورشة، متجر، مكتب... إلخ)',
        placeholderEn: 'Enter the type of your project',
        placeholderAr: 'اكتب نوع المشروع',
        type: 'text',
        required: true,
      },
      {
        name: 'projectDescription',
        labelEn: 'Brief Description of Project Idea',
        labelAr: 'وصف مختصر لفكرة المشروع',
        placeholderEn: 'Explain your project idea briefly',
        placeholderAr: 'اشرح فكرة المشروع بشكل مختصر',
        type: 'textarea',
        required: true,
      },
      {
        name: 'projectLocation',
        labelEn: 'Proposed Project Location',
        labelAr: 'الموقع المقترح للمشروع',
        placeholderEn: 'Enter the proposed location',
        placeholderAr: 'اكتب الموقع المقترح للمشروع',
        type: 'text',
        required: true,
      },
      {
        name: 'requestedLoan',
        labelEn: 'Requested Loan Amount',
        labelAr: 'المبلغ المطلوب للقرض',
        placeholderEn: 'Enter the amount you want to borrow',
        placeholderAr: 'اكتب المبلغ المطلوب للقرض',
        type: 'number',
        required: true,
      },
      {
        name: 'availableFunds',
        labelEn: 'Available Funds (at least 20% of the requested loan)',
        labelAr:
          'المبلغ المتوفر حالياً (يجب ألا يقل عن 20٪ من المبلغ المطلوب)',
        placeholderEn: 'Enter your current available funds',
        placeholderAr: 'اكتب المبلغ المتوفر حالياً',
        type: 'number',
        required: true,
      },
      {
        name: 'employees',
        labelEn: 'Expected Number of Employees',
        labelAr: 'عدد الموظفين المتوقع تشغيلهم',
        placeholderEn: 'Enter expected employee count',
        placeholderAr: 'اكتب عدد الموظفين المتوقع تشغيلهم',
        type: 'number',
        required: true,
      },
      {
        name: 'repaymentPlan',
        labelEn: 'Loan Repayment Plan (e.g. every 2 weeks)',
        labelAr: 'خطة تسديد القرض (كل أسبوعين)',
        placeholderEn: 'Describe your repayment plan',
        placeholderAr: 'اشرح خطة تسديد القرض',
        type: 'text',
        required: true,
      },

      // ---------------- Confirmation Section ----------------
      {
        name: 'confirmation',
        labelEn:
          'I confirm that all the above information is correct and I accept full legal responsibility for any false statements.',
        labelAr:
          'أقرّ بأن جميع المعلومات المذكورة أعلاه صحيحة، وأتحمل المسؤولية القانونية الكاملة في حال ثبوت خلاف ذلك.',
        type: 'checkbox',
        required: true,
      },
      {
        name: 'submissionDate',
        labelEn: 'Date of Submission',
        labelAr: 'تاريخ التقديم',
        placeholderEn: 'yyyy-mm-dd',
        placeholderAr: 'yyyy-mm-dd',
        type: 'text',
        required: true,
      },
      {
        name: 'signature',
        labelEn: 'Signature',
        labelAr: 'التوقيع',
        placeholderEn: 'Type your full name as a signature',
        placeholderAr: 'اكتب اسمك الكامل كتوقيع',
        type: 'text',
        required: true,
      },
    ],
  },

  complaint: {
  slug: 'complaint',
  titleEn: 'Submit a Complaint',
  titleAr: 'تقديم شكوى',
  descEn:
    'Report an issue to the City Hall. Choose whether your complaint is against a government agency or a project.',
  descAr:
    'قدّم شكوى إلى بلدية المدينة. اختر نوع الشكوى أولاً — ضد جهة حكومية أو ضد مشروع.',
  webhookEnv: 'DISCORD_CITYHALL_COMPLAINT_WEBHOOK',
  mentionRoleId: process.env.DISCORD_ROLEID_COMPLAINT,
  fields: [
    {
      name: 'complaintType',
      labelEn: 'Complaint Type',
      labelAr: 'نوع الشكوى',
      type: 'select',
      required: true,
      options: [
        { value: 'gov', labelEn: 'Against a Government Agency', labelAr: 'شكوى ضد جهة حكومية' },
        { value: 'project', labelEn: 'Against a Project', labelAr: 'شكوى ضد مشروع' },
      ],
    },

    // 🟣 Government Complaint Fields
    {
      name: 'govDepartment',
      labelEn: 'Government Department',
      labelAr: 'الجهة الحكومية',
      type: 'select',
      required: true,
      options: [
        { value: 'interior', labelEn: 'Ministry of Interior', labelAr: 'وزارة الداخلية' },
        { value: 'health', labelEn: 'Ministry of Health', labelAr: 'وزارة الصحة' },
      ],
      showIf: { complaintType: 'gov' },
    },
    {
      name: 'complainantName',
      labelEn: 'Complainant Name',
      labelAr: 'اسم المشتكي',
      type: 'text',
      required: true,
    },
    {
      name: 'age',
      labelEn: 'Age',
      labelAr: 'العمر',
      type: 'number',
      required: true,
    },
    {
      name: 'phone',
      labelEn: 'In-city Phone Number',
      labelAr: 'رقم الهاتف في المدينة',
      type: 'text',
      required: true,
    },
    {
      name: 'idNumber',
      labelEn: 'Citizen ID',
      labelAr: 'رقم الهوية',
      type: 'text',
      required: true,
    },

    // ---- Govt Only ----
    {
      name: 'accusedName',
      labelEn: 'Accused Person Name',
      labelAr: 'اسم المشتكى عليه',
      type: 'text',
      required: true,
      showIf: { complaintType: 'gov' },
    },
    {
      name: 'accusedRank',
      labelEn: 'Rank',
      labelAr: 'الرتبة',
      type: 'text',
      required: true,
      showIf: { complaintType: 'gov' },
    },

    // ---- Project Only ----
    {
      name: 'projectName',
      labelEn: 'Project Name (complained about)',
      labelAr: 'اسم المشروع المشتكى عليه',
      type: 'text',
      required: true,
      showIf: { complaintType: 'project' },
    },
    {
      name: 'accusedProjectPerson',
      labelEn: 'Accused Person Name',
      labelAr: 'اسم الشخص المشتكى عليه',
      type: 'text',
      required: true,
      showIf: { complaintType: 'project' },
    },
    {
      name: 'accusedRole',
      labelEn: 'Role in Project (e.g. Employee / Owner)',
      labelAr: 'صفته داخل المشروع (موظف / مالك)',
      type: 'text',
      required: true,
      showIf: { complaintType: 'project' },
    },

    // ---- Shared Fields ----
    {
      name: 'incidentDate',
      labelEn: 'Date of Incident',
      labelAr: 'تاريخ الحادث المتسبب في الشكوى',
      placeholderEn: 'yyyy-mm-dd',
      placeholderAr: 'yyyy-mm-dd',
      type: 'text',
      required: true,
    },
    {
      name: 'details',
      labelEn: 'Complaint Details',
      labelAr: 'اكتب الشكوى',
      type: 'textarea',
      required: true,
    },
  ],
},

};
