//app\organiza\tasks\actions.ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireOrgUser } from '@/lib/auth-helpers'
import type { BookingStatus } from '@prisma/client'

const ALLOWED: BookingStatus[] = ['PENDING','CONFIRMED','COMPLETED','CANCELLED']

export async function updateBookingStatusAction(formData: FormData) {
  const user = await requireOrgUser()
  const bookingId = String(formData.get('bookingId') ?? '')
  const status = String(formData.get('status') ?? '') as BookingStatus

  if (!ALLOWED.includes(status)) {
    throw new Error('สถานะไม่ถูกต้อง')
  }

  // ตรวจสิทธิ์ว่า booking เป็นของร้านผู้ใช้จริง
  const store = await prisma.store.findUnique({
    where: { userId: user.id! },
    select: { id: true },
  })
  if (!store) throw new Error('ยังไม่มีร้าน')

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, storeId: true },
  })
  if (!booking || booking.storeId !== store.id) {
    throw new Error('ไม่ได้รับอนุญาต')
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  })

  // refresh หน้า tasks (รวมทั้งกรณีมี query ?status=... อยู่ก็จะ re-fetch)
  revalidatePath('/organiza/tasks')
}
