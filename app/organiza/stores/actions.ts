'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { requireOrgUser } from '@/lib/auth-helpers'

export type StoreFormState = { ok?: boolean; error?: string }

const StoreSchema = z.object({
  name: z.string().min(2, 'ชื่อร้านอย่างน้อย 2 ตัวอักษร').max(100),
  phone: z.string().min(3, 'กรอกเบอร์โทรให้ถูกต้อง'),
  address: z.string().min(5, 'กรอกที่อยู่ให้ถูกต้อง'),
  imageUrl: z
    .string()
    .trim()
    .url('รูปภาพต้องเป็น URL')
    .refine(v => v.startsWith('http://') || v.startsWith('https://'), 'กรุณาใช้ลิงก์ http/https เท่านั้น')
    .optional()
    .or(z.literal(''))
    .transform(v => v || undefined),
  hours: z.string().optional().or(z.literal('')).transform(v => v || undefined),
  lat: z.union([z.coerce.number(), z.string().length(0)]).transform(v => typeof v === 'number' && !Number.isNaN(v) ? v : undefined),
  lng: z.union([z.coerce.number(), z.string().length(0)]).transform(v => typeof v === 'number' && !Number.isNaN(v) ? v : undefined),
  isOpen: z.enum(['0','1']).transform(v => v === '1'),
})

function parseForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  return StoreSchema.safeParse(raw)
}

export async function createStoreAction(
  _prev: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  const user = await requireOrgUser()

  // one store per user
  const existing = await prisma.store.findUnique({ where: { userId: user.id } })
  if (existing) return { error: 'คุณได้สร้างร้านแล้ว กรุณาแก้ไขร้านเดิม' }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join('\n')
    return { error: msg }
  }

  const d = parsed.data

  try {
    await prisma.store.create({
      data: {
        userId: user.id,
        name: d.name,
        phone: d.phone,
        address: d.address,
        imageUrl: d.imageUrl,
        hours: d.hours,
        lat: d.lat,
        lng: d.lng,
        isOpen: d.isOpen,
      },
    })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'ชื่อร้านซ้ำหรือคุณมีร้านอยู่แล้ว' }
    }
    return { error: e?.message ?? 'ไม่สามารถสร้างร้านได้' }
  }

  // ✅ ทำหลัง try/catch เพื่อไม่ให้ redirect ถูกจับ
  revalidatePath('/organiza/stores')
  redirect('/organiza/stores')
}

export async function updateStoreAction(
  storeId: string,
  _prev: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  const user = await requireOrgUser()

  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store || store.userId !== user.id) return { error: 'ไม่พบร้านของคุณ' }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join('\n')
    return { error: msg }
  }

  const d = parsed.data

  try {
    await prisma.store.update({
      where: { id: storeId },
      data: {
        name: d.name,
        phone: d.phone,
        address: d.address,
        imageUrl: d.imageUrl,
        hours: d.hours,
        lat: d.lat,
        lng: d.lng,
        isOpen: d.isOpen,
      },
    })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'ชื่อร้านซ้ำ' }
    }
    return { error: e?.message ?? 'อัปเดตร้านไม่สำเร็จ' }
  }

  // ✅ ทำหลัง try/catch
  revalidatePath('/organiza/stores')
  revalidatePath(`/stores/${storeId}`)
  redirect('/organiza/stores')
}

export async function deleteStoreAction(storeId: string) {
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store || store.userId !== user.id) throw new Error('ไม่พบร้านของคุณ')

  await prisma.store.delete({ where: { id: storeId } })

  revalidatePath('/organiza/stores')
  redirect('/organiza/stores')
}
