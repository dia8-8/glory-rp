import { cookies } from 'next/headers';

export type Lang = 'ar' | 'en';

export function getLang(): Lang {
  const v = cookies().get('lang')?.value;
  return v === 'ar' ? 'ar' : 'en';
}


export function t(lang: Lang) {
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
      ctaJoin: isAr ? ' انضم إلينا' : 'Join US',
      ctaRules: isAr ? 'اطّلع على القوانين' : 'View Rules',
    },
    live: {
      title: isAr ? 'شاهد أفضل البثوث' : 'Watch Top Streams',
      subtitle: isAr ? 'تابع أبرز صناع المحتوى للأحداث المميزة.' : 'Catch creators covering the city’s biggest moments.',
    },
    social: {
      title: isAr ? 'منصات التواصل' : 'Community at a Glance',
      body: isAr
        ? 'يتمتع مجتمع GLORY RP بحضورٍ مميز على منصات التواصل الاجتماعي، ويُعد من أكبر مجتمعات الرول بلاي عالميًا من حيث عدد المتابعين والنشاط. نستقبل يوميًا أعضاءً جدد عبر ديسكورد، وتبقى الأجواء داخل المدينة نابضة بالحياة ومتوازنة. كما نفخر بمكانتنا بين أبرز مجتمعات الرول بلاي حول العالم.'
        : 'The GLORY RP community stands out across social platforms as one of the largest RP communities worldwide in followers and activity. We welcome new members daily through Discord, and in-city sessions remain lively and balanced. We take pride in our place among the top RP communities globally.',
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
