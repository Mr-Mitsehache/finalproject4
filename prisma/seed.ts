import { PrismaClient, Role, BookingStatus, PaymentMethod } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1) ล้างข้อมูลเดิม (ระวังในโปรดักชัน)
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.review.deleteMany(),
    prisma.service.deleteMany(),
    prisma.store.deleteMany(),
    prisma.user.deleteMany(),
  ]);

   // 2) ผู้ใช้
  await prisma.user.create({
    data: { name: 'U',   email: 'admin@gmail.com', password: '$2b$12$21sUjsWvgTdfoEY44vt2Au4AE9DhWxhk.EIM9v7REuRAoxa3T1Clm', role: Role.ADMIN },
  });
  const fit   = await prisma.user.create({
    data: { name: 'Fit', email: 'fit@gmail.com',   password: '123', role: Role.ORGANIZE },
  });
  const shin  = await prisma.user.create({
    data: { name: 'Shin', email: 'shin@gmail.com', password: '123', role: Role.ORGANIZE },
  });

  // 3) ร้าน
  const s1 = await prisma.store.create({
    data: {
      name: 'Goofitre Car Care Central',
      userId: fit.id,
      phone: '02-123-4567',
      imageUrl: '/placeholder.svg',
      address: 'ตำบลหน้าถ้ำ อำเภอเมืองยะลา ยะลา 95000',
      lat: 6.532765,   lng: 101.222627,
      hours: '08:00 - 20:00',
      isOpen: true,
      rating: 4.8,
      reviewsCount: 184,
    },
  });

  const s2 = await prisma.store.create({
    data: {
      name: 'Premium Shine Studio',
      userId: shin.id,
      phone: '02-987-6543',
      imageUrl: '/placeholder.svg',
      address: '133 ถนน เทศบาล 3 สะเตง อำเภอเมืองยะลา ยะลา 95000',
      lat: 6.548923988325412,  lng: 101.28858911032502,
      hours: '09:00 - 21:00',
      isOpen: false,
      rating: 4.6,
      reviewsCount: 92,
    },
  });

  // 4) บริการ
  const washBasic = await prisma.service.create({
    data: {
      storeId: s1.id,
      slug: 'wash-basic',
      name: 'ล้าง+ดูดฝุ่น',
      detail: 'ล้างภายนอก ดูดฝุ่นภายใน',   // <-- ถ้า schema ใช้ "detail" ให้เปลี่ยนชื่อ field
      priceFrom: 200,
      priceTo: 350,
    },
  });

  await prisma.service.create({
    data: {
      storeId: s1.id,
      slug: 'wax-detail',
      name: 'ขัด+เคลือบแว็กซ์',
      detail: 'งานขัดลบรอย+เคลือบ',
      priceFrom: 800,
      priceTo: 1500,
    },
  });

  await prisma.service.create({
    data: {
      storeId: s2.id,
      slug: 'ceramic-coat',
      name: 'เคลือบเซรามิก',
      detail: 'ปกป้องสีรถยาวนาน',
      priceFrom: 4500,
      priceTo: 9000,
    },
  });

  await prisma.service.create({
    data: {
      storeId: s2.id,
      slug: 'interior-care',
      name: 'ดูแลภายใน',
      detail: 'ซักเบาะ พรม เคลือบ',
      priceFrom: 1200,
      priceTo: 2500,
    },
  });

  // 5) รีวิว
  await prisma.review.createMany({
    data: [
      { storeId: s1.id, author: 'Narin K.', rating: 5, comment: 'ล้างละเอียด เงาวับ', date: new Date('2025-08-20') },
      { storeId: s1.id, author: 'Ploy S.',  rating: 5, comment: 'คุ้มราคา งานเนียน',   date: new Date('2025-08-10') },
      { storeId: s2.id, author: 'Beam J.',  rating: 5, comment: 'เซรามิกเงามาก',       date: new Date('2025-08-18') },
    ],
  });

  // 6) การจอง + ชำระเงิน
  const booking = await prisma.booking.create({
    data: {
      storeId: s1.id,
      serviceId: washBasic.id,
      customerName: 'สมชาย ใจดี',
      phone: '0812345678',
      email: 'somchai@example.com',
                               // <-- ใส่เพิ่มให้ครบตาม schema
      carModel: 'Yaris',
      carPlate: 'กก-1234',

      date: new Date('2025-09-02T09:00:00+07:00'),
      note: 'โฟมหนา เน้นล้อ',
      status: BookingStatus.PENDING,
      payment: {
        create: {
          method: PaymentMethod.CASH,
          amount: 300,
          paidAt: new Date(),
        },
      },
    },
    include: { payment: true },
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
