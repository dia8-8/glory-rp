// VIP shop items. `badge` is optional ({ en, ar }) — e.g. Popular / Best value / New.

export type VipCategory = 'business' | 'vehicle' | 'property' | 'personal';
type Bi = { en: string; ar: string };

export type VipItem = {
  name: Bi;
  image: string;
  category: VipCategory;
  price1?: Bi;
  price2?: Bi;
  soldOut?: boolean;
  badge?: Bi;
};

export const VIP_CATEGORIES: { key: VipCategory | 'all'; en: string; ar: string }[] = [
  { key: 'all', en: 'All', ar: 'الكل' },
  { key: 'business', en: 'Businesses', ar: 'المشاريع' },
  { key: 'vehicle', en: 'Vehicles', ar: 'المركبات' },
  { key: 'property', en: 'Property & Gangs', ar: 'العقارات والعصابات' },
  { key: 'personal', en: 'Personal', ar: 'شخصي' },
];

const season = (p: string): Bi => ({ en: `${p} Per Season`, ar: `${p} للموسم` });
const orMonthly = (p: string): Bi => ({ en: `or ${p} Monthly`, ar: `أو ${p} شهريًا` });
const perMonth = (p: string): Bi => ({ en: `${p} Per Month`, ar: `${p} شهريًا` });
const first = (p: string): Bi => ({ en: `First payment ${p}`, ar: `الدفعة الأولى ${p}` });
const andMonthly = (p: string): Bi => ({ en: `& ${p} Monthly`, ar: `و ${p} شهريًا` });
const byLocation = (p: string): Bi => ({ en: `${p} Monthly (Depends on location)`, ar: `${p} شهريًا (حسب الموقع)` });

export const VIP_ITEMS: VipItem[] = [
  { name: { en: 'Car Dealer', ar: 'معرض سيارات' }, image: '/images/cardealer1.jpg', category: 'business', price1: season('$150'), price2: orMonthly('$30') },
  { name: { en: 'Moto Dealer', ar: 'معرض دراجات' }, image: '/images/motodealer.jpg', category: 'business', price1: season('$150'), price2: orMonthly('$30') },
  { name: { en: 'Boats Dealer', ar: 'معرض قوارب' }, image: '/images/cardealer2.jpg', category: 'business', price1: season('$150'), price2: orMonthly('$30') },
  { name: { en: 'Villa', ar: 'فيلا' }, image: '/images/villa.jpg', category: 'property', price1: season('$75'), price2: orMonthly('$20') },
  { name: { en: 'Bike', ar: 'دراجة' }, image: '/images/bike.jpg', category: 'vehicle', price1: season('$40-50'), price2: orMonthly('$15-25') },
  { name: { en: 'Car', ar: 'سيارة' }, image: '/images/car.jpg', category: 'vehicle', price1: season('$40-50'), price2: orMonthly('$15-25') },
  {
    name: { en: 'Gang (2 Cars + Villa)', ar: 'عصابة (سيارتان + فيلا)' },
    image: '/images/gang.jpg',
    category: 'property',
    price1: first('$100'),
    price2: andMonthly('$20'),
    badge: { en: 'Bundle', ar: 'باقة' },
  },
  { name: { en: 'Supermarket', ar: 'سوبر ماركت' }, image: '/images/supermarket.jpg', category: 'business', price1: byLocation('$15-30') },
  { name: { en: 'Gas Station', ar: 'محطة وقود' }, image: '/images/gasstation.jpg', category: 'business', price1: byLocation('$20-50') },
  { name: { en: 'Mechanic', ar: 'ورشة ميكانيك' }, image: '/images/mechanic.jpg', category: 'business', price1: first('$100'), price2: andMonthly('$15') },
  { name: { en: 'Restaurant', ar: 'مطعم' }, image: '/images/restaurant.jpg', category: 'business', price1: first('$50'), price2: andMonthly('$10') },
  { name: { en: 'Casino', ar: 'كازينو' }, image: '/images/casino.jpg', category: 'business', price1: first('$200'), price2: andMonthly('$40') },
  { name: { en: 'Third Character', ar: 'شخصية ثالثة' }, image: '/images/secondchar.jpg', category: 'personal', price1: perMonth('$10') },
  { name: { en: 'Personal Garage', ar: 'كراج خاص' }, image: '/images/garage.jpeg', category: 'property', price1: perMonth('$10') },
  { name: { en: 'Personal Plate', ar: 'لوحة خاصة' }, image: '/images/plate.jpeg', category: 'personal', price1: perMonth('$10') },
  { name: { en: 'Personal Sim Number', ar: 'رقم هاتف مميز' }, image: '/images/sim.jpeg', category: 'personal', price1: perMonth('$10') },
];
