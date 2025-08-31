// data/stores.ts
export type BusinessHours = {
  day: 'อาทิตย์' | 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์' | 'เสาร์';
  open: string;   // "08:00"
  close: string;  // "20:00"
  closed?: boolean;
};

export type Service = {
  id: string;
  name: string;
  summary?: string;
  priceFrom?: number;    // ราคาเริ่มต้น
  durationMin?: number;  // ระยะเวลาโดยประมาณ (นาที)
  category?: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number; // 0-5
  comment: string;
  date: string;   // ISO
  avatarUrl?: string;
};

export type StoreDetail = {
  id: string;
  name: string;
  address: string;
  phone: string;
  category: string;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4;
  avgPrice: number;
  lat?: number;
  lng?: number;
  images: string[];           // รูปหน้าร้าน/แกลเลอรี
  hoursWeekly: BusinessHours[];
  services: Service[];        // รายการบริการแบบสรุป
  reviews: Review[];
};

const defaultHours: BusinessHours[] = [
  { day: 'อาทิตย์', open: '09:00', close: '19:00' },
  { day: 'จันทร์', open: '08:00', close: '20:00' },
  { day: 'อังคาร', open: '08:00', close: '20:00' },
  { day: 'พุธ', open: '08:00', close: '20:00' },
  { day: 'พฤหัสบดี', open: '08:00', close: '20:00' },
  { day: 'ศุกร์', open: '08:00', close: '20:00' },
  { day: 'เสาร์', open: '09:00', close: '19:00' },
];

const baseServices: Service[] = [
  { id: 'svc-wash-basic',  name: 'ล้างสี-ดูดฝุ่น', priceFrom: 250, durationMin: 45, category: 'ล้างรถ' },
  { id: 'svc-wash-prem',   name: 'ล้างพรีเมียม',   priceFrom: 450, durationMin: 60, category: 'ล้างรถ' },
  { id: 'svc-polish',      name: 'ขัดสีเงา',       priceFrom: 900, durationMin: 120, category: 'ขัดเคลือบ' },
  { id: 'svc-ceramic',     name: 'เคลือบเซรามิก',  priceFrom: 1500, durationMin: 180, category: 'ดีเทลลิ่ง' },
  { id: 'svc-interior',    name: 'ทำความสะอาดภายใน', priceFrom: 1200, durationMin: 120, category: 'ดีเทลลิ่ง' },
  { id: 'svc-engine',      name: 'ล้างห้องเครื่อง',  priceFrom: 600, durationMin: 50, category: 'ซ่อมบำรุง' },
];

export const STORES: StoreDetail[] = [
  {
    id: '1',
    name: 'Goofitre Car Care Central',
    address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    phone: '02-123-4567',
    category: 'ล้างรถ',
    rating: 4.8,
    priceLevel: 3,
    avgPrice: 850,
    lat: 13.7234, lng: 100.585,
    images: ['/stores/1/cover.jpg', '/stores/1/inside.jpg'], // เปลี่ยนเป็นรูปจริงได้
    hoursWeekly: defaultHours,
    services: baseServices,
    reviews: [
      { id: 'r1', author: 'Ploy S.', rating: 5, comment: 'ล้างละเอียดมาก เงาวับ ประทับใจค่ะ', date: '2025-08-20' },
      { id: 'r2', author: 'Bank T.', rating: 4.5, comment: 'งานไว คิวไม่แน่น ราคาสมเหตุสมผล', date: '2025-08-12' },
    ],
  },
  {
    id: '2',
    name: 'Premium Shine Studio',
    address: '456 ถนนพระราม 4 แขวงสุริยวงศ์ เขตบางรัก กรุงเทพฯ 10500',
    phone: '02-987-6543',
    category: 'ขัดเคลือบ',
    rating: 4.6,
    priceLevel: 4,
    avgPrice: 1400,
    lat: 13.7295, lng: 100.531,
    images: ['/stores/2/cover.jpg'],
    hoursWeekly: defaultHours,
    services: baseServices,
    reviews: [
      { id: 'r1', author: 'Chanin K.', rating: 4.5, comment: 'เซรามิกดีมาก น้ำกลิ้งหนามาก', date: '2025-08-18' },
      { id: 'r2', author: 'Mint N.', rating: 4, comment: 'รายละเอียดดี แต่รอคิวนิดหน่อย', date: '2025-08-05' },
    ],
  },
  {
    id: '3',
    name: 'Auto Care Express',
    address: '789 ถนนเพชรบุรี แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400',
    phone: '02-555-1234',
    category: 'ซ่อมบำรุง',
    rating: 4.4,
    priceLevel: 2,
    avgPrice: 600,
    lat: 13.7533, lng: 100.538,
    images: ['/stores/3/cover.jpg'],
    hoursWeekly: defaultHours,
    services: baseServices,
    reviews: [
      { id: 'r1', author: 'Ton S.', rating: 4.5, comment: 'ซ่อมไว ราคาไม่แรง แนะนำครับ', date: '2025-08-10' },
    ],
  },
  // … เพิ่มร้าน 4–6 ได้เหมือนกัน หรือใช้ 3 ร้านนี้ก่อน
];

export function getStoreById(id: string) {
  return STORES.find((s) => s.id === id);
}
export function getAllStoreIds() {
  return STORES.map((s) => s.id);
}
