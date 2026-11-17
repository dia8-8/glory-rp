// Content for the home page sections. Edit freely — every entry is { en, ar }.

export type Bi = { en: string; ar: string };

/** "Why Glory RP" cards. `icon` is a lucide-react icon name used in app/(routes)/page.tsx */
export const FEATURES: { icon: 'drama' | 'briefcase' | 'store' | 'shield' | 'radio' | 'languages'; title: Bi; desc: Bi }[] = [
  {
    icon: 'drama',
    title: { en: 'Serious Roleplay', ar: 'رول بلاي جاد' },
    desc: { en: 'Clear rules and active staff keep every scene realistic and fair.', ar: 'قوانين واضحة وإدارة نشطة تحافظ على واقعية وعدالة كل سيناريو.' },
  },
  {
    icon: 'briefcase',
    title: { en: 'Real Careers', ar: 'وظائف حقيقية' },
    desc: { en: 'Join the Police, EMS, Justice or Mechanics and build your reputation.', ar: 'انضم للشرطة أو الإسعاف أو العدل أو الميكانيك وابنِ سمعتك.' },
  },
  {
    icon: 'store',
    title: { en: 'Own a Business', ar: 'امتلك مشروعك' },
    desc: { en: 'Run a dealership, casino, restaurant, gas station and more.', ar: 'أدِر معرض سيارات أو كازينو أو مطعم أو محطة وقود والمزيد.' },
  },
  {
    icon: 'shield',
    title: { en: 'Gangs & Crime', ar: 'العصابات والجريمة' },
    desc: { en: 'Structured gang system, robberies and kidnappings with balanced rules.', ar: 'نظام عصابات منظم وسرقات وخطف بقوانين متوازنة.' },
  },
  {
    icon: 'radio',
    title: { en: 'Creator Community', ar: 'مجتمع صناع محتوى' },
    desc: { en: 'Dozens of streamers bring the city’s stories to life every day.', ar: 'عشرات صناع المحتوى ينقلون قصص المدينة كل يوم.' },
  },
  {
    icon: 'languages',
    title: { en: 'Arabic & English', ar: 'عربي وإنجليزي' },
    desc: { en: 'A home for Arabic-speaking players, welcoming to everyone.', ar: 'بيت للاعبين العرب ومرحّب بالجميع.' },
  },
];

export const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { en: 'How do I join the server?', ar: 'كيف أنضم إلى السيرفر؟' },
    a: {
      en: 'Join our Discord, then press “Join Us” on this site, sign in with Discord and fill in the join interview. Our team will review it.',
      ar: 'انضم إلى الديسكورد، ثم اضغط “انضم إلينا” في الموقع وسجّل الدخول بالديسكورد واملأ مقابلة الانضمام. سيقوم فريقنا بمراجعتها.',
    },
  },
  {
    q: { en: 'How do I know if my application was accepted?', ar: 'كيف أعرف إذا تم قبول طلبي؟' },
    a: {
      en: 'Sign in and open “My Application” from the menu. It shows whether you were accepted, rejected or are still waiting.',
      ar: 'سجّل الدخول وافتح “طلبي” من القائمة. ستظهر لك حالة الطلب: مقبول أو مرفوض أو قيد المراجعة.',
    },
  },
  {
    q: { en: 'Do I need a microphone?', ar: 'هل أحتاج مايكروفون؟' },
    a: { en: 'Yes — roleplay happens by voice, so a working microphone is required.', ar: 'نعم — الرول بلاي يكون صوتيًا، لذلك يلزم وجود مايكروفون يعمل.' },
  },
  {
    q: { en: 'How do I apply for a job like Police or EMS?', ar: 'كيف أقدّم على وظيفة مثل الشرطة أو الإسعاف؟' },
    a: { en: 'Open the Jobs page, choose the department and fill in its form.', ar: 'افتح صفحة الوظائف، اختر القسم واملأ النموذج الخاص به.' },
  },
  {
    q: { en: 'How do I buy VIP?', ar: 'كيف أشتري VIP؟' },
    a: {
      en: 'Pick a package in the Store and press “Open Form”. Purchases can’t be changed or refunded afterwards.',
      ar: 'اختر الباقة من المتجر واضغط “فتح النموذج”. لا يمكن التعديل أو الاسترجاع بعد الشراء.',
    },
  },
];

/** Gallery images (put your own in-game screenshots in /public/gallery and list them here) */
export const GALLERY: { src: string; caption: Bi }[] = [
  { src: '/images/villa.jpg', caption: { en: 'Villas', ar: 'الفلل' } },
  { src: '/images/gang.jpg', caption: { en: 'Gangs', ar: 'العصابات' } },
  { src: '/images/casino.jpg', caption: { en: 'Casino', ar: 'الكازينو' } },
  { src: '/images/garage.jpeg', caption: { en: 'Garages', ar: 'الكراجات' } },
  { src: '/images/motodealer.jpg', caption: { en: 'Moto Dealer', ar: 'معرض الدراجات' } },
  { src: '/images/supermarket.jpg', caption: { en: 'Businesses', ar: 'المحلات' } },
];

/** News / changelog — newest first. Date format YYYY-MM-DD */
export const NEWS: { date: string; tag: Bi; title: Bi; body: Bi }[] = [
  {
    date: '2026-11-16',
    tag: { en: 'Website', ar: 'الموقع' },
    title: { en: 'New look for the Glory RP website', ar: 'تصميم جديد لموقع جلوري' },
    body: {
      en: 'New logo, new green style, live server status, rules search and a page to track your application.',
      ar: 'شعار جديد وتصميم أخضر، حالة السيرفر المباشرة، بحث في القوانين وصفحة لمتابعة طلبك.',
    },
  },
];
