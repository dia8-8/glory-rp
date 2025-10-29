export type Lang = 'ar' | 'en';

export function getLangClient(): Lang {
  if (typeof document === 'undefined') return 'ar';
  const match = document.cookie.match(/(?:^|; )lang=([^;]+)/);
  const v = (match?.[1] ?? 'ar') as Lang;
  return v === 'ar' || v === 'en' ? v : 'ar';
}

export function tClient(lang: Lang) {
  const isAr = lang === 'ar';
  return {
    isAr,
    brand: isAr ? 'جلوري' : 'Glory RP',
    nav: {
      home: isAr ? 'الرئيسية' : 'Home',
      streamers: isAr ? 'صناع المحتوى' : 'Streamers',
      rules: isAr ? 'القوانين' : 'Rules',
      jobs: isAr ? 'تقديم الوظائف' : 'Jobs',
      cityhall : isAr ? 'بلدية' : 'City Hall',
      store: isAr ? 'المتجر' : 'Store',
      login: isAr ? 'تسجيل الدخول' : 'Log in',
    },
    hero: {
      title: isAr   ? 'جلوري RP \nتجربة رول بلاي واقعية وغامرة' : 'GLORY RP \nLive immersive, realistic RP',
      body: isAr ? 'نسعى لتقديم أفضل تجربة فايف إم في الشرق الأوسط. انضم الديسكورد وابدأ رحلتك الآن.' : 'We deliver a premium FiveM experience. Join Discord and start your story today.',
      ctaJoin: isAr ?  ' انضم إلينا' : 'Join US',
      ctaRules: isAr ? 'اطّلع على القوانين' : 'View Rules',
    },
    live: {
      title: isAr ? 'شاهد أفضل البثوث' : 'Watch Top Streams',
      subtitle: isAr ? 'تابع أبرز صناع المحتوى للأحداث المميزة.' : 'Catch creators covering the city’s biggest moments.',
    },
    social: {
      title: isAr ? 'منصات التواصل' : 'Community at a Glance',
      body: isAr
        ? 'يتمتع مجتمع GLORY LIFE بحضورٍ مميز على منصات التواصل الاجتماعي، ويُعد من أكبر مجتمعات الرول بلاي عالميًا من حيث عدد المتابعين والنشاط. نستقبل يوميًا أعضاءً جدد عبر ديسكورد وتويتر، وتبقى الأجواء داخل المدينة نابضة بالحياة ومتوازنة. كما نفخر بكوننا أول سيرفر عربي يحصل على مساحة مخصّصة على منصة البث Kick.com — خطوة تعكس مكانتنا بين أبرز مجتمعات الرول بلاي في العالم.'
        : 'The GLORY LIFE community has a standout presence across social platforms—among large RP communities by followers and live activity. On Discord and Twitter we welcome new members daily, and in-city sessions stay lively and balanced. We’re also proud to be the first Arabic server with a dedicated section on Kick.com—a milestone that reflects our place among top RP communities.',
      members: isAr ? 'الأعضاء' : 'Members',
      followers: isAr ? 'المتابعين' : 'Followers',
      twitter: isAr ? 'تويتر' : 'Twitter',
      discord: isAr ? 'دسكورد' : 'Discord',
      tiktok: isAr ? 'كيك' : 'Tiktok',
    },
    login: {
      title: isAr ? 'تسجيل الدخول' : 'Sign in',
      body: isAr ? 'يجب تسجيل الدخول عبر ديسكورد للتقديم على وظيفة.': 'You must sign in with Discord to apply for a job.',
      btn: isAr ? 'تسجيل الدخول بواسطة ديسكورد' : 'Sign in with Discord',
    },
    about: {
      title: isAr ? 'من نحن' : 'About Us',
      body: isAr ? 'سيرفر RP عربي تأسس لتقديم تجربة لعب استثنائية مع مجتمع نشط وصناع محتوى مميزين.' : 'An Arabic RP server built for exceptional storytelling with an active community and standout creators.',
    },
    rules: {
      title: isAr ? 'القوانين' : 'Server Rules',
      body: isAr ? '.يجب الاطلاع على القوانين لضمان تجربة ممتعة وعادلة للجميع والاحترام بين اللاعبين ' : 'Please review the rules to keep things fair and fun for everyone.',
    },
    jobs: {
      title: isAr ? 'تقديم الوظائف' : 'Join the Team',
      body: isAr ? 'قدّم للوظائف الإدارية أو صانع محتوى أو دعم فني. سنراجع طلبك سريعًا.' : 'Apply for staff, creator, or tech roles. We’ll review your application soon.',
      submit: isAr ? 'إرسال الطلب' : 'Submit',
    },
    footer: isAr ? '© 2025 جميع الحقوق محفوظة' : '© 2025 All rights reserved',
  } as const;
}
