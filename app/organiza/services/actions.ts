//app\organiza\services\actions.ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireOrgUser } from '@/lib/auth-helpers'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { redirect } from 'next/navigation'

export type ServiceFormState = { ok?: boolean; error?: string }

const OptionalHttpUrl = z
  .union([z.string().trim().url(), z.string().length(0)])
  .transform(v => (v ? v : undefined))
  .refine(v => !v || v.startsWith('http://') || v.startsWith('https://'), {
    message: 'กรุณาใช้ http/https',
  })

const ServiceSchema = z.object({
  name: z.string().min(2, 'ชื่อบริการอย่างน้อย 2 ตัวอักษร').max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'slug ต้องเป็น a-z, 0-9 และเครื่องหมาย -')
    .min(2, 'slug อย่างน้อย 2 ตัวอักษร')
    .optional()
    .or(z.literal(''))
    .transform(v => v || undefined),
  detail: z.string().optional().or(z.literal('')).transform(v => v || undefined),
  priceFrom: z
    .union([z.coerce.number().nonnegative(), z.string().length(0)])
    .transform(v => (typeof v === 'number' ? v : undefined)),
  priceTo: z
    .union([z.coerce.number().nonnegative(), z.string().length(0)])
    .transform(v => (typeof v === 'number' ? v : undefined)),
  imageUrl: OptionalHttpUrl.optional(),
  videoUrl: OptionalHttpUrl.optional(),
  durationMinutes: z
    .union([z.coerce.number().int().positive(), z.string().length(0)])
    .transform(v => (typeof v === 'number' ? v : undefined)),
}).refine(d => (d.priceFrom ?? 0) <= (d.priceTo ?? Infinity), {
  path: ['priceTo'],
  message: 'ช่วงราคาต้องมากกว่า/เท่ากับราคาเริ่มต้น',
})

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  // auto slug จาก name ถ้าไม่ได้ส่งมา
  if ((!raw['slug'] || String(raw['slug']).trim() === '') && raw['name']) {
    raw['slug'] = toSlug(String(raw['name']))
  }
  return ServiceSchema.safeParse(raw)
}

export async function createServiceAction(
  _prev: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { userId: user.id! }, select: { id: true } })
  if (!store) return { error: 'คุณยังไม่มีร้าน' }

  const parsed = parse(formData)
  if (!parsed.success) return { error: parsed.error.issues.map(i => i.message).join('\n') }

  const d = parsed.data
  try {
    await prisma.service.create({
      data: {
        storeId: store.id,
        name: d.name,
        slug: d.slug!, // ผ่าน refine แล้ว
        detail: d.detail,
        priceFrom: d.priceFrom,
        priceTo: d.priceTo,
        imageUrl: d.imageUrl,
        videoUrl: d.videoUrl,
        durationMinutes: d.durationMinutes,
      },
    })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'slug ซ้ำในร้านของคุณ' }
    }
    return { error: e?.message ?? 'สร้างบริการไม่สำเร็จ' }
  }

  revalidatePath('/organiza/services')
  return { ok: true }
}

export async function updateServiceAction(
  serviceId: string,
  _prev: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { userId: user.id! }, select: { id: true } })
  if (!store) return { error: 'คุณยังไม่มีร้าน' }

  const svc = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!svc || svc.storeId !== store.id) return { error: 'ไม่พบบริการของคุณ' }

  const parsed = parse(formData)
  if (!parsed.success) return { error: parsed.error.issues.map(i => i.message).join('\n') }
  const d = parsed.data

  try {
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: d.name,
        slug: d.slug!,
        detail: d.detail,
        priceFrom: d.priceFrom,
        priceTo: d.priceTo,
        imageUrl: d.imageUrl,
        videoUrl: d.videoUrl,
        durationMinutes: d.durationMinutes,
      },
    })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'slug ซ้ำในร้านของคุณ' }
    }
    return { error: e?.message ?? 'อัปเดตบริการไม่สำเร็จ' }
  }

  revalidatePath('/organiza/services')
  redirect('/organiza/services')
  return { ok: true }
}

export async function deleteServiceAction(formData: FormData) {
  const user = await requireOrgUser()
  const id = String(formData.get('serviceId') ?? '')

  // ตรวจสิทธิ์ว่าเป็น service ของร้านนี้
  const store = await prisma.store.findUnique({
    where: { userId: user.id! },
    select: { id: true },
  })
  const svc = await prisma.service.findUnique({
    where: { id },
    select: { storeId: true },
  })
  if (!store || !svc || svc.storeId !== store.id) {
    throw new Error('ไม่ได้รับอนุญาต')
  }

  // ⬇️ Soft delete: archive แทนการลบ
  await prisma.service.update({
    where: { id },
    data: { isActive: false },
  })

  revalidatePath('/organiza/services')
}

// (ตัวเลือก) ปุ่มกู้คืนบริการ
export async function restoreServiceAction(formData: FormData) {
  const user = await requireOrgUser()
  const id = String(formData.get('serviceId') ?? '')

  const store = await prisma.store.findUnique({
    where: { userId: user.id! },
    select: { id: true },
  })
  const svc = await prisma.service.findUnique({
    where: { id },
    select: { storeId: true },
  })
  if (!store || !svc || svc.storeId !== store.id) {
    throw new Error('ไม่ได้รับอนุญาต')
  }

  await prisma.service.update({
    where: { id },
    data: { isActive: true },
  })

  revalidatePath('/organiza/services')
}