export type TicketKey = 'server' | 'glitch' | 'vip' | 'player';

export const TICKETS: Record<TicketKey, any> = {
  // 🎫 Server Ticket
  server: {
    titleEn: 'Server Support Ticket',
    titleAr: 'تذكرة دعم السيرفر',
    descEn: 'Submit a support request related to the server.',
    descAr: 'قدّم تذكرة دعم تتعلق بالسيرفر.',
    webhookEnv: 'DISCORD_TICKET_SERVER_WEBHOOK',
    mentionRoleId: process.env.DISCORD_ROLEID_TICKET_SERVER,
    fields: [
      {
        name: 'issue',
        labelEn: 'Describe your issue',
        labelAr: 'اشرح مشكلتك',
        type: 'textarea',
        required: true,
      },
    ],
  },

  // 🐛 Glitch / Bug Report
  glitch: {
    titleEn: 'Glitch / Bug Report',
    titleAr: 'الإبلاغ عن خلل أو خطأ',
    descEn: 'Report a glitch or bug you encountered in the city.',
    descAr: 'أبلغ عن خلل أو خطأ واجهته داخل المدينة.',
    webhookEnv: 'DISCORD_TICKET_GLITCH_WEBHOOK',
    mentionRoleId: process.env.DISCORD_ROLEID_TICKET_GLITCH,
    fields: [
      {
        name: 'location',
        labelEn: 'Location of the glitch (if any)',
        labelAr: 'مكان الخلل (إن وجد)',
        type: 'text',
        required: false,
      },
      {
        name: 'description',
        labelEn: 'Describe the glitch or how to reproduce it',
        labelAr: 'اشرح الخلل أو كيفية حدوثه',
        type: 'textarea',
        required: true,
      },
      {
        name: 'videoLink',
        labelEn: 'Video evidence link (required)',
        labelAr: 'رابط الفيديو (مطلوب)',
        placeholderEn: 'Paste YouTube / Streamable / Google Drive link',
        placeholderAr: 'ضع رابط الفيديو (يوتيوب / ستريميبل / جوجل درايف)',
        type: 'text',
        required: true,
      },
    ],
  },

  // ⭐ VIP Support Ticket
  vip: {
    titleEn: 'VIP Ticket',
    titleAr: 'تذكرة VIP',
    descEn: 'Request or manage VIP packages within the city.',
    descAr: 'قدّم طلباً أو استفساراً يخص الباقات الخاصة (VIP).',
    webhookEnv: 'DISCORD_TICKET_VIP_WEBHOOK',
    mentionRoleId: process.env.DISCORD_ROLEID_TICKET_VIP,
    fields: [
      {
        name: 'vipType',
        labelEn: 'Type of VIP Package',
        labelAr: 'نوع الـ VIP',
        type: 'select',
        required: true,
        options: [
          { value: 'carDealer', labelEn: 'Car Dealer', labelAr: 'تاجر سيارات' },
          { value: 'motorDealer', labelEn: 'Motor Dealer', labelAr: 'تاجر دراجات نارية' },
          { value: 'boatDealer', labelEn: 'Boat Dealer', labelAr: 'تاجر قوارب' },
          { value: 'villa', labelEn: 'Villa', labelAr: 'فيلا' },
          { value: 'bike', labelEn: 'Bike', labelAr: 'دراجة' },
          { value: 'cars', labelEn: 'Cars', labelAr: 'سيارات' },
          { value: 'gang', labelEn: 'Gang (6 Cars + Villa)', labelAr: 'عصابة (6 سيارات + فيلا)' },
          { value: 'supermarket', labelEn: 'Supermarket', labelAr: 'سوبرماركت' },
          { value: 'gasStation', labelEn: 'Gas Station', labelAr: 'محطة وقود' },
          { value: 'mechanic', labelEn: 'Mechanic', labelAr: 'ورشة / ميكانيكي' },
          { value: 'restaurant', labelEn: 'Restaurant or Bar', labelAr: 'مطعم أو بار' },
          { value: 'casino', labelEn: 'Casino', labelAr: 'كازينو' },
          { value: 'secondChar', labelEn: 'Second Character', labelAr: 'شخصية ثانية' },
        ],
      },
      {
        name: 'message',
        labelEn: 'Additional Message',
        labelAr: 'رسالتك أو ملاحظاتك',
        placeholderEn: 'Explain your request or concern...',
        placeholderAr: 'اشرح طلبك أو استفسارك...',
        type: 'textarea',
        required: true,
      },
    ],
  },

  // 🚔 Player Report
  player: {
    titleEn: 'Player Report',
    titleAr: 'بلاغ عن لاعب',
    descEn:
      'Report a player for rule-breaking or misconduct. Please include all details clearly.',
    descAr:
      'أبلغ عن لاعب خالف القوانين أو تصرف بشكل غير لائق. الرجاء كتابة التفاصيل بوضوح.',
    webhookEnv: 'DISCORD_TICKET_PLAYER_WEBHOOK',
    mentionRoleId: process.env.DISCORD_ROLEID_TICKET_PLAYER,
    fields: [
      {
        name: 'reporterName',
        labelEn: 'Your In-Game Name',
        labelAr: 'اسم اللاعب في المدينة',
        type: 'text',
        required: true,
      },
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
        name: 'accusedName',
        labelEn: 'Accused Player In-Game Name',
        labelAr: 'اسم اللاعب المشتكى عليه في المدينة',
        type: 'text',
        required: true,
      },
      {
        name: 'accusedDiscord',
        labelEn: 'Accused Player Discord Name (if known)',
        labelAr: 'اسم اللاعب المشتكى عليه في الديسكورد (إن وجد)',
        type: 'text',
        required: false,
      },
      {
        name: 'details',
        labelEn: 'Complaint Details',
        labelAr: 'اكتب الشكوى',
        type: 'textarea',
        required: true,
      },
      {
        name: 'videoLink',
        labelEn:
          'Video Evidence Link (Must include all players’ voices & at least 120 seconds before the incident)',
        labelAr:
          'لينك فيديو (يجب أن يكون صوت جميع اللاعبين واضحاً ومدة الفيديو لا تقل عن 120 ثانية قبل الحادث)',
        placeholderEn: 'Paste YouTube / Streamable / Google Drive link',
        placeholderAr: 'ضع رابط الفيديو (يوتيوب / ستريميبل / جوجل درايف)',
        type: 'text',
        required: true,
      },
    ],
  },
};
